// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/adminLogin',
    name: 'adminLogin',
    component: () => import('@/views/admin/AdminLogin.vue')
  },
  {
    path: '/admin/login',
    name: 'adminLogin',
    component: () => import('@/views/admin/AdminLogin.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/HomeViews.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/AdminHomeViews.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/admin/window/Dashboard.vue')
      },
      {
        path: 'user',
        redirect: 'user/list',
        children: [
          {
            path: 'list',
            component: () => import('@/views/admin/window/UserList.vue')
          },
          {
            path: 'role',
            component: () => import('@/views/admin/window/UserRole.vue')
          }
        ]
      },
      {
        path: 'model',
        redirect: 'model/message',
        children: [
          {
            path: 'platform',
            component: () => import('@/views/admin/window/ModelPlatform.vue')
          },
          {
            path: 'list',
            component: () => import('@/views/admin/window/ModelList.vue')
          },
          {
            path: 'used',
            component: () => import('@/views/admin/window/ModelUsed.vue')
          },
          {
            path: 'system',
            component: () => import('@/views/admin/window/ModelSystemList.vue')
          },
          {
            path: 'rag',
            component: () => import('@/views/admin/window/RagList.vue')
          }
        ]
      },
      {
        path: 'messages',
        redirect: '/messages/platform',
        children: [
          {
            path: 'chat',
            component: () => import('@/views/admin/window/ChatMessages.vue')
          },
          {
            path: 'aiChat',
            component: () => import('@/views/admin/window/AiCHatMessages.vue')
          }
        ]
      },
      {
        path: 'file',
        redirect: 'file/platform',
        children: [
          {
            path: 'message',
            component: () => import('@/views/admin/window/MessageFileList.vue')
          },
          {
            path: 'avatar',
            component: () => import('@/views/admin/window/AvatarFileList.vue')
          },
          {
            path: 'rag',
            component: () => import('@/views/admin/window/RagFileList.vue')
          }
        ]
      },
      {
        path: 'log',
        component: () => import('@/views/admin/window/Log.vue')
      },
      {
        path: 'system',
        redirect: 'system/basic',
        children: [
          {
            path: 'basic',
            component: () => import('@/views/admin/window/SystemBasic.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*', // 使用 pathMatch 捕获所有未匹配路径
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      hideHeader: true // 可选的元信息，用于隐藏公共页眉
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const token = localStorage.getItem('token');
  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn && !token) {
    next('/login');
  } else {
    next();
  }
  // 如果已登录但 WebSocket 未连接，则尝试连接
  if (token && !userStore.socket) {
    userStore.initWebSocket();
  }
});

export function setupRouter() {
  const userStore = useUserStore();
  router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
      next('/login');
    } else {
      next();
    }
  });
}

export default router;
