// stores/admin/fileStore.ts
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

export interface RagFile {
  id: number;
  ragId: number;
  userId: number;
  ragName: string;
  userName: string;
  fileName: string;
  fileContent: string;
  createTime: string;
}

export interface MessageFile {
  id: number;
  userId: number;
  userName: string;
  fileName: string;
  filePath: string;
  createTime: string;
}

export interface AvatarFile {
  id: number;
  userId: number;
  userName: string;
  path: string;
  status: number;
  createTime: string;
  updateTime: string;
}

export interface RagFileRequest {
  ragId: number | null;
  fileName: string | null;
  path: string | null;
  startCreateTime: string | null;
  endCreateTime: string | null;
  pageNo: number;
  pageSize: number;
}

export interface MessageFileRequest {
  userId: number | null;
  fileName: string | null;
  path: string | null;
  startCreateTime: string | null;
  endCreateTime: string | null;
  pageNo: number;
  pageSize: number;
}

export interface AvatarFileRequest {
  userId: number | null;
  status: number | null;
  path: string | null;
  startCreateTime: string | null;
  endCreateTime: string | null;
  pageNo: number;
  pageSize: number;
}

interface FileState {
  isLoading: boolean;
  error: string | null;
  ragFiles: Page<RagFile[]>;
  messageFiles: Page<MessageFile[]>;
  avatarFiles: Page<AvatarFile[]>;
}

export const useFileStore = defineStore('file', {
  state: (): FileState => {
    return {
      isLoading: false,
      error: null,
      ragFiles: {} as Page<RagFile[]>,
      messageFiles: {} as Page<MessageFile[]>,
      avatarFiles: {} as Page<AvatarFile[]>
    };
  },
  actions: {
    async fetchRagFiles(request: RagFileRequest) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<Page<RagFile[]>>>(
          `/api/admin/file/rag/page`,
          request
        );
        if (response.data.code === 200) {
          this.ragFiles = response.data.data;
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
    async fetchMessageFiles(request: MessageFileRequest) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<Page<MessageFile[]>>>(
          `/api/admin/file/messages/page`,
          request
        );
        if (response.data.code === 200) {
          this.messageFiles = response.data.data;
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
    async fetchAvatarFiles(request: AvatarFileRequest) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<Page<AvatarFile[]>>>(
          `/api/admin/file/avatar/page`,
          request
        );
        if (response.data.code === 200) {
          this.avatarFiles = response.data.data;
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
