<!-- SideNavigation.vue -->
<template>
  <div class="side-navigation">
    <div class="logo">
      <span>chat</span>
    </div>

    <!-- 头像部分 -->
    <el-popover
      placement="right"
      trigger="hover"
      :width="300"
      popper-class="user-info-popover"
    >
      <template #reference>
        <div class="avatar">
          <img :src="userStore.avatarUrl" alt="User avatar" />
        </div>
      </template>

      <div class="user-info-content">
        <div class="user-avatar">
          <img :src="userStore.avatarUrl" alt="User avatar" />
        </div>
        <div class="user-details">
          <h4>{{ userStore.name }}</h4>
          <p>@{{ userStore.userName }}</p>
          <div class="user-actions">
            <el-button type="primary" size="small" @click="changePassword">
              修改密码
            </el-button>
            <el-button type="primary" size="small" @click="changeAvatar">
              修改头像
            </el-button>
          </div>
        </div>
      </div>
    </el-popover>

    <AvatarDialog ref="avatarDialogRef" />

    <!-- 导航按钮 -->
    <div class="nav-buttons">
      <div
        v-for="item in navStore.menuItems"
        :key="item.key"
        class="nav-button"
        :class="{ active: navStore.selectedMenu === item.key }"
        @click="handleMenuClick(item.key)"
      >
        <span class="button-text">{{ getMenuLabel(item.key) }}</span>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-buttons">
      <div
        class="nav-button"
        @click="showAdminLogin = true"
        v-if="userStore.admin === true"
      >
        管理端
      </div>
      <button
        @click="toggleTheme"
        class="theme-toggle-button"
        :aria-label="`切换至${nextTheme}主题`"
        :title="`切换至${nextTheme}主题`"
      >
        <span v-if="currentTheme === 'light'">🌙</span>
        <span v-else>☀️</span>
      </button>
      <div class="nav-button" @click="showAboutDialog = true">关于</div>
      <div class="nav-button" @click="showLogoutDialog = true">退出</div>
    </div>
  </div>

  <!-- 登录管理端对话框 -->
  <el-dialog v-model="showAdminLogin" title="登录管理端" width="30%">
    <span>是否登录管理端？</span>
    <template #footer>
      <el-button @click="showAdminLogin = false">取消</el-button>
      <el-button type="primary" @click="adminLogin">确定</el-button>
    </template>
  </el-dialog>

  <!-- 关于对话框 -->
  <el-dialog
    v-model="showAboutDialog"
    title="关于"
    width="30%"
    :before-close="handleCloseAboutDialog"
  >
    <div>
      <p>作者：anymore131</p>
      <p>邮箱：1628512812@qq.com</p>
      <p>版本：1.0.0</p>
      <p>
        gitee：<a href="https://gitee.com/guan-xue/projects" target="_blank"
          >https://gitee.com/guan-xue/projects</a
        >
      </p>
      <p>Copyright © 2025</p>
    </div>

    <template #footer>
      <el-button @click="showAboutDialog = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 退出确认对话框 -->
  <el-dialog v-model="showLogoutDialog" title="确认退出" width="30%">
    <span>确定要退出登录吗？</span>
    <template #footer>
      <el-button @click="showLogoutDialog = false">取消</el-button>
      <el-button type="primary" @click="handleLogout">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useNavigationStore } from '@/stores/navigationStore';
import { useUserStore } from '@/stores/userStore';
import { useStyleStore } from '@/stores/styleStore';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import AvatarDialog from '@/components/AvatarDialog.vue';

const navStore = useNavigationStore();
const userStore = useUserStore();
const styleStore = useStyleStore();

const avatarDialogRef = ref();
const showAdminLogin = ref(false);
const showAboutDialog = ref(false);
const showLogoutDialog = ref(false);
const router = useRouter();

onMounted(() => {
  userStore.checkAdmin();
});

const currentTheme = computed(() => styleStore.currentTheme);
const nextTheme = computed(() =>
  currentTheme.value === 'light' ? 'dark' : 'light'
);

const toggleTheme = () => {
  styleStore.toggleTheme();
};

// 根据菜单key返回对应的中文标签
const getMenuLabel = (key) => {
  const labels = {
    aiMessage: 'AI',
    message: '消息',
    contact: '联系人',
    system: '角色',
    rag: '知识库'
  };
  return labels[key] || key;
};

const changePassword = () => {
  ElMessage.info('编辑资料功能待实现');
};

const changeAvatar = () => {
  avatarDialogRef.value?.openAvatarDialog();
};

const adminLogin = () => {
  try {
    ElMessage.success('登录管理端成功');
    showAdminLogin.value = false;
    router.push('admin');
  } catch (error) {
    ElMessage.error('登录管理端失败');
  }
};

const handleCloseAboutDialog = () => {
  showAboutDialog.value = false;
};

const handleMenuClick = (key) => {
  if (navStore.selectedMenu !== key) {
    navStore.selectMenu(key);
  }
};

const handleLogout = async () => {
  try {
    userStore.logout();
    showLogoutDialog.value = false;
    ElMessage.success('已退出登录');
    router.push('login');
  } catch (error) {
    ElMessage.error('退出登录失败');
  }
};
</script>

<style scoped>
.side-navigation {
  width: 75px;
  background-color: var(--nav-bg-color);
  color: var(--nav-text-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  height: 100vh;
}

.logo {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 15px;
}

.avatar {
  margin-bottom: 20px;
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

/* 导航按钮样式 */
.nav-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: auto;
  width: 100%;
  align-items: center;
}

.bottom-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
  width: 100%;
  align-items: center;
}

/* 用户信息弹出框样式 */
.user-info-content {
  display: flex;
  padding: 15px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-details h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: var(--text-color);
}

.user-details p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.nav-button {
  color: var(--nav-btn-color);
  font-size: 14px;
  width: 100%;
  padding: 8px 0;
  height: 50px;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.nav-button.active {
  pointer-events: none;
  cursor: default;
}

.nav-button:hover::before,
.nav-button.active::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 140%;
  background-color: var(--nav-btn-hover-color);
  border-radius: 8px;
  z-index: -1;
}

.nav-button .button-text {
  position: relative;
  z-index: 1;
  padding: 6px 10px;
}

.nav-button:hover .button-text::before,
.nav-button.active .button-text::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% + 6px);
  height: calc(100% + 4px);
  background-color: var(--nav-btn-hover-color);
  border-radius: 8px;
  /* 调小圆角 */
  z-index: -1;
}

/* 底部按钮同样效果 */
.bottom-buttons .nav-button {
  height: 40px;
  /* 稍小一些 */
}

.bottom-buttons .nav-button:hover .button-text::before,
.bottom-buttons .nav-button.active .button-text::before {
  width: calc(100% + 6px);
  height: calc(100% + 3px);
}

a {
  color: var(--a-color);
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
</style>

<style>
.user-info-popover {
  padding: 0 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border: none !important;
}

.user-info-popover .el-popper__arrow::before {
  background: var(--bg-color) !important;
  border: none !important;
}
</style>
