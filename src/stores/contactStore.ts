// stores/contactStore.ts
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { tokenError } from '@/utils/error';
import axios from 'axios';

interface ContactResponse {
  code: number;
  message: string;
  data: Contact[] | User;
}

export interface User {
  userName: string;
  name: string;
  createTime: string;
}

export interface Contact {
  id: number;
  userId: number;
  userName: string;
  contactId: number;
  contactName: string;
  avatar: string;
  contactType: number;
  groupId: number | null;
  status: number;
  lastContactTime: string | null;
  createTime: string;
  updateTime: string;
}

export interface ContactDetail {
  id: number;
  contactId: number;
  contactName: string;
  userName: string;
  name: string;
  avatar: string;
  lastContactTime: string | null;
  contactCreateTime: string;
  userCreateTime: string;
}

interface ConfirmRequest {
  id: number;
  contactName: string | null;
  status: number;
}

interface ContactState {
  loading: boolean;
  error: string | null;
  contactId: number | null;
  notifications: Contact[] | null;
  contact: Contact | null;
  contacts: Contact[] | null;
  contactType: number | null;
  user: User | null;
  contactDetail: ContactDetail | null;
  unreadCount: number;
}

export const useContactStore = defineStore('contact', {
  state: (): ContactState => ({
    loading: false,
    error: null,
    contactId: null,
    notifications: [] as Contact[],
    contact: null as Contact | null,
    contacts: null,
    contactType: 1,
    user: null as User | null,
    contactDetail: null as ContactDetail | null,
    unreadCount: 0
  }),
  actions: {
    // 清空状态
    async clearState() {
      this.loading = false;
      this.error = null;
      this.contactId = null;
      this.notifications = [] as Contact[];
      this.contact = null as Contact | null;
      this.contacts = null;
      this.contactType = 1;
      this.user = null as User | null;
      this.contactDetail = null as ContactDetail | null;
      this.unreadCount = 0;
    },
    // 获取联系人列表
    async fetchContacts(forceUpdate = true) {
      if (!forceUpdate && this.contacts) return;
      try {
        const response = await fetch(`/api/user-contact/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contactType: this.contactType,
            status: 1
          })
        });

        const data = await response.json();
        if (data.code === 200) {
          this.contacts = data.data;
        } else {
          tokenError(data.message);
          throw new Error(data.message);
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        throw new Error('获取联系人列表失败');
      }
    },

    // 获取申请列表
    async fetchNotifications() {
      try {
        const response = await axios.get('/api/user-contact/list/confirm');

        if (response.data.code === 200) {
          this.notifications = response.data.data;
          if (this.notifications != null) {
            this.unreadCount = this.notifications.length;
          } else {
            this.unreadCount = 0;
          }
        } else {
          tokenError(response.data.message);
          ElMessage.error('获取申请列表失败' + response.data.message);
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        ElMessage.error('获取申请列表失败');
      }
    },

    // 通过申请
    async confirmRequest(payload: ConfirmRequest) {
      try {
        const response = await axios.put('/api/user-contact/confirm', payload);

        if (response.data.code === 200) {
          if (this.notifications != null) {
            this.notifications = this.notifications.filter(
              (n) => n.id !== payload.id
            );
            this.unreadCount = this.notifications.length;
            await this.fetchContacts(true);
            ElMessage.success('已通过申请');
          } else {
            ElMessage.error('源数据错误');
          }
        } else {
          tokenError(response.data.message);
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        ElMessage.error('操作失败');
      }
    },

    // 拒绝申请
    async rejectRequest(payload: ConfirmRequest) {
      try {
        const response = await axios.put('/api/user-contact/confirm', payload);

        if (response.data.code === 200) {
          if (this.notifications != null) {
            this.notifications = this.notifications.filter(
              (n) => n.id !== payload.id
            );
            this.unreadCount = this.notifications.length;
            await this.fetchContacts(true);
            ElMessage.success('已拒绝申请');
          } else {
            ElMessage.error('源数据错误');
          }
        } else {
          tokenError(response.data.message);
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        ElMessage.error('操作失败');
      }
    },

    // 选择联系人
    async selectContact(id: number, contactId: number) {
      await this.fetchUser(contactId);
      this.contactId = id;
    },

    // 获取用户信息
    async fetchUser(id: number | undefined) {
      try {
        const response = await axios.get<ContactResponse>(`/api/user/${id}`);
        if (response.data.code === 200) {
          this.user = response.data.data as User;
          this.contact =
            this.contacts?.find((contact) => contact.contactId === id) ?? null;
          this.contactDetail = {
            id: this.contact?.id ?? 0,
            contactId: this.contact?.contactId ?? 0,
            contactName: this.contact?.contactName ?? '',
            userName: this.user?.userName ?? '',
            name: this.user?.name ?? '',
            avatar: this.contact?.avatar ?? '',
            lastContactTime: this.contact?.lastContactTime ?? '',
            contactCreateTime: this.contact?.createTime ?? '',
            userCreateTime: this.user.createTime ?? ''
          };
        } else {
          tokenError(response.data.message);
          this.error = 'Failed to fetch user:' + response.data.message;
        }
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        this.error = 'Error fetching user:' + error;
      }
    },

    // 更新联系人名称
    async updateContactName(id: number, contactName: string) {
      try {
        const response = await axios.put(
          `/api/user-contact?id=${id}&contactName=${contactName}`,
          null
        );
        if (response.data.code === 200) {
          // 更新本地数据
          if (this.contacts) {
            const index = this.contacts.findIndex((c) => c.id === id);
            if (index !== -1) {
              this.contacts[index].contactName = contactName;
            }
          }
          // 更新详情数据
          if (this.contactDetail?.id === id) {
            this.contactDetail.contactName = contactName;
          }
          return true;
        } else {
          tokenError(response.data.message);
          this.error = 'Failed to fetch user:' + response.data.message;
        }
        throw new Error(response.data.message || '更新失败');
      } catch (error: any) {
        tokenError(error.response?.data?.message);
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || '网络错误');
        }
        throw error;
      }
    },

    // 重置当前选中的联系人
    async resetContact() {
      this.contactId = null;
      this.contact = null;
    }
  },
  getters: {
    getContactDetail: (state) => state.contactDetail
  }
});
