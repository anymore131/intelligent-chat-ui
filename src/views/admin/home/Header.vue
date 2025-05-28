<!-- views/admin/home/Header.vue -->
<template>
  <div class="header-container">
    <div class="header-left">
      <!-- Logo -->
      <div class="logo">
        <img src="@/assets/logo.svg" alt="Logo" />
        <span>后台管理系统</span>
      </div>
    </div>

    <div class="header-right">
      <!-- 搜索框 -->
      <el-input
        v-model="searchValue"
        placeholder="搜索..."
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>

      <button
        @click="toggleTheme"
        class="theme-toggle-button"
        :aria-label="`切换至${nextTheme}主题`"
        :title="`切换至${nextTheme}主题`"
      >
        <span v-if="currentTheme === 'light'">🌙</span>
        <span v-else>☀️</span>
      </button>

      <!-- 通知 -->
      <el-dropdown trigger="click">
        <div class="notification">
          <el-badge :value="5" class="badge">
            <el-icon :size="20">
              <Bell />
            </el-icon>
          </el-badge>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>你有5条新消息</el-dropdown-item>
            <el-dropdown-item>系统升级通知</el-dropdown-item>
            <el-dropdown-item>新用户注册</el-dropdown-item>
            <el-dropdown-item divided>查看所有通知</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 全屏 -->
      <el-tooltip
        effect="dark"
        :content="isFullscreen ? '退出全屏' : '全屏'"
        placement="bottom"
      >
        <el-icon color="red" class="fullscreen" @click="toggleFullscreen">
          <component :is="isFullscreen ? Aim : FullScreen" />
        </el-icon>
      </el-tooltip>

      <!-- 用户信息 -->
      <el-dropdown>
        <div class="user-info">
          <el-avatar :size="30" :src="userStore.avatar" />
          <span class="username">管理员</span>
          <el-icon>
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goToProfile">
              <el-icon> <User /> </el-icon>个人中心
            </el-dropdown-item>
            <el-dropdown-item @click="goToSettings">
              <el-icon> <Setting /> </el-icon>系统设置
            </el-dropdown-item>
            <el-dropdown-item @click="showUserLogin = true">
              <el-icon> <UserFilled /> </el-icon>用户端
            </el-dropdown-item>
            <el-dropdown-item divided @click="showLogoutDialog = true">
              <el-icon> <SwitchButton /> </el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 回到用户端对话框 -->
    <el-dialog v-model="showUserLogin" title="用户端" width="30%">
      <span>是否要回到用户端吗？</span>
      <template #footer>
        <el-button @click="showUserLogin = false">取消</el-button>
        <el-button type="primary" @click="userLogin">确定</el-button>
      </template>
    </el-dialog>

    <!-- 退出确认对话框 -->
    <el-dialog v-model="showLogoutDialog" title="确认退出" width="30%">
      <span>确定要退出登录吗？</span>
      <template #footer>
        <el-button @click="showLogoutDialog = false">取消</el-button>
        <el-button type="primary" @click="logout">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { useFullscreen } from '@vueuse/core';
import { ElMessage } from 'element-plus';
import {
  UserFilled,
  Search,
  Bell,
  FullScreen,
  Aim,
  User,
  Setting,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';
import { useStyleStore } from '@/stores/styleStore';

const userStore = useUserStore();
const router = useRouter();
const styleStore = useStyleStore();

const emit = defineEmits(['toggle-collapse']);
const showLogoutDialog = ref(false);
const showUserLogin = ref(false);

onMounted(() => {
  userStore.checkAdmin();
  if (userStore.admin === false) {
    ElMessage.error('您不是管理员，无法进入管理端');
    router.push('login');
  }
});

const currentTheme = computed(() => styleStore.currentTheme);
const nextTheme = computed(() =>
  currentTheme.value === 'light' ? 'dark' : 'light'
);

const toggleTheme = () => {
  styleStore.toggleTheme();
};

// 搜索功能
const searchValue = ref('');

// 全屏功能
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

// 用户操作
const goToProfile = () => {};

const goToSettings = () => {};

const userLogin = () => {
  try {
    showUserLogin.value = false;
    ElMessage.success('已返回');
    router.push('/home');
  } catch (error) {
    ElMessage.error('退出登录失败');
  }
};

const logout = () => {
  try {
    userStore.logout();
    showLogoutDialog.value = false;
    ElMessage.success('已退出登录');
    router.push('/login');
  } catch (error) {
    ElMessage.error('退出登录失败');
  }
};
</script>

<style scoped lang="scss">
.header-container {
  height: 60px;
  width: 100%;
  color: var(--admin-text-color);
  background-color: var(--admin-bg-color);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
  position: relative;
  z-index: 10;

  .header-left {
    display: flex;
    align-items: center;

    .collapse-btn {
      font-size: 20px;
      margin-right: 20px;
      cursor: pointer;
      color: var(--admin-text-color);

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .logo {
      display: flex;
      align-items: center;

      img {
        width: 30px;
        height: 30px;
        margin-right: 10px;
      }

      span {
        font-size: 18px;
        font-weight: bold;
        color: var(--admin-text-color);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;

    .search-input {
      width: 200px;
      margin-right: 20px;
    }

    .theme-toggle-button {
      background-color: transparent;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .theme-toggle-button:hover {
      transform: scale(1.1);
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }

    .notification {
      margin-right: 20px;
      cursor: pointer;
      color: var(--admin-btn-color);

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .fullscreen {
      margin-right: 20px;
      cursor: pointer;
      color: var(--admin-btn-color);
      font-size: 20px;

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;

      .username {
        margin: 0 8px;
        font-size: 14px;
      }
    }
  }
}
</style>
