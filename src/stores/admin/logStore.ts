// stores/admin/logStore.ts
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

export interface Log {
  id: number;
  module: string;
  userId: number;
  userName: string;
  operationType: string;
  className: string;
  methodName: string;
  methodParams: string | null;
  returnValue: string | null;
  errorMessage: string | null;
  operationIp: string | null;
  createTime: string;
  executionTime: number;
}

export interface LogRequest {
  module: string | null;
  userId: number | null;
  operationType: string | null;
  startCreateTime: string | null;
  endCreateTime: string | null;
  minExecutionTime: number | null;
  error: number | null;
  pageNo: number;
  pageSize: number;
  isAsc: boolean;
  sortBy: string;
}

interface LogState {
  isLoading: boolean;
  error: string | null;
  logs: Page<Log[]>;
}

export const useLogStore = defineStore('log', {
  state: (): LogState => {
    return {
      isLoading: false,
      error: null,
      logs: {} as Page<Log[]>
    };
  },
  actions: {
    async fetchLogs(logRequest: LogRequest) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<Page<Log[]>>>(
          `/api/admin/log/page`,
          logRequest
        );
        if (response.data.code == 200) {
          this.logs = response.data.data;
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
