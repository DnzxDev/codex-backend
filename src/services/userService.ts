import { supabase } from '../config/database';
import axios from 'axios';

export interface AuthorizedUser {
  id: string;
  discord_id: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export class AuthorizedUsersService {
  async isUserAuthorized(discordId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('authorized_users')
        .select('id')
        .eq('discord_id', discordId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Erro ao verificar autorização: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('PGRST116')) {
        return false;
      }
      throw error;
    }
  }

  async addAuthorizedUser(discordId: string): Promise<AuthorizedUser> {
    try {
      const { data, error } = await supabase
        .from('authorized_users')
        .insert({ discord_id: discordId })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Usuário já está autorizado');
        }
        throw new Error(`Erro ao adicionar usuário: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async removeAuthorizedUser(discordId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('authorized_users')
        .delete()
        .eq('discord_id', discordId);

      if (error) {
        throw new Error(`Erro ao remover usuário: ${error.message}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
  async getAllAuthorizedUsers(): Promise<AuthorizedUser[]> {
    try {
      const { data, error } = await supabase
        .from('authorized_users')
        .select('*')
        .order('discord_id');

      if (error) {
        throw new Error(`Erro ao listar usuários: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  async getDiscordUserInfo(discordId: string, botToken: string): Promise<DiscordUser> {
    try {
      const response = await axios.get(`https://discord.com/api/v10/users/${discordId}`, {
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Usuário não encontrado no Discord');
        }
        if (error.response?.status === 401) {
          throw new Error('Token do bot inválido');
        }
        throw new Error(`Erro da API do Discord: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Erro ao buscar informações do Discord');
    }
  }

  /**
   * Verifica se usuário está autorizado e retorna suas informações do Discord
   */
  async getAuthorizedUserWithDiscordInfo(discordId: string, botToken: string): Promise<{
    isAuthorized: boolean;
    discordUser?: DiscordUser;
  }> {
    try {
      const isAuthorized = await this.isUserAuthorized(discordId);
      
      if (!isAuthorized) {
        return { isAuthorized: false };
      }

      const discordUser = await this.getDiscordUserInfo(discordId, botToken);
      
      return {
        isAuthorized: true,
        discordUser,
      };
    } catch (error) {
      throw error;
    }
  }
}