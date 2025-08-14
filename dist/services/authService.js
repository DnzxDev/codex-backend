"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = __importDefault(require("../config/database"));
class AuthService {
    async validateLicense(request) {
        try {
            const { data: license, error } = await database_1.default
                .from("licenses")
                .select("*")
                .eq("license_key", request.license)
                .eq("is_active", true)
                .single();
            if (error || !license) {
                return {
                    success: false,
                    message: "Licença não encontrada ou inativa",
                };
            }
            if (license.expires_at && new Date() > new Date(license.expires_at)) {
                return {
                    success: false,
                    message: "Licença expirada",
                };
            }
            if (request.script_name && license.script_name !== request.script_name) {
                await this.logUnauthorizedAttempt(license.id, request.ip, request.script_name, "script_not_authorized");
                return {
                    success: false,
                    message: "Script não autorizado para esta licença",
                };
            }
            if (!license.authorized_ips.includes(request.ip)) {
                await this.logUnauthorizedAttempt(license.id, request.ip, request.script_name, "ip_not_authorized");
                return {
                    success: false,
                    message: "IP não autorizado para esta licença",
                };
            }
            await this.logAuthorizedAccess(license.id, request.ip, request.script_name);
            return {
                success: true,
                message: "Licença válida",
                data: {
                    license_id: license.id,
                    script_name: license.script_name,
                    expires_at: license.expires_at,
                },
            };
        }
        catch (error) {
            console.error("Erro no validateLicense:", error);
            return {
                success: false,
                message: "Internal Server Error",
            };
        }
    }
    async createLicense(name, scriptName, authorizedIps, expiresAt) {
        const licenseKey = this.generateLicenseKey();
        const { error } = await database_1.default.from("licenses").insert({
            license_key: licenseKey,
            name,
            script_name: scriptName,
            authorized_ips: authorizedIps,
            expires_at: expiresAt || null,
        });
        if (error)
            throw error;
        return licenseKey;
    }
    async updateLicense(licenseKey, updates) {
        const updateData = {
            updated_at: new Date().toISOString(),
        };
        if (updates.name !== undefined)
            updateData.name = updates.name;
        if (updates.script_name !== undefined)
            updateData.script_name = updates.script_name;
        if (updates.authorized_ips !== undefined)
            updateData.authorized_ips = updates.authorized_ips;
        if (updates.expires_at !== undefined)
            updateData.expires_at = updates.expires_at;
        const { error } = await database_1.default
            .from("licenses")
            .update(updateData)
            .eq("license_key", licenseKey);
        return !error;
    }
    async updateAuthorizedIps(licenseKey, newIps) {
        return this.updateLicense(licenseKey, { authorized_ips: newIps });
    }
    async getAllLicenses(page = 1, limit = 10, status, scriptName) {
        try {
            let query = database_1.default
                .from("licenses")
                .select("*", { count: 'exact' });
            if (scriptName) {
                query = query.eq("script_name", scriptName);
            }
            if (status && status !== 'all') {
                switch (status) {
                    case 'active':
                        query = query
                            .eq("is_active", true)
                            .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
                        break;
                    case 'inactive':
                        query = query.eq("is_active", false);
                        break;
                    case 'expired':
                        query = query
                            .eq("is_active", true)
                            .not("expires_at", "is", null)
                            .lt("expires_at", new Date().toISOString());
                        break;
                }
            }
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            const { data: licenses, error, count } = await query
                .range(from, to)
                .order("created_at", { ascending: false });
            if (error) {
                throw error;
            }
            return {
                licenses: licenses || [],
                total: count || 0,
            };
        }
        catch (error) {
            console.error("Erro ao buscar licenças:", error);
            throw error;
        }
    }
    async getAllLogs(page = 1, limit = 10, filters) {
        try {
            let query = database_1.default
                .from("access_logs")
                .select(`
          *,
          licenses:license_id (
            license_key,
            name,
            script_name
          )
        `, { count: 'exact' });
            if (filters) {
                if (filters.license_id) {
                    query = query.eq("license_id", filters.license_id);
                }
                if (filters.access_type) {
                    query = query.eq("access_type", filters.access_type);
                }
                if (filters.script_name) {
                    query = query.eq("script_name", filters.script_name);
                }
                if (filters.date_from) {
                    query = query.gte("created_at", filters.date_from.toISOString());
                }
                if (filters.date_to) {
                    query = query.lte("created_at", filters.date_to.toISOString());
                }
            }
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            const { data: logs, error, count } = await query
                .range(from, to)
                .order("created_at", { ascending: false });
            if (error) {
                throw error;
            }
            return {
                logs: logs || [],
                total: count || 0,
            };
        }
        catch (error) {
            console.error("Erro ao buscar logs:", error);
            throw error;
        }
    }
    async getAvailableScripts() {
        try {
            const { data, error } = await database_1.default
                .from("licenses")
                .select("script_name")
                .not("script_name", "is", null);
            if (error)
                throw error;
            const uniqueScripts = [...new Set(data.map(item => item.script_name))];
            return uniqueScripts.sort();
        }
        catch (error) {
            console.error("Erro ao buscar scripts disponíveis:", error);
            return [];
        }
    }
    async deleteLicense(licenseKey) {
        try {
            const { data: license } = await database_1.default
                .from("licenses")
                .select("id")
                .eq("license_key", licenseKey)
                .single();
            if (!license) {
                return false;
            }
            const { error: logsError } = await database_1.default
                .from("access_logs")
                .delete()
                .eq("license_id", license.id);
            if (logsError) {
                console.error("Erro ao deletar logs:", logsError);
            }
            const { error: licenseError } = await database_1.default
                .from("licenses")
                .delete()
                .eq("license_key", licenseKey);
            return !licenseError;
        }
        catch (error) {
            console.error("Erro ao deletar licença:", error);
            throw error;
        }
    }
    async logAuthorizedAccess(licenseId, ip, scriptName) {
        await database_1.default.from("access_logs").insert({
            license_id: licenseId,
            ip_address: ip,
            script_name: scriptName || "unknown",
            access_type: "authorized",
            reason: null
        });
    }
    async logUnauthorizedAttempt(licenseId, ip, scriptName, reason) {
        await database_1.default.from("access_logs").insert({
            license_id: licenseId,
            ip_address: ip,
            script_name: scriptName || "unknown",
            access_type: "unauthorized",
            reason: reason || "unknown"
        });
    }
    generateLicenseKey() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 32; i++) {
            if (i > 0 && i % 8 === 0)
                result += "-";
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
exports.AuthService = AuthService;
