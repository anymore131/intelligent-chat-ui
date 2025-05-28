// stores/memoryStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { tokenError } from '@/utils/error';
import { useChatStore } from './chatStore';

const chatStore = useChatStore();

// 定义类型接口
interface ChatItem {
  id: number;
  memoryId: string;
  name: string;
  system: boolean;
  time: string;
}

interface MessageContent {
  type: string;
  text: string;
}

interface Message {
  id?: number;
  type: 'sent' | 'received';
  content: MessageContent;
  rawTime: string;
  time: string;
  status?: 'sent' | 'typing';
}

interface ChatResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface ChatResponseItem {
  id: number;
  memoryId: string;
  name?: string;
  system: boolean;
  createTime: string;
}

interface MessageResponseItem {
  type: 'USER' | 'AI';
  contentsType: string;
  text: string;
  createTime: string;
}

interface MemoryState {
  chats: ChatItem[];
  loading: boolean;
  error: string | null;
  selectedChatId: string | null;
  selectedChat: ChatItem | null;
  currentMessages: Message[];
  messagesLoading: boolean;
  messagesError: string | null;
}

export const useMemoryStore = defineStore('memory', {
  state: (): MemoryState => ({
    chats: [],
    loading: false,
    error: null,
    selectedChatId: null,
    selectedChat: null,
    currentMessages: [],
    messagesLoading: false,
    messagesError: null
  }),

  actions: {
    // 清空状态
    async clearState() {
      this.chats = [];
      this.loading = false;
      this.error = null;
      this.selectedChatId = null;
      this.selectedChat = null;
      this.currentMessages = [];
      this.messagesLoading = false;
      this.messagesError = null;
    },
    // 获取聊天记录
    async fetchChats() {
      this.loading = true;
      try {
        const response = await axios.get<ChatResponse<ChatResponseItem[]>>(
          '/api/memory'
        );
        if (response.data.code === 200) {
          this.chats = response.data.data.map((item) => ({
            id: item.id,
            memoryId: item.memoryId,
            name: item.name || `未命名对话 ${item.createTime.slice(0, 10)}`,
            system: item.system,
            time: this.formatTime(item.createTime)
          }));
          this.error = null;
        } else {
          tokenError(response.data.message);
          this.error = response.data.message;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = '获取对话记录失败';
      } finally {
        this.loading = false;
      }
    },

    async selectNull() {
      this.selectedChatId = null;
      this.selectedChat = null;
      chatStore.clearState();
    },

    // 选择聊天
    async selectChat(memoryId: string) {
      this.selectedChatId = memoryId;
      this.selectedChat =
        this.chats.find((chat) => chat.memoryId === memoryId) ?? null;
      chatStore.memoryId = memoryId;
    },

    // 修改名称
    async changeMemoryName(memoryId: string, newName: string) {
      const formData = new FormData();
      formData.append('memoryId', memoryId);
      formData.append('name', newName);
      try {
        const response = await axios.put(`/api/memory/changeName`, formData);
        if (response.data.code == 200) {
          ElMessage.success('修改成功');
          const chatIndex = this.chats.findIndex(
            (chat) => chat.memoryId === memoryId
          );
          if (chatIndex !== -1) {
            this.chats[chatIndex].name = newName;
          } else {
            this.selectedChat =
              this.chats.find((chat) => chat.memoryId === memoryId) ?? null;
          }
        } else {
          tokenError(response.data.message);
          ElMessage.error(response.data.message);
        }
      } catch (err: any) {
        tokenError(err.response?.data?.message);
        ElMessage.error('修改失败');
      }
    },

    // 删除对话
    async deleteMemory(memoryId: string) {
      try {
        const response = await axios.delete(`/api/memory?memoryId=${memoryId}`);
        if (response.data.code == 200) {
          ElMessage.success('删除成功');
          this.selectedChatId = null;
          this.selectedChat = null;
          chatStore.clearState();
          this.fetchChats();
          return true;
        } else {
          tokenError(response.data.message);
          ElMessage.error(response.data.message);
          return false;
        }
      } catch (err: any) {
        tokenError(err.response?.data?.message);
        ElMessage.error('删除失败');
        return false;
      }
    },

    async createMemory() {
      try {
        const response = await axios.post<ChatResponse<ChatResponseItem>>(
          '/api/memory'
        );
        if (response.data.code == 200) {
          this.fetchChats();
          const memoryId = response.data.data.memoryId;
          return memoryId;
        } else {
          tokenError(response.data.message);
          ElMessage.error(response.data.message);
        }
      } catch (err: any) {
        tokenError(err.response?.data?.message);
        ElMessage.error('创建失败');
        return false;
      }
    },

    // 格式化时间
    formatTime(time: string): string {
      try {
        const date = new Date(time);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
          date.getSeconds()
        )}`;
      } catch {
        return '--:--:--';
      }
    }
  },

  getters: {}
});
