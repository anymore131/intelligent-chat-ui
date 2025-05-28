// stores/chatStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { tokenError } from '@/utils/error';
import type { RagItem } from './ragStore';

export interface InputImages {
  url: string;
  file: File;
}

interface ChatRequest {
  ragId: number | null;
  memoryId: string;
  message: string;
  deep: boolean;
  web: boolean;
}

interface MultiRequest {
  memoryId: string;
  message: string;
  file: File;
}

interface SystemRequest {
  ragId: number | null;
  memoryId: string;
  message: string;
}

interface SystemDetailResponse {
  code: number;
  message: string;
  data: SystemDetail;
}

interface SystemDetail {
  id: number;
  userId: number;
  name: string;
  description: string;
  accessPolicy: string;
  usedNumber: number;
  createTime: string;
}

export interface ChatHistoryRequest {
  lastId: number | null;
  memoryId: string;
  pageSize: number;
}

interface ChatHistoryResponse {
  code: number;
  message: string;
  data: ChatHistory[];
}

interface ChatHistory {
  id: number;
  type: string;
  contentsType: string;
  text: string;
  createTime: string;
}

interface chatState {
  chatHistory: ChatHistory[];
  isLoading: boolean;
  isChat: boolean;
  isWaiting: boolean;
  isAll: boolean;
  error: string | null;
  memoryId: string | null;
  imageList: string[];
  systemDetail: SystemDetail;
  useData: boolean;
  data: {
    inputText: string;
    deep: boolean;
    web: boolean;
    inputImages: InputImages;
    knowledgeBase: RagItem | null;
  };
}

export const useChatStore = defineStore('chat', {
  state: (): chatState => ({
    isLoading: false,
    error: null,
    isChat: false,
    isWaiting: false,
    isAll: false,
    memoryId: null,
    chatHistory: [],
    imageList: [],
    systemDetail: {} as SystemDetail,
    useData: false,
    data: {
      inputText: '',
      deep: false,
      web: false,
      inputImages: {} as InputImages,
      knowledgeBase: null
    }
  }),
  actions: {
    // 清空状态
    async clearState() {
      this.memoryId = null;
      this.isChat = false;
      this.chatHistory = [];
      this.imageList = [];
      this.systemDetail = {} as SystemDetail;
      this.isAll = false;
      this.error = null;
      this.isLoading = false;
      this.useData = false;
      this.data = {
        inputText: '',
        deep: false,
        web: false,
        inputImages: {} as InputImages,
        knowledgeBase: null
      };
    },
    // 获取聊天记录
    async fetchChatHistory(request: ChatHistoryRequest) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post<ChatHistoryResponse>(
          '/api/storage/getTexts',
          request
        );
        if (response.data.code == 200) {
          if (
            response.data.data.length !== request.pageSize ||
            (response.data.data.length == 0 && request.lastId == null)
          ) {
            this.isAll = true;
          }
          for (let i = 0; i < response.data.data.length; i++) {
            if (response.data.data[i].contentsType == 'IMAGE') {
              this.imageList = [...this.imageList, response.data.data[i].text];
            }
          }
          this.chatHistory = [...this.chatHistory, ...response.data.data];
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
        }
      } catch (error: any) {
        this.error = error.message;
      }
      this.isLoading = false;
    },

    // 初始化发送数据
    async initSend(
      inputText: string,
      deep: boolean,
      web: boolean,
      inputImages: InputImages,
      knowledgeBase: RagItem | null
    ) {
      this.useData = true;
      this.data.inputText = inputText?.trim();
      this.data.deep = deep;
      this.data.web = web;
      this.data.inputImages = inputImages;
      this.data.knowledgeBase = knowledgeBase;
    },

    // 获取角色详情
    async fetchSystemDetail(memoryId: string) {
      try {
        const response = await axios.get<SystemDetailResponse>(
          `/api/system-message/detail?memoryId=${memoryId}`
        );
        if (response.data.code == 200) {
          this.systemDetail = response.data.data;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = error.message;
      }
    },

    // 添加用户消息
    addUserMessage(message: { text: string; contentsType: string }) {
      this.chatHistory.unshift({
        id: Date.now(),
        type: 'USER',
        createTime: new Date().toISOString(),
        contentsType: message.contentsType,
        text: message.text
      });
    },

    // 添加AI消息
    addAIMessage(message: { text: string; contentsType: string }) {
      this.chatHistory.unshift({
        id: Date.now(),
        type: 'AI',
        createTime: new Date().toISOString(),
        contentsType: message.contentsType,
        text: message.text
      });
    },

    // 流式AI回复
    async streamChatResponse(request: ChatRequest) {
      this.isChat = true;
      this.isWaiting = true;
      try {
        const response = await fetch(`/api/chat/stream`, {
          method: 'POST', // 改为POST请求
          headers: {
            'Content-Type': 'application/json' // 添加内容类型
          },
          body: JSON.stringify({
            // 使用请求体传参
            ragId: request.ragId,
            memoryId: request.memoryId,
            message: request.message,
            deep: request.deep,
            web: request.web
          })
        });
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        // 创建初始AI消息
        this.addAIMessage({
          text: '',
          contentsType: 'TEXT'
        });
        if (reader) {
          this.isWaiting = false;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            // 更新最后一条AI消息内容
            const lastMessage = this.chatHistory.find((m) => m.type === 'AI');
            if (lastMessage) {
              lastMessage.text += chunk;
            }
          }
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '请求失败';
      } finally {
        this.isChat = false;
        this.isWaiting = false;
      }
    },

    // 多模态对话
    async multiStreamChatResponse(request: MultiRequest) {
      this.isChat = true;
      const formData = new FormData();
      formData.append('memoryId', request.memoryId);
      formData.append('message', request.message);
      formData.append('file', request.file);
      try {
        const response = await fetch(`/api/chat/multimodality`, {
          method: 'POST', // 改为POST请求
          body: formData
        });
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        // 创建初始AI消息
        this.addAIMessage({
          text: '',
          contentsType: 'TEXT'
        });
        if (reader) {
          this.isWaiting = false;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            // 更新最后一条AI消息内容
            const lastMessage = this.chatHistory.find((m) => m.type === 'AI');
            if (lastMessage) {
              lastMessage.text += chunk;
            }
          }
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '请求失败';
      } finally {
        this.isChat = false;
      }
    },

    // 角色对话
    async systemStreamChatResponse(request: SystemRequest) {
      this.isChat = true;
      try {
        const response = await fetch(`/api/chat/system/stream`, {
          method: 'POST', // 改为POST请求
          headers: {
            'Content-Type': 'application/json' // 添加内容类型
          },
          body: JSON.stringify({
            ragId: request.ragId,
            memoryId: request.memoryId,
            message: request.message
          })
        });
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        // 创建初始AI消息
        this.addAIMessage({
          text: '',
          contentsType: 'TEXT'
        });
        if (reader) {
          this.isWaiting = false;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            // 更新最后一条AI消息内容
            const lastMessage = this.chatHistory.find((m) => m.type === 'AI');
            if (lastMessage) {
              lastMessage.text += chunk;
            }
          }
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '请求失败';
      } finally {
        this.isChat = false;
      }
    }
  }
});
