// stores/messageStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Action } from 'element-plus';
import { useUserStore } from './userStore.ts';
import type { Contact } from './contactStore.ts';
import type { WebSocketR } from './userStore.ts';
import { currentTime } from '@/utils/time';
import { tokenError } from '@/utils/error';
import { truncateString } from '@/utils/string';

const userStore = useUserStore();

interface MessageRequest {
  lastId: number | null;
  senderId: number;
  receiverId: number;
  pageSize: number;
}

interface Response<T> {
  code: number;
  message: string;
  data: T[] | T;
}

interface ChatList {
  id: number;
  contactId: number;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string | null;
  unreadCount: number;
  isPinned: number;
  name: string;
  contactType: number;
  createTime: string;
  updateTime: string | null;
}

export interface Message {
  id: number;
  senderId: number | null;
  receiverId: number;
  content: string;
  contentType: number;
  createTime: string;
}

interface MessageState {
  chatListLoading: boolean;
  loading: boolean;
  error: string | null;
  selectedContactId: number | null;
  selectedContact: ChatList | null;
  chatLists: ChatList[];
  message: Message | null;
  messages: Message[];
  isAll: boolean;
}

export const useMessageStore = defineStore('message', {
  state: (): MessageState => ({
    chatListLoading: false,
    loading: false,
    error: null,
    selectedContactId: null,
    selectedContact: null,
    chatLists: [],
    message: null,
    messages: [],
    isAll: false
  }),
  actions: {
    // 清除状态
    clearState() {
      this.chatListLoading = false;
      this.loading = false;
      this.error = null;
      this.selectedContactId = null;
      this.selectedContact = null;
      this.chatLists = [];
      this.message = null;
      this.messages = [];
      this.isAll = false;
    },
    // 获取聊天列表
    async fetchChatList() {
      this.chatListLoading = true;
      try {
        const response = await axios.get<Response<ChatList>>(
          '/api/user-chat-list/getChatList'
        );
        if (response.data.code == 200) {
          this.chatLists = response.data.data as ChatList[];
          // 补充聊天对象信息
          const contactResponse = await axios.post<Response<Contact>>(
            '/api/user-contact/list',
            JSON.stringify({
              contactType: 1,
              status: 1
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
          if (contactResponse.data.code == 200) {
            const contacts = contactResponse.data.data as Contact[];
            this.chatLists.forEach((chatList) => {
              const contact = contacts.find(
                (c) => c.contactId === chatList.contactId
              );
              if (contact) {
                chatList.avatar = contact.avatar;
              }
            });
          } else {
            tokenError(response.data.message);
            ElMessage.error(contactResponse.data.message);
          }
        } else {
          tokenError(response.data.message);
          ElMessage.error(response.data.message);
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        ElMessage.error('获取聊天列表失败');
      } finally {
        this.chatListLoading = false;
      }
    },

    // 获取消息历史记录
    async fetchMessages(request: MessageRequest) {
      this.loading = true;
      try {
        const response = await axios.post<Response<Message[]>>(
          `/api/user-messages`,
          request
        );
        if (response.data.code == 200) {
          if (
            response.data.data.length !== request.pageSize ||
            (response.data.data.length == 0 && request.lastId == null)
          ) {
            this.isAll = true;
          }
          const date = response.data.data as Message[];
          date.sort((a, b) => {
            return b.id - a.id;
          });
          this.messages = [...this.messages, ...(date as Message[])];
        } else {
          tokenError(response.data.message);
          ElMessage.error(response.data.message);
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        ElMessage.error('获取聊天记录失败');
      } finally {
        this.loading = false;
      }
    },

    // 新建聊天对象
    async createChat(contactId: number) {
      try {
        const response = await axios.post<Response<string>>(
          `/api/user-chat-list/create?contactId=${contactId}`
        );
        if (response.data.code == 200) {
          return true;
        } else {
          tokenError(response.data.message);
          ElMessage.error(response.data.message);
          return false;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        ElMessage.error('获取聊天记录失败');
      }
    },

    // 选择聊天对象
    async selectContact(contactId: number) {
      this.selectedContactId = contactId;
      this.selectedContact =
        this.chatLists.find((chatList) => chatList.contactId === contactId) ??
        null;
      this.clearUnreadCount(contactId);
    },

    // 清除未读消息
    async clearUnreadCount(contactId: number) {
      this.chatLists.forEach((chatList) => {
        if (chatList.contactId === contactId) {
          if (chatList.unreadCount != 0) {
            chatList.unreadCount = 0;
            axios
              .put(`/api/user-chat-list/click?contactId=${contactId}`)
              .then((response) => {
                if (response.data.code !== 200) {
                  tokenError(response.data.message);
                }
              });
          }
        }
      });
    },

    // 发送文件
    async sendFile(receiverId: number, contentType: number, file: File) {
      this.loading = true;
      this.error = null;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiverId', receiverId.toString());
      formData.append('contentType', contentType.toString());
      try {
        const response = await axios.post<Response<String>>(
          `/api/user-messages-file/setFile`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        if (response.data.code == 200) {
          return response.data.data;
        } else {
          tokenError(response.data.message);
          ElMessage.error(response.data.message);
          return false;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        ElMessage.error('获取聊天记录失败');
      } finally {
        this.loading = false;
      }
    },

    // 添加发送的消息
    async addMessage(message: Message) {
      this.messages = [
        {
          id: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content,
          contentType: message.contentType,
          createTime: message.createTime
        },
        ...this.messages
      ];
      const chatIndex = this.chatLists.findIndex(
        (chat) => chat.contactId === message.receiverId
      );
      if (message.contentType == 1) {
        this.chatLists[chatIndex].lastMessage = message.content;
      } else {
        this.chatLists[chatIndex].lastMessage = truncateString(
          '[文件]' + JSON.parse(message.content).fileName,
          8,
          '...'
        );
      }
      this.chatLists[chatIndex].lastMessageTime = currentTime();
    },

    // 监听新消息
    setupWatchers() {
      watch(
        () => userStore.newMessage,
        (newMessage: WebSocketR) => {
          if (!newMessage || Object.keys(newMessage).length == 0) return;
          switch (newMessage.type) {
            case 'USER':
              this.handleChatMessage(newMessage.data);
              break;
            case 'SYSTEM':
              this.handleSystemMessage(newMessage.data);
              break;
            case 'NOTIFICATION':
              this.handleNotificationMessage(newMessage.data);
              break;
          }
        }
      );
    },

    // 处理聊天消息
    handleChatMessage(messageData: WebSocketR['data']) {
      // 更新聊天列表
      const chatIndex = this.chatLists.findIndex(
        (chat) => chat.contactId === messageData.id
      );

      if (chatIndex > -1) {
        // 更新现有聊天
        if (messageData.contentType == 1) {
          this.chatLists[chatIndex].lastMessage = messageData.message;
        } else {
          try {
            this.chatLists[chatIndex].lastMessage = truncateString(
              '[文件]' + JSON.parse(messageData.message).fileName,
              8,
              '...'
            );
          } catch (e) {
            this.chatLists[chatIndex].lastMessage = truncateString('[文件]');
          }
        }
        this.chatLists[chatIndex].lastMessageTime = currentTime();
        this.chatLists[chatIndex].unreadCount++;
      } else {
        // 添加新的聊天项
        this.fetchChatList();
      }

      // 如果是当前选中的联系人，更新消息列表
      if (this.selectedContactId === messageData.id) {
        this.messages = [
          {
            id: this.messages[0].id + 1,
            senderId: messageData.id,
            receiverId: messageData.toId,
            content: messageData.message,
            contentType: messageData.contentType,
            createTime: currentTime()
          },
          ...this.messages
        ];
      }
    },

    // 处理系统消息
    handleSystemMessage(messageData: WebSocketR['data']) {
      // 处理系统消息逻辑
      if (messageData.contentType === 99 && messageData.error === true) {
        ElMessageBox.alert(messageData.message, '错误', {
          confirmButtonText: 'OK',
          callback: (action: Action) => {
            userStore.logout();
          }
        });
      }
    },

    // 处理通知消息
    handleNotificationMessage(messageData: WebSocketR['data']) {
      ElMessage.info(messageData.message);
      // 处理通知消息逻辑
    }
  }
});
