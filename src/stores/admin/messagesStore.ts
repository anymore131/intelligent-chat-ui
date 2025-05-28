// stores/admin/messagesStore.ts
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

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  content: string;
  contentType: number;
  createTime: string;
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

export interface MessagesRequest {
  id: number | null;
  senderId: number | null;
  receiverId: number | null;
  content: string | null;
  contentType: number | null;
  createTime: string | null;
}

export interface MessageQuery {
  senderId: number[] | null;
  receiverId: number[] | null;
  content: string | null;
  contentType: number[] | null;
  startTime: string | null;
  endTime: string | null;
  pageNo: number;
  pageSize: number;
}

interface MessagesState {
  isLoading: boolean;
  error: string | null;
  messages: Page<Message>;
  user: Page<UserJustUserName>;
}

export const useMessagesStore = defineStore('messages', {
  state: (): MessagesState => {
    return {
      isLoading: false,
      error: null,
      messages: {} as Page<Message>,
      user: {} as Page<UserJustUserName>
    };
  },
  actions: {
    async fetchMessages(request: MessageQuery) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<Page<Message>>>(
          `/api/admin/user-messages/page`,
          request
        );
        if (response.data.code === 200) {
          this.messages = response.data.data;
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
    async deleteMessages(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.delete<Response<void>>(
          `/api/admin/user-messages/delete/${id}`
        );
        if (response.data.code === 200) {
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
    async updateMessages(request: MessagesRequest) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.put<Response<void>>(
          `/api/admin/user-messages/update`,
          request
        );
        if (response.data.code === 200) {
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
    async createMessages(request: MessagesRequest) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<Response<void>>(
          `/api/admin/user-messages/create`,
          request
        );
        if (response.data.code === 200) {
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
    async createMessagesWithFile(
      senderId: number,
      receiverId: number,
      contentType: number,
      createTime: string | null,
      file: File
    ) {
      this.isLoading = true;
      this.error = null;
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('senderId', senderId.toString());
        formData.append('receiverId', receiverId.toString());
        formData.append('contentType', contentType.toString());
        if (createTime) {
          formData.append('createTime', createTime);
        }
        const response = await axios.post<Response<void>>(
          `/api/admin/user-messages/createWithFile`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        if (response.data.code === 200) {
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
