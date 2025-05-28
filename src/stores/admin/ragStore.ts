// stores/admin/ragStore.ts
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

export interface Rag {
  id: number;
  userId: number;
  userName: string;
  name: string;
  createTime: string;
}

export interface RagRequest {
  userId: number | null;
  name: string | null;
  createTime: string | null;
}

export interface RagQuery {
  userId: number | null;
  name: string | null;
  startCreateTime: string | null;
  endCreateTime: string | null;
  pageNo: number;
  pageSize: number;
}

export interface UserNameRequest {
  userName: string;
  pageNo: number;
  pageSize: number;
}

interface UserJustUserName {
  id: number;
  userName: string;
}

export interface RagState {
  loading: boolean;
  error: string | null;
  rags: Page<Rag>;
  user: Page<UserJustUserName>;
}

export const useRagStore = defineStore('rag', {
  state: (): RagState => ({
    loading: false,
    error: null,
    rags: {} as Page<Rag>,
    user: {} as Page<UserJustUserName>
  }),
  actions: {
    async fetchRags(query: RagQuery) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<Page<Rag>>>(
          '/api/admin/user-rag/page',
          query
        );
        if (response.data.code === 200) {
          this.rags = response.data.data;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async fetchUserName(request: UserNameRequest) {
      this.loading = true;
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
      this.loading = false;
    },
    async createRag(rag: RagRequest) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<void>>(
          '/api/admin/user-rag/create',
          rag
        );
        if (response.data.code === 200) {
          return;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async updateRag(rag: RagRequest) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.put<Response<void>>(
          '/api/admin/user-rag/update',
          rag
        );
        if (response.data.code === 200) {
          return;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async deleteRag(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<void>>(
          `/api/admin/user-rag/delete/${id}`
        );
        if (response.data.code === 200) {
          return;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error;
      } finally {
        this.loading = false;
      }
    }
  }
});
