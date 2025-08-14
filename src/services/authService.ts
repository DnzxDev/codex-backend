import supabase from "../config/database"
import type { AuthRequest, AuthResponse } from "../types"

interface LicenseFilters {
  license_id?: string
  access_type?: 'authorized' | 'unauthorized'
  date_from?: Date
  date_to?: Date
  script_name?: string 
}

export class AuthService {
  async validateLicense(request: AuthRequest): Promise<AuthResponse> {
    try {
      const { data: license, error } = await supabase
        .from("licenses")
        .select("*")
        .eq("license_key", request.license)
        .eq("is_active", true)
        .single()

      if (error || !license) {
        return {
          success: false,
          message: "Licença não encontrada ou inativa",
        }
      }

      if (license.expires_at && new Date() > new Date(license.expires_at)) {
        return {
          success: false,
          message: "Licença expirada",
        }
      }

      if (request.script_name && license.script_name !== request.script_name) {
        await this.logUnauthorizedAttempt(license.id, request.ip, request.script_name, "script_not_authorized")
        return {
          success: false,
          message: "Script não autorizado para esta licença",
        }
      }

      if (!license.authorized_ips.includes(request.ip)) {
        await this.logUnauthorizedAttempt(license.id, request.ip, request.script_name, "ip_not_authorized")
        return {
          success: false,
          message: "IP não autorizado para esta licença",
        }
      }

      await this.logAuthorizedAccess(license.id, request.ip, request.script_name)

      return {
        success: true,
        message: "Licença válida",
        data: {
          license_id: license.id,
          script_name: license.script_name,
          expires_at: license.expires_at,
        },
      }
    } catch (error) {
      console.error("Erro no validateLicense:", error);
      return {
        success: false,
        message: "Internal Server Error",
      }
    }
  }

  async createLicense(
    name: string, 
    scriptName: string, 
    authorizedIps: string[], 
    expiresAt?: Date
  ): Promise<string> {
    const licenseKey = this.generateLicenseKey()

    const { error } = await supabase.from("licenses").insert({
      license_key: licenseKey,
      name,
      script_name: scriptName,
      authorized_ips: authorizedIps,
      expires_at: expiresAt || null,
    })

    if (error) throw error
    return licenseKey
  }

  async updateLicense(
    licenseKey: string, 
    updates: {
      name?: string,
      script_name?: string,
      authorized_ips?: string[],
      expires_at?: Date | null
    }
  ): Promise<boolean> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.script_name !== undefined) updateData.script_name = updates.script_name
    if (updates.authorized_ips !== undefined) updateData.authorized_ips = updates.authorized_ips
    if (updates.expires_at !== undefined) updateData.expires_at = updates.expires_at

    const { error } = await supabase
      .from("licenses")
      .update(updateData)
      .eq("license_key", licenseKey)

    return !error
  }

  async updateAuthorizedIps(licenseKey: string, newIps: string[]): Promise<boolean> {
    return this.updateLicense(licenseKey, { authorized_ips: newIps })
  }

  async getAllLicenses(
    page: number = 1,
    limit: number = 10,
    status?: 'active' | 'inactive' | 'expired' | 'all',
    scriptName?: string
  ): Promise<{ licenses: any[]; total: number }> {
    try {
      let query = supabase
        .from("licenses")
        .select("*", { count: 'exact' })

      if (scriptName) {
        query = query.eq("script_name", scriptName)
      }

      if (status && status !== 'all') {
        switch (status) {
          case 'active':
            query = query
              .eq("is_active", true)
              .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
            break
          case 'inactive':
            query = query.eq("is_active", false)
            break
          case 'expired':
            query = query
              .eq("is_active", true)
              .not("expires_at", "is", null)
              .lt("expires_at", new Date().toISOString())
            break
        }
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data: licenses, error, count } = await query
        .range(from, to)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      return {
        licenses: licenses || [],
        total: count || 0,
      }
    } catch (error) {
      console.error("Erro ao buscar licenças:", error)
      throw error
    }
  }

  async getAllLogs(
    page: number = 1,
    limit: number = 10,
    filters?: LicenseFilters
  ): Promise<{ logs: any[]; total: number }> {
    try {
      let query = supabase
        .from("access_logs")
        .select(`
          *,
          licenses:license_id (
            license_key,
            name,
            script_name
          )
        `, { count: 'exact' })

      if (filters) {
        if (filters.license_id) {
          query = query.eq("license_id", filters.license_id)
        }

        if (filters.access_type) {
          query = query.eq("access_type", filters.access_type)
        }

        if (filters.script_name) {
          query = query.eq("script_name", filters.script_name)
        }

        if (filters.date_from) {
          query = query.gte("created_at", filters.date_from.toISOString())
        }

        if (filters.date_to) {
          query = query.lte("created_at", filters.date_to.toISOString())
        }
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data: logs, error, count } = await query
        .range(from, to)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      return {
        logs: logs || [],
        total: count || 0,
      }
    } catch (error) {
      console.error("Erro ao buscar logs:", error)
      throw error
    }
  }

  async getAvailableScripts(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("licenses")
        .select("script_name")
        .not("script_name", "is", null)

      if (error) throw error

      const uniqueScripts = [...new Set(data.map(item => item.script_name))]
      return uniqueScripts.sort()
    } catch (error) {
      console.error("Erro ao buscar scripts disponíveis:", error)
      return []
    }
  }

  async deleteLicense(licenseKey: string): Promise<boolean> {
    try {
      const { data: license } = await supabase
        .from("licenses")
        .select("id")
        .eq("license_key", licenseKey)
        .single()

      if (!license) {
        return false
      }

      const { error: logsError } = await supabase
        .from("access_logs")
        .delete()
        .eq("license_id", license.id)

      if (logsError) {
        console.error("Erro ao deletar logs:", logsError)
      }

      const { error: licenseError } = await supabase
        .from("licenses")
        .delete()
        .eq("license_key", licenseKey)

      return !licenseError
    } catch (error) {
      console.error("Erro ao deletar licença:", error)
      throw error
    }
  }


  private async logAuthorizedAccess(
    licenseId: string, 
    ip: string, 
    scriptName?: string
  ): Promise<void> {
    await supabase.from("access_logs").insert({
      license_id: licenseId,
      ip_address: ip,
      script_name: scriptName || "unknown",
      access_type: "authorized",
      reason: null
    })
  }

  private async logUnauthorizedAttempt(
    licenseId: string, 
    ip: string, 
    scriptName?: string,
    reason?: string
  ): Promise<void> {
    await supabase.from("access_logs").insert({
      license_id: licenseId,
      ip_address: ip,
      script_name: scriptName || "unknown",
      access_type: "unauthorized",
      reason: reason || "unknown"
    })
  }

  private generateLicenseKey(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""

    for (let i = 0; i < 32; i++) {
      if (i > 0 && i % 8 === 0) result += "-"
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return result
  }
}