import { Request, Response } from 'express';
import { AuthorizedUsersService } from '../services/userService';

export class AuthorizedUsersController {
  private authorizedUsersService: AuthorizedUsersService;

  constructor() {
    this.authorizedUsersService = new AuthorizedUsersService();
  }

  checkUserAuthorization = async (req: Request, res: Response) => {
    try {
      const { discordId } = req.params;

      if (!discordId) {
        return res.status(400).json({
          success: false,
          error: 'Discord ID é obrigatório',
        });
      }

      const isAuthorized = await this.authorizedUsersService.isUserAuthorized(discordId);

      return res.json({
        success: true,
        data: {
          discordId,
          isAuthorized,
        },
      });
    } catch (error) {
      console.error('Erro ao verificar autorização:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };

  authorizeUser = async (req: Request, res: Response) => {
    try {
      const { discordId } = req.body;

      if (!discordId) {
        return res.status(400).json({
          success: false,
          error: 'Discord ID é obrigatório',
        });
      }

      const user = await this.authorizedUsersService.addAuthorizedUser(discordId);

      return res.status(201).json({
        success: true,
        data: user,
        message: 'Usuário autorizado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao autorizar usuário:', error);
      
      if (error instanceof Error && error.message.includes('já está autorizado')) {
        return res.status(409).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };

  unauthorizeUser = async (req: Request, res: Response) => {
    try {
      const { discordId } = req.params;

      if (!discordId) {
        return res.status(400).json({
          success: false,
          error: 'Discord ID é obrigatório',
        });
      }

      await this.authorizedUsersService.removeAuthorizedUser(discordId);

      return res.json({
        success: true,
        message: 'Usuário removido da lista de autorizados',
      });
    } catch (error) {
      console.error('Erro ao remover autorização:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };

  listAuthorizedUsers = async (_req: Request, res: Response) => {
    try {
      const users = await this.authorizedUsersService.getAllAuthorizedUsers();

      return res.json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };
  getDiscordUserInfo = async (req: Request, res: Response) => {
    try {
      const { discordId } = req.params;
      const botToken = process.env.DISCORD_BOT_TOKEN;

      if (!discordId) {
        return res.status(400).json({
          success: false,
          error: 'Discord ID é obrigatório',
        });
      }

      if (!botToken) {
        return res.status(500).json({
          success: false,
          error: 'Token do bot Discord não configurado',
        });
      }

      const discordUser = await this.authorizedUsersService.getDiscordUserInfo(discordId, botToken);

      return res.json({
        success: true,
        data: discordUser,
      });
    } catch (error) {
      console.error('Erro ao buscar usuário Discord:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
          return res.status(404).json({
            success: false,
            error: error.message,
          });
        }
        if (error.message.includes('Token do bot inválido')) {
          return res.status(401).json({
            success: false,
            error: error.message,
          });
        }
      }

      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };

  getUserProfile = async (req: Request, res: Response) => {
    try {
      const { discordId } = req.params;
      const botToken = process.env.DISCORD_BOT_TOKEN;

      if (!discordId) {
        return res.status(400).json({
          success: false,
          error: 'Discord ID é obrigatório',
        });
      }

      if (!botToken) {
        return res.status(500).json({
          success: false,
          error: 'Token do bot Discord não configurado',
        });
      }

      const result = await this.authorizedUsersService.getAuthorizedUserWithDiscordInfo(
        discordId,
        botToken
      );

      if (!result.isAuthorized) {
        return res.status(403).json({
          success: false,
          error: 'Usuário não está autorizado',
          data: {
            discordId,
            isAuthorized: false,
          },
        });
      }

      return res.json({
        success: true,
        data: {
          discordId,
          isAuthorized: true,
          discordUser: result.discordUser,
        },
      });
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
          return res.status(404).json({
            success: false,
            error: error.message,
          });
        }
        if (error.message.includes('Token do bot inválido')) {
          return res.status(401).json({
            success: false,
            error: error.message,
          });
        }
      }

      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };
}