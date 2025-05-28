// stores/admin/modelStore.ts
import { defineStore } from 'pinia';
import { watch } from 'vue';
import type { WebSocketAdminR } from '@/stores/userStore';
import { useUserStore } from '@/stores/userStore';
import { tokenError } from '@/utils/error';
import axios from 'axios';

const userStore = useUserStore();

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

export interface Platform {
  id: number;
  userId: number;
  userName: string;
  platform: string;
  platformName: string;
  apiKey: string;
  apiAddress: string;
  createTime: string;
}

export interface Model {
  id: number;
  platformId: number;
  modelName: string;
  type: string;
  used: number;
  platformName: string;
  userId: number;
  platform: string;
  apiAddress: string;
  createTime: string;
  updateTime: string;
}

export interface AdminUser {
  id: number;
  userName: string;
  name: string;
}

export interface PlatformRequest {
  id: number | null;
  platform: string;
  platformName: string;
  apiKey: string;
  apiAddress: string;
}

export interface ModelQuery {
  platformId: number | null;
  userId: number | null;
  type: string | null;
  modelName: string | null;
  platformName: string | null;
  used: number | null;
  pageNo: number;
  pageSize: number;
  isAsc: boolean;
  sortBy: string;
}

export interface ModelRequest {
  id: number | null;
  platformId: number | null;
  type: string | null;
  modelName: string | null;
  used: number | null;
}

interface ModelUsageData {
  [modelName: string]: number;
}

interface HistoryEntry {
  timestamp: string;
  data: ModelUsageData;
}

interface ModelState {
  isLoading: boolean;
  error: string | null;
  platforms: Platform[];
  pageModel: Page<Model>;
  adminUser: AdminUser[];
  myPlatforms: Platform[];
  MAX_HISTORY_ENTRIES: number;
  modelHistoryData: HistoryEntry[];
}

export const useModelStore = defineStore('model', {
  state: (): ModelState => {
    return {
      isLoading: false,
      error: null,
      platforms: [],
      pageModel: {} as Page<Model>,
      adminUser: [],
      myPlatforms: [],
      MAX_HISTORY_ENTRIES: 1000,
      modelHistoryData: []
    };
  },
  actions: {
    async fetchPlatform() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get<Response<Platform[]>>(
          '/api/admin/language-platform/getAll'
        );
        if (response.data.code == 200) {
          this.platforms = response.data.data;
          this.myPlatforms = [];
          this.platforms.forEach((element) => {
            if (element.userId === userStore.id) {
              this.myPlatforms.push(element);
            }
          });
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
    async addPlatform(platform: PlatformRequest) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<Platform>>(
          '/api/admin/language-platform/add',
          platform
        );
        if (response.data.code == 200) {
          this.platforms.push(response.data.data);
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
    async updatePlatform(platform: PlatformRequest) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.put<Response<Platform>>(
          '/api/admin/language-platform/update',
          platform
        );
        if (response.data.code == 200) {
          const index = this.platforms.findIndex(
            (item) => item.id === platform.id
          );
          if (index !== -1) {
            this.platforms.splice(index, 1, response.data.data);
          }
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
    async deletePlatform(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.delete<Response<string>>(
          `/api/admin/language-platform/delete/${id}`
        );
        if (response.data.code === 200) {
          const index = this.platforms.findIndex((item) => item.id === id);
          this.platforms.splice(index, 1);
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
    async fetchModels(request: ModelQuery) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<Page<Model>>>(
          `/api/admin/language-model/page`,
          request
        );
        if (response.data.code === 200) {
          this.pageModel = response.data.data;
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
    async fetchAdmins() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get<Response<AdminUser[]>>(
          '/api/admin/user/getAdminUserList'
        );
        if (response.data.code === 200) {
          this.adminUser = response.data.data;
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
    async addModel(request: ModelRequest) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<AdminUser>>(
          '/api/admin/language-model/create',
          request
        );
        if (response.data.code === 200) {
          return;
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
    async deleteModel(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.delete<Response<string>>(
          `/api/admin/language-model/delete/${id}`
        );
        if (response.data.code === 200) {
          return;
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
    async updateModel(request: ModelRequest) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.put<Response<string>>(
          `/api/admin/language-model/update`,
          request
        );
        if (response.data.code === 200) {
          return;
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
    async startGetModelTimes() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<string>>(
          `/api/admin/language-model/times/start`
        );
        if (response.data.code === 200) {
          if (response.data.data === 'Task started') {
            return;
          } else {
            this.error = response.data.message;
          }
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
    async stopGetModelTimes() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<string>>(
          `/api/admin/language-model/times/stop`
        );
        if (response.data.code === 200) {
          if (response.data.data === 'Task stopped') {
            return;
          } else {
            this.error = response.data.message;
          }
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
    // 监听新消息
    setupWatchers() {
      watch(
        () => userStore.adminMessage,
        (newMessage: WebSocketAdminR) => {
          if (!newMessage || Object.keys(newMessage).length == 0) return;
          switch (newMessage.type) {
            case 'ADMIN':
              switch (newMessage.data.contentType) {
                case 1:
                  this.handleModelTimes(newMessage.data.data);
                  break;
              }
              break;
          }
        }
      );
    },
    handleModelTimes(data: string) {
      try {
        const jsonData = JSON.parse(data) as Record<string, number>;
        const now = new Date();

        // 添加新记录
        this.modelHistoryData.push({
          timestamp: now.toISOString(),
          data: jsonData
        });

        // 限制历史记录数量
        if (this.modelHistoryData.length > this.MAX_HISTORY_ENTRIES) {
          this.modelHistoryData.shift();
        }
      } catch (error) {
        console.error('Error parsing model times data:', error);
      }
    }
  }
});
