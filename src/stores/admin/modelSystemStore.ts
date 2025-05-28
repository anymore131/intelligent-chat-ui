// stores/admin/modelSystemStore.ts
import { defineStore } from 'pinia';
import { tokenError } from '@/utils/error';
import axios from 'axios';

interface Response<T> {
  code: number;
  data: T;
  message: string;
}

interface Page<T> {
  pages: number;
  total: number;
  list: T[];
}

export interface System {
  id: number;
  userId: number | null;
  userName: string;
  name: string;
  description: string;
  accessPolicy: string;
  usedNumber: number;
  createTime: string;
}

export interface SystemQuery {
  userId: number | null;
  name: string | null;
  description: string | null;
  accessPolicy: string | null;
  usedNumber: number | null;
  startCreateTime: string | null;
  endCreateTime: string | null;
  pageNo: number;
  pageSize: number;
  isAsc: boolean;
  sortBy: string;
}

interface UserJustUserName {
  id: number;
  userName: string;
}

export interface UserNameRequest {
  userName: string;
  pageNo: number;
  pageSize: number;
}

interface SystemState {
  isLoading: boolean;
  error: string | null;
  systems: Page<System>;
  user: Page<UserJustUserName>;
}

export const useModelSystemStore = defineStore('modelSystem', {
  state: (): SystemState => {
    return {
      isLoading: false,
      error: null,
      systems: {} as Page<System>,
      user: {} as Page<UserJustUserName>
    };
  },
  actions: {
    async fetchSystems(query: SystemQuery) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<Page<System>>>(
          `/api/admin/system-message/page`,
          query
        );
        if (response.data.code === 200) {
          this.systems = response.data.data;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error.message;
      }
      this.isLoading = false;
    },
    async fetchUserName(request: UserNameRequest) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<Page<UserJustUserName>>>(
          '/api/admin/user/pageByUserName',
          request
        );
        if (response.data.code == 200) {
          this.user = response.data.data;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error.message;
      }
      this.isLoading = false;
    },
    async createSystem(system: System) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<void>>(
          `/api/admin/system-message/create`,
          system
        );
        if (response.data.code === 200) {
          return true;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error.message;
      }
      this.isLoading = false;
    },
    async updateSystem(system: System) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.put<Response<void>>(
          `/api/admin/system-message/update`,
          system
        );
        if (response.data.code === 200) {
          return true;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error.message;
      }
      this.isLoading = false;
    }
  }
});
