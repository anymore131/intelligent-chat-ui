// stores/userStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

interface Response<T> {
  code: number;
  message: string;
  data: T;
}

interface UserInfo {
  id: number;
  token: string;
  userName: string;
  name: string;
  admin: boolean;
}

interface AvatarInfo {
  id: number;
  userId: number;
  avatar: string;
  status: number;
  createTime: string;
  updateTime: string;
}

interface AvatarListResponse {
  code: number;
  message: string;
  data: AvatarInfo[];
}

interface User {
  id: number;
  userName: string;
  name: string;
  admin: number;
  createTime: string;
}

interface Page<T> {
  pages: number;
  total: number;
  list: T[];
}

interface UserRequest {
  userName: string | null;
  admin: number | null;
  name: string | null;
  startCreateTime: string | null;
  endCreateTime: string | null;
  pageNo: number;
  pageSize: number;
  isAsc: boolean;
  sortBy: string;
}

interface ResponseData {
  code: number;
  message: string;
  data?: UserInfo | AvatarInfo;
}

export interface WebSocketR {
  type: 'USER' | 'SYSTEM' | 'NOTIFICATION';
  data: {
    id: number | null;
    toId: number;
    message: string;
    error: boolean;
    contentType: number;
  };
}

export interface WebSocketAdminR {
  type: 'ADMIN';
  data: {
    toId: number;
    data: string;
    contentType: number;
  };
}

interface UserState {
  isLoading: boolean;
  token: string;
  id: number;
  userName: string;
  name: string;
  avatar: string;
  socket: WebSocket | null;
  socketStatus: string;
  error: string;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  newMessage: WebSocketR;
  adminMessage: WebSocketAdminR;
  admin: boolean;
  adminUser: number;
  pageUsers: Page<User[]>;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    isLoading: false,
    token: localStorage.getItem('token') || '',
    id: Number(localStorage.getItem('id')),
    userName: localStorage.getItem('userName') || '',
    name: localStorage.getItem('name') || '',
    avatar: localStorage.getItem('avatar') || '',
    socket: null,
    socketStatus: '未连接',
    error: '',
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectInterval: 3000,
    newMessage: JSON.parse('{}'),
    adminMessage: JSON.parse('{}'),
    admin: false,
    adminUser: 0,
    pageUsers: {} as Page<User[]>
  }),

  actions: {
    // 登录方法
    async login(userName: string, password: string, admin: boolean) {
      try {
        const response = await axios.post<ResponseData>('/api/user/login', {
          userName,
          password,
          admin
        });

        if (response.data.code === 200 && response.data.data) {
          const userData = response.data.data as UserInfo;
          this.id = userData.id;
          this.token = userData.token;
          this.userName = userData.userName;
          this.name = userData.name;
          this.admin = userData.admin;
          if (admin == true && this.admin == false) {
            this.error = '您不是管理员，请重新登录';
            return false;
          }
          // 存储到本地存储
          localStorage.setItem('token', this.token);
          localStorage.setItem('userName', this.userName);
          localStorage.setItem('id', this.id.toString());
          // 设置 axios 默认请求头
          axios.defaults.headers.common['Authorization'] = this.token;
          // 设置 socket 连接
          this.initWebSocket();
          // 登录成功后获取用户头像
          await this.fetchUserAvatar();
          return true;
        } else {
          this.error = response.data.message;
          return false;
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || '登录失败';
        return false;
      }
    },

    // WebSocket 连接初始化
    initWebSocket() {
      const wsUrl = `/ws/ws/chat?token=${this.token}`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.socketStatus = '已连接';
        // ElMessage.success('WebSocket 连接已建立')
      };

      this.socket.onmessage = (event) => {
        // 处理接收到的消息
        const message = JSON.parse(event.data);
        // 可以触发一个事件或者更新状态
        this.newMessage = message;
        this.adminMessage = message;
      };

      this.socket.onerror = (error) => {
        this.socketStatus = '连接错误';
        // ElMessage.error(`WebSocket 连接出错: ${error}`)
      };

      this.socket.onclose = () => {
        this.socketStatus = '已断开';
        // ElMessage.error('WebSocket 连接已断开')
      };
    },

    // 新增获取用户头像方法
    async fetchUserAvatar() {
      try {
        const response = await axios.get<ResponseData>('/api/user-avatar', {
          headers: {
            Authorization: this.token
          }
        });
        if (response.data.code === 200 && response.data.data) {
          const avatarData = response.data.data as AvatarInfo;
          this.avatar = avatarData.avatar;
          localStorage.setItem('avatar', this.avatar); // 保存头像URL
        } else {
          this.error = response.data.message;
        }
      } catch (error: any) {
        this.error = error;
      }
    },

    // 重连方法
    async reconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        ElMessage.error(
          `WebSocket 连接已断开，尝试重新连接... 第 ${this.reconnectAttempts} 次`
        );
        setTimeout(() => {
          this.initWebSocket();
        }, this.reconnectInterval);
      } else {
        ElMessage.error('WebSocket 重连失败，请检查网络连接');
      }
    },

    // 注册方法
    async register(userData: {
      userName: string;
      password: string;
      name: string;
    }) {
      try {
        const response = await axios.post<ResponseData>(
          '/api/user/register',
          userData
        );

        if (response.data.code === 200) {
          return true;
        } else {
          this.error = response.data.message;
          return false;
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || '注册失败';
        return false;
      }
    },

    // 更新用户头像
    async updateAvatar(newAvatarUrl: string) {
      this.avatar = newAvatarUrl;
      localStorage.setItem('avatar', newAvatarUrl);
    },

    // 获取用户头像列表
    async fetchAvatarList() {
      try {
        const response = await axios.get<AvatarListResponse>(
          '/api/user-avatar/list'
        );
        if (response.data.code === 200) {
          return response.data.data;
        } else {
          // 检查是否是 token 过期错误
          if (
            response.data.message.includes('Token 已过期') ||
            response.data.message.includes('Token 无效')
          ) {
            this.handleTokenExpired(response.data.message);
            return [];
          }
        }
        return [];
      } catch (error: any) {
        // 检查是否是 token 过期错误
        if (
          error.response?.data?.message?.includes('Token 已过期') ||
          error.response?.data?.message?.includes('Token 无效')
        ) {
          this.handleTokenExpired(error.response?.data?.message);
          return [];
        }
        console.error('获取头像列表失败:', error);
        return [];
      }
    },

    // 修改用户头像
    async changeAvatar(avatarId: number) {
      try {
        const response = await axios.put('/api/user-avatar', null, {
          params: { id: avatarId },
          headers: { Authorization: this.token }
        });
        if (response.data.code === 200) {
          return true;
        } else {
          // 检查是否是 token 过期错误
          if (
            response.data.message.includes('Token 已过期') ||
            response.data.message.includes('Token 无效')
          ) {
            this.handleTokenExpired(response.data.message);
            return;
          }
          this.error = response.data.message;
          return false;
        }
      } catch (error: any) {
        // 检查是否是 token 过期错误
        if (
          error.response?.data?.message?.includes('Token 已过期') ||
          error.response?.data?.message?.includes('Token 无效')
        ) {
          this.handleTokenExpired(error.response?.data?.message);
          return;
        }
        this.error = '修改头像失败:' + error.message;
        return false;
      }
    },

    // 上传新头像
    async uploadAvatar(file: File) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('/api/user-avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        if (response.data.code === 200) {
          ElMessage.success('头像上传成功');
          return true;
        } else {
          // 检查是否是 token 过期错误
          if (
            response.data.message.includes('Token 已过期') ||
            response.data.message.includes('Token 无效')
          ) {
            this.handleTokenExpired(response.data.message);
            return false;
          }
          this.error = response.data.message;
          return false;
        }
      } catch (error: any) {
        // 检查是否是 token 过期错误
        if (
          error.response?.data?.message?.includes('Token 已过期') ||
          error.response?.data?.message?.includes('Token 无效')
        ) {
          this.handleTokenExpired(error.response?.data?.message);
          return;
        }
        this.error = '上传头像失败:' + error.message;
        return false;
      }
    },

    async checkAdmin() {
      try {
        const response = await axios.get<Response<boolean>>(
          '/api/user/check-admin'
        );
        if (response.data.code === 200) {
          this.admin = response.data.data;
        } else {
          this.error = response.data.message;
        }
      } catch (error: any) {
        this.error = error;
      }
    },

    async getAdmin() {
      try {
        const response = await axios.get<Response<number>>(
          '/api/admin/user/admin'
        );
        if (response.data.code === 200) {
          this.adminUser = response.data.data;
        } else {
          // 检查是否是 token 过期错误
          if (
            response.data.message.includes('Token 已过期') ||
            response.data.message.includes('Token 无效')
          ) {
            this.handleTokenExpired(response.data.message);
          }
          this.error = response.data.message;
        }
      } catch (error: any) {
        // 检查是否是 token 过期错误
        if (
          error.response?.data?.message?.includes('Token 已过期') ||
          error.response?.data?.message?.includes('Token 无效')
        ) {
          this.handleTokenExpired(error.response?.data?.message);
          return;
        }
        this.error = error;
      }
    },

    async permissions(userId: number, admin: number) {
      try {
        const formData = new FormData();
        formData.append('userId', userId.toString());
        formData.append('admin', admin.toString());
        const response = await axios.put<Response<string>>(
          '/api/admin/user/permissions',
          formData
        );
        if (response.data.code === 200) {
          return true;
        } else {
          // 检查是否是 token 过期错误
          if (
            response.data.message.includes('Token 已过期') ||
            response.data.message.includes('Token 无效')
          ) {
            this.handleTokenExpired(response.data.message);
          }
          this.error = response.data.message;
          return false;
        }
      } catch (error: any) {
        // 检查是否是 token 过期错误
        if (
          error.response?.data?.message?.includes('Token 已过期') ||
          error.response?.data?.message?.includes('Token 无效')
        ) {
          this.handleTokenExpired(error.response?.data?.message);
          return false;
        }
        this.error = error;
        return false;
      }
    },

    // admin 获取用户列表
    async fetchUser(request: UserRequest) {
      this.isLoading = true;
      if (!this.admin) {
        this.error = '权限错误！';
        return;
      }
      try {
        const response = await axios.post<Response<Page<User[]>>>(
          '/api/admin/user/page',
          request
        );
        if (response.data.code == 200) {
          this.pageUsers = response.data.data as Page<User[]>;
        } else {
          // 检查是否是 token 过期错误
          if (
            response.data.message.includes('Token 已过期') ||
            response.data.message.includes('Token 无效')
          ) {
            this.handleTokenExpired(response.data.message);
          }
          this.error = response.data.message;
        }
      } catch (error: any) {
        // 检查是否是 token 过期错误
        if (
          error.response?.data?.message?.includes('Token 已过期') ||
          error.response?.data?.message?.includes('Token 无效')
        ) {
          this.handleTokenExpired(error.response?.data?.message);
          return;
        }
        this.error = error;
      }
      this.isLoading = false;
    },

    // 初始化时从本地存储恢复 token
    initialize() {
      if (this.token) {
        this.checkAdmin();
        axios.defaults.headers.common['Authorization'] = this.token;
        if (this.token && !this.avatar) {
          this.fetchUserAvatar();
        }
      }
    },

    // 发送消息的方法
    sendMessage(message: any) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      } else {
        this.error = 'WebSocket 未连接';
      }
    },

    // 处理 token 过期
    handleTokenExpired(message: string) {
      ElMessageBox.alert(message, '错误', {
        confirmButtonText: '重新登录',
        callback: () => {
          this.logout();
        }
      });
    },

    // 登出方法
    logout() {
      this.token = '';
      this.userName = '';
      this.name = '';
      this.avatar = '';
      this.id = 0;
      this.admin = false;
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('avatar');
      localStorage.removeItem('id');
      axios.defaults.headers.common['Authorization'] = '';
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    }
  },

  getters: {
    // token
    isLoggedIn: (state) => !!state.token,
    // 头像
    avatarUrl: (state) => state.avatar
  }
});

// 初始化 axios 拦截器
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});
