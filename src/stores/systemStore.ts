// stores/systemStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { tokenError } from '@/utils/error';

interface SystemsResponse {
  code: number;
  message: string;
  data: System[];
}

export interface System {
  id: number;
  userId: number;
  name: string;
  description: string;
  accessPolicy: string;
  usedNumber: string;
  createTime: string;
}

interface SystemResponse {
  code: number;
  message: string;
  data: System;
}

export interface SystemRequest {
  id: number | null;
  name: string;
  description: string;
  accessPolicy: string;
}

interface SystemUsedResponse {
  code: number;
  message: string;
  data: SystemUsed;
}

interface SystemUsed {
  id: number;
  systemId: number;
  memoryId: string;
  createTime: string;
}

interface SystemUserResponse {
  code: number;
  message: string;
  data: SystemUser;
}

export interface SystemUser {
  id: number;
  userName: string;
  name: string;
  createTime: string;
}

interface SystemState {
  loading: boolean;
  error: string | null;
  systems: System[];
  selectedId: number | null;
  selectedSystem: System | null;
  systemUser: SystemUser | null;
  createdMemoryId: string | null;
}

export const useSystemStore = defineStore('system', {
  state: (): SystemState => ({
    loading: false,
    error: null,
    systems: [],
    selectedId: null,
    selectedSystem: null,
    systemUser: null,
    createdMemoryId: null
  }),
  actions: {
    async clearState() {
      this.loading = false;
      this.error = null;
      this.selectedId = null;
      this.selectedSystem = null;
      this.systemUser = null;
    },
    // 获取角色列表
    async fetchSystems() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get<SystemsResponse>(
          '/api/system-message'
        );
        if (response.data.code === 200) {
          this.systems = response.data.data;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message || '获取角色失败';
        }
      } catch (err: any) {
        tokenError(err.response?.data?.message);
        this.error = '获取角色失败';
      } finally {
        this.loading = false;
      }
    },

    // 选择角色
    async selectedById(id: number) {
      this.clearState();
      this.selectedId = id;
      this.selectedSystem =
        this.systems.find((system) => system.id === id) ?? null;
      this.fetchSystemUser(this.selectedSystem?.userId!);
    },

    // 创建角色
    async createSystem(system: SystemRequest) {
      this.loading = true;
      const formData = new FormData();
      formData.append('name', system.name);
      formData.append('description', system.description);
      formData.append('accessPolicy', system.accessPolicy);
      try {
        const response = await axios.post<SystemResponse>(
          `/api/system-message`,
          formData
        );
        if (response.data.code == 200) {
          this.fetchSystems().then(() => {
            this.selectedById(response.data.data.id);
          });
          return true;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
          return false;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 修改角色
    async updateSystem(system: SystemRequest) {
      this.loading = true;
      try {
        const response = await axios.put(`/api/system-message`, system);
        if (response.data.code == 200) {
          this.fetchSystems().then(() => {
            this.selectedSystem =
              this.systems.find((s) => s.id === this.selectedId) ?? null;
          });
          return true;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
          return false;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 删除角色
    async deleteSystem(id: number) {
      this.loading = true;
      try {
        const response = await axios.delete(`/api/system-message/${id}`);
        if (response.data.code == 200) {
          this.fetchSystems();
          this.selectedId = null;
          return true;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
          return false;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    // 创建会话
    async createChat(systemId: number) {
      this.loading = true;
      try {
        const response = await axios.post<SystemUsedResponse>(
          `/api/system-used?systemId=${systemId}`
        );
        if (response.data.code == 200) {
          this.createdMemoryId = response.data.data.memoryId;
          return true;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
          return false;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error.message;
        return false;
      }
    },
    // 获取用户信息
    async fetchSystemUser(userId: number) {
      this.loading = true;
      try {
        const response = await axios.get<SystemUserResponse>(
          `/api/user/${userId}`
        );
        if (response.data.code == 200) {
          this.systemUser = response.data.data;
          return true;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
          return false;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    }
  },
  getters: {}
});
