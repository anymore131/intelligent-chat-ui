// stores/ragStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { tokenError } from '@/utils/error';

export interface RagItem {
  id: number;
  name: string;
  createTime: string;
}

interface RagFile {
  id: string;
  ragId: string;
  fileName: string;
  fileContent: string;
  createTime: string;
}

interface RagResponse {
  code: number;
  message: string;
  data: RagItem[] | RagItem | RagFile[];
}

interface RagStoreState {
  ragList: RagItem[];
  currentRagId: number | null;
  ragFiles: RagFile[];
  loading: boolean;
  error: string | null;
}

export const useRagStore = defineStore('rag', {
  state: (): RagStoreState => ({
    ragList: [],
    currentRagId: null,
    ragFiles: [],
    loading: false,
    error: null
  }),

  actions: {
    // 清空状态
    async clearState() {
      this.ragList = [];
      this.currentRagId = null;
      this.ragFiles = [];
      this.loading = false;
      this.error = null;
    },
    // 获取用户所有知识库
    async fetchRagList() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get<RagResponse>('/api/user-rag');
        if (response.data.code === 200) {
          this.ragList = response.data.data as RagItem[];
        } else {
          tokenError(response.data.message);
          this.error = response.data.message || '获取知识库列表失败';
          return false;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = '网络请求失败';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 创建新知识库
    async createRag(name: string) {
      this.loading = true;
      this.error = null;

      try {
        const formData = new FormData();
        formData.append('name', name);
        const response = await axios.post<RagResponse>(
          '/api/user-rag',
          formData
        );
        if (response.data.code === 200) {
          await this.fetchRagList(); // 创建成功后刷新列表
          return true;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message || '创建知识库失败';
          return false;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = '网络请求失败';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 获取知识库文件列表
    async fetchRagFiles(ragId: number) {
      this.loading = true;
      this.error = null;
      this.currentRagId = ragId;
      try {
        const response = await axios.get<RagResponse>(
          `/api/rag-file/list?ragId=${ragId}`
        );

        if (response.data.code === 200) {
          this.ragFiles = response.data.data as RagFile[];
        } else {
          tokenError(response.data.message);
          this.error = response.data.message || '获取文件列表失败';
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = '网络请求失败';
      } finally {
        this.loading = false;
      }
    },

    // 上传文件到知识库
    async uploadFile(file: File, ragId: number) {
      this.loading = true;
      this.error = null;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('ragId', ragId.toString());
        const response = await axios.post<RagResponse>(
          '/api/rag-file/load',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        if (response.data.code === 200) {
          await this.fetchRagFiles(ragId); // 上传成功后刷新文件列表
          return true;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message || '文件上传失败';
          return false;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = '网络请求失败';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 更新知识库名称
    async updateRagName(ragId: number, newName: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.put<RagResponse>(
          `/api/user-rag?id=${ragId}&name=${encodeURIComponent(newName)}`
        );
        if (response.data.code === 200) {
          await this.fetchRagList(); // 更新成功后刷新列表
          return true;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message || '修改名称失败';
          return false;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = '网络请求失败';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 删除知识库
    async deleteRag(ragId: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.delete<RagResponse>(
          `/api/user-rag?id=${ragId}`
        );
        if (response.data.code === 200) {
          await this.fetchRagList(); // 删除成功后刷新列表
          this.currentRagId = null;
          return true;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message || '删除知识库失败';
          return false;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = '网络请求失败';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 选择知识库
    setCurrentRag(ragId: number | null) {
      this.currentRagId = ragId;
    }
  },

  getters: {
    // 获取当前选中的知识库
    currentRag: (state) => {
      return state.ragList.find((rag) => rag.id === state.currentRagId) || null;
    },

    // 按创建时间排序的知识库列表
    sortedRagList: (state) => {
      return [...state.ragList].sort(
        (a, b) =>
          new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      );
    },

    // 按创建时间排序的文件列表
    sortedRagFiles: (state) => {
      return [...state.ragFiles].sort(
        (a, b) =>
          new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      );
    }
  }
});
