import type { Request, Response } from "express";
import { AuthService } from "../services/authService";
import type { AuthRequest  } from "../types";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  validateLicense = async (req: Request, res: Response): Promise<void> => {
    try {
      const { license, ip, script_name } = req.body as AuthRequest;

      if (!license || typeof license !== "string" || license.length < 10) {
        res.status(400).json({
          success: false,
          message: "Licença inválida",
        });
        return;
      }

      if (!ip || typeof ip !== "string") {
        res.status(400).json({
          success: false,
          message: "IP inválido",
        });
        return;
      }

      if (!script_name || typeof script_name !== "string" || script_name.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Nome do script é obrigatório",
        });
        return;
      }

      const ipRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(ip)) {
        res.status(400).json({
          success: false,
          message: "Formato de IP inválido",
        });
        return;
      }

      const result = await this.authService.validateLicense({
        license: license.trim().toUpperCase(),
        ip: ip.trim(),
        script_name: script_name.trim(),
      });

      const statusCode = result.success ? 200 : 401;
      res.status(statusCode).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };

  createLicense = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, script_name, authorized_ips, expires_at } = req.body;

      if (!name || typeof name !== "string" || name.length < 3) {
        res.status(400).json({
          success: false,
          message: "Nome deve ter pelo menos 3 caracteres",
        });
        return;
      }

      if (!script_name || typeof script_name !== "string" || script_name.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Nome do script é obrigatório",
        });
        return;
      }

      if (
        !authorized_ips ||
        !Array.isArray(authorized_ips) ||
        authorized_ips.length === 0
      ) {
        res.status(400).json({
          success: false,
          message: "Pelo menos um IP autorizado é obrigatório",
        });
        return;
      }

      const ipRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const invalidIps = authorized_ips.filter((ip) => !ipRegex.test(ip));

      if (invalidIps.length > 0) {
        res.status(400).json({
          success: false,
          message: "IPs inválidos encontrados",
        });
        return;
      }

      const expiresAt = expires_at ? new Date(expires_at) : undefined;
      const licenseKey = await this.authService.createLicense(
        name.trim(),
        script_name.trim(),
        authorized_ips.map((ip) => ip.trim()),
        expiresAt
      );

      res.status(201).json({
        success: true,
        message: "Licença criada com sucesso",
        data: {
          license_key: licenseKey,
          script_name: script_name.trim(),
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor - create",
      });
    }
  };

  updateLicense = async (req: Request, res: Response): Promise<void> => {
    try {
      const { license_key } = req.params;
      const { name, script_name, authorized_ips, expires_at } = req.body;

      if (!license_key || typeof license_key !== "string") {
        res.status(400).json({
          success: false,
          message: "Chave de licença inválida",
        });
        return;
      }

      const updates: any = {};

      if (name !== undefined) {
        if (typeof name !== "string" || name.length < 3) {
          res.status(400).json({
            success: false,
            message: "Nome deve ter pelo menos 3 caracteres",
          });
          return;
        }
        updates.name = name.trim();
      }

      if (script_name !== undefined) {
        if (typeof script_name !== "string" || script_name.trim().length === 0) {
          res.status(400).json({
            success: false,
            message: "Nome do script não pode estar vazio",
          });
          return;
        }
        updates.script_name = script_name.trim();
      }

      if (authorized_ips !== undefined) {
        if (!Array.isArray(authorized_ips) || authorized_ips.length === 0) {
          res.status(400).json({
            success: false,
            message: "Pelo menos um IP autorizado é obrigatório",
          });
          return;
        }

        const ipRegex =
          /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const invalidIps = authorized_ips.filter((ip) => !ipRegex.test(ip));

        if (invalidIps.length > 0) {
          res.status(400).json({
            success: false,
            message: "IPs inválidos encontrados",
          });
          return;
        }
        
        updates.authorized_ips = authorized_ips.map((ip) => ip.trim());
      }

      if (expires_at !== undefined) {
        updates.expires_at = expires_at ? new Date(expires_at) : null;
      }

      const updated = await this.authService.updateLicense(
        license_key.trim().toUpperCase(),
        updates
      );

      if (updated) {
        res.json({
          success: true,
          message: "Licença atualizada com sucesso",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Licença não encontrada",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar licença:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };

  updateIps = async (req: Request, res: Response): Promise<void> => {
    try {
      const { license_key } = req.params;
      const { authorized_ips } = req.body;

      if (!license_key || typeof license_key !== "string") {
        res.status(400).json({
          success: false,
          message: "Chave de licença inválida",
        });
        return;
      }

      if (!Array.isArray(authorized_ips) || authorized_ips.length === 0) {
        res.status(400).json({
          success: false,
          message: "Pelo menos um IP autorizado é obrigatório",
        });
        return;
      }

      const ipRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const invalidIps = authorized_ips.filter((ip) => !ipRegex.test(ip));

      if (invalidIps.length > 0) {
        res.status(400).json({
          success: false,
          message: "IPs inválidos encontrados",
        });
        return;
      }

      const updated = await this.authService.updateAuthorizedIps(
        license_key.trim().toUpperCase(),
        authorized_ips.map((ip) => ip.trim())
      );

      if (updated) {
        res.json({
          success: true,
          message: "IPs atualizados com sucesso",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Licença não encontrada",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };

  getAllLicenses = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, status, script_name } = req.query;

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const limitNumber = limit ? parseInt(limit as string, 10) : 10;
      const statusFilter = status as
        | "active"
        | "inactive"
        | "expired"
        | "all"
        | undefined;
      const scriptFilter = script_name as string | undefined;

      const result = await this.authService.getAllLicenses(
        pageNumber,
        limitNumber,
        statusFilter,
        scriptFilter
      );

      res.json({
        success: true,
        message: "Licenças recuperadas com sucesso",
        data: result.licenses,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total: result.total,
          pages: Math.ceil(result.total / limitNumber),
        },
      });
    } catch (error) {
      console.error("Erro ao buscar licenças:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  };

  getAllLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        page, 
        limit, 
        license_id, 
        access_type, 
        date_from, 
        date_to,
        script_name 
      } = req.query;

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const limitNumber = limit ? parseInt(limit as string, 10) : 10;

      const filters = {
        license_id: license_id as string,
        access_type: access_type as "authorized" | "unauthorized",
        script_name: script_name as string,
        date_from: date_from ? new Date(date_from as string) : new Date(0),
        date_to: date_to ? new Date(date_to as string) : new Date(),
      };

      const result = await this.authService.getAllLogs(
        pageNumber,
        limitNumber,
        filters
      );

      res.json({
        success: true,
        message: "Logs recuperados com sucesso",
        data: result.logs,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total: result.total,
          pages: Math.ceil(result.total / limitNumber),
        },
      });
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  };

  getAvailableScripts = async (_req: Request, res: Response): Promise<void> => {
    try {
      const scripts = await this.authService.getAvailableScripts();

      res.json({
        success: true,
        message: "Scripts disponíveis recuperados com sucesso",
        data: scripts,
      });
    } catch (error) {
      console.error("Erro ao buscar scripts disponíveis:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  };

  deleteLicense = async (req: Request, res: Response): Promise<void> => {
    try {
      const { license_key } = req.params;

      if (!license_key || typeof license_key !== "string") {
        res.status(400).json({
          success: false,
          message: "Chave de licença inválida",
        });
        return;
      }

      const deleted = await this.authService.deleteLicense(
        license_key.trim().toUpperCase()
      );

      if (deleted) {
        res.json({
          success: true,
          message: "Licença deletada com sucesso",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Licença não encontrada",
        });
      }
    } catch (error) {
      console.error("Erro ao deletar licença:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  };
}