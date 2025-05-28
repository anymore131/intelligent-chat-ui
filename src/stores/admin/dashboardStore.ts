// stores/admin/dashboardStore.ts
import { defineStore } from 'pinia';
import { tokenError } from '@/utils/error';
import axios from 'axios';

interface Response<T> {
  code: number;
  data: T;
  message: string;
}

export interface Chat {
  chat: number;
  deep: number;
  multi: number;
  rag: number;
  web: number;
}

export interface Normal {
  admin: number;
  user: number;
  system: number;
  rag: number;
}

interface Dashboard {
  isLoading: boolean;
  error: string | null;
  chat: Chat;
  normal: Normal;
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): Dashboard => {
    return {
      isLoading: false,
      error: null,
      chat: {
        chat: 0,
        deep: 0,
        multi: 0,
        rag: 0,
        web: 0
      },
      normal: {
        admin: 0,
        user: 0,
        system: 0,
        rag: 0
      }
    };
  },
  actions: {
    async getDashboard() {
      this.isLoading = true;
      this.error = null;
      try {
        const chat = await axios.get<Response<Chat>>(
          `/api/admin/daily-count/init/chat`
        );
        const normal = await axios.get<Response<Normal>>(
          `/api/admin/daily-count/init/normal`
        );
        if (chat.data.code == 200) {
          this.chat = chat.data.data as Chat;
        } else {
          this.error = chat.data.message;
        }
        if (normal.data.code == 200) {
          this.normal = normal.data.data as Normal;
        } else {
          tokenError(normal.data.message);
          this.error = normal.data.message;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error.message;
      }
      this.isLoading = false;
    }
  }
});
