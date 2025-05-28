<!-- views/admin/home/Menu.vue -->
<template>
  <div class="menu-container">
    <el-menu
      default-active="1"
      class="el-menu-vertical"
      background-color="#001529"
      text-color="#b7bdc3"
      active-text-color="#ffffff"
      router
    >
      <!-- 系统首页 -->
      <el-menu-item
        :index="getPathByMenuId(10)"
        :class="{ 'active-menu': menuStore.selectMenu === 10 }"
        @click="clickMenuItem(getPathByMenuId(10))"
      >
        <el-icon>
          <HomeFilled />
        </el-icon>
        <span>系统首页</span>
      </el-menu-item>

      <!-- 用户管理 -->
      <el-menu-item
        :index="getPathByMenuId(20)"
        :class="{ 'active-menu': menuStore.selectMenu === 20 }"
        @click="clickMenuItem(getPathByMenuId(20))"
      >
        <el-icon>
          <User />
        </el-icon>
        <span>用户管理</span>
      </el-menu-item>

      <!-- 大模型管理 -->
      <el-sub-menu
        :index="getPathByMenuId(30)"
        :class="{
          'active-submenu': [31, 32, 33, 34, 35].includes(menuStore.selectMenu)
        }"
      >
        <template #title>
          <el-icon>
            <Goods />
          </el-icon>
          <span>大模型管理</span>
        </template>
        <el-menu-item
          :index="getPathByMenuId(31)"
          :class="{ 'active-menu': menuStore.selectMenu === 31 }"
          @click="clickMenuItem(getPathByMenuId(31))"
          >大模型平台</el-menu-item
        >
        <el-menu-item
          :index="getPathByMenuId(32)"
          :class="{ 'active-menu': menuStore.selectMenu === 32 }"
          @click="clickMenuItem(getPathByMenuId(32))"
          >大模型</el-menu-item
        >
        <el-menu-item
          :index="getPathByMenuId(33)"
          :class="{ 'active-menu': menuStore.selectMenu === 33 }"
          @click="clickMenuItem(getPathByMenuId(33))"
          >模型使用</el-menu-item
        >
        <el-menu-item
          :index="getPathByMenuId(34)"
          :class="{ 'active-menu': menuStore.selectMenu === 34 }"
          @click="clickMenuItem(getPathByMenuId(34))"
          >角色管理</el-menu-item
        >
        <el-menu-item
          :index="getPathByMenuId(35)"
          :class="{ 'active-menu': menuStore.selectMenu === 35 }"
          @click="clickMenuItem(getPathByMenuId(35))"
          >知识库管理</el-menu-item
        >
      </el-sub-menu>

      <!-- 记录管理 -->
      <el-sub-menu
        :index="getPathByMenuId(70)"
        :class="{
          'active-submenu': [71, 72, 73].includes(menuStore.selectMenu)
        }"
      >
        <template #title>
          <el-icon>
            <Files />
          </el-icon>
          <span>记录管理</span>
        </template>
        <el-menu-item
          :index="getPathByMenuId(71)"
          :class="{ 'active-menu': menuStore.selectMenu === 71 }"
          @click="clickMenuItem(getPathByMenuId(71))"
          >聊天记录</el-menu-item
        >
        <el-menu-item
          :index="getPathByMenuId(72)"
          :class="{ 'active-menu': menuStore.selectMenu === 72 }"
          @click="clickMenuItem(getPathByMenuId(72))"
          >ai聊天记录</el-menu-item
        >
      </el-sub-menu>

      <!-- 文件管理 -->
      <el-sub-menu
        :index="getPathByMenuId(40)"
        :class="{
          'active-submenu': [41, 42, 43].includes(menuStore.selectMenu)
        }"
      >
        <template #title>
          <el-icon>
            <Files />
          </el-icon>
          <span>文件管理</span>
        </template>
        <el-menu-item
          :index="getPathByMenuId(41)"
          :class="{ 'active-menu': menuStore.selectMenu === 41 }"
          @click="clickMenuItem(getPathByMenuId(41))"
          >头像文件</el-menu-item
        >
        <el-menu-item
          :index="getPathByMenuId(42)"
          :class="{ 'active-menu': menuStore.selectMenu === 42 }"
          @click="clickMenuItem(getPathByMenuId(42))"
          >消息文件</el-menu-item
        >
        <el-menu-item
          :index="getPathByMenuId(43)"
          :class="{ 'active-menu': menuStore.selectMenu === 43 }"
          @click="clickMenuItem(getPathByMenuId(43))"
          >知识库文件</el-menu-item
        >
      </el-sub-menu>

      <!-- 日志 -->
      <el-menu-item
        :index="getPathByMenuId(50)"
        :class="{ 'active-menu': menuStore.selectMenu === 50 }"
        @click="clickMenuItem(getPathByMenuId(50))"
      >
        <el-icon>
          <List />
        </el-icon>
        <span>日志</span>
      </el-menu-item>

      <!-- 系统设置 -->
      <el-sub-menu
        :index="getPathByMenuId(60)"
        :class="{ 'active-submenu': [61, 62].includes(menuStore.selectMenu) }"
      >
        <template #title>
          <el-icon>
            <Setting />
          </el-icon>
          <span>系统设置</span>
        </template>
        <el-menu-item
          :index="getPathByMenuId(61)"
          :class="{ 'active-menu': menuStore.selectMenu === 61 }"
          @click="clickMenuItem(getPathByMenuId(61))"
          >基本设置</el-menu-item
        >
        <el-menu-item
          :index="getPathByMenuId(62)"
          :class="{ 'active-menu': menuStore.selectMenu === 62 }"
          @click="clickMenuItem(getPathByMenuId(62))"
          >通知设置</el-menu-item
        >
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore } from '@/stores/admin/menuStore';
import {
  HomeFilled,
  User,
  Goods,
  Files,
  List,
  Setting
} from '@element-plus/icons-vue';

const router = useRouter();
const menuStore = useMenuStore();

watch(
  () => menuStore.selectMenu,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      const path = getPathByMenuId(newValue);
      if (path) {
        clickMenuItem(path);
      }
    }
  }
);

const menuMap = new Map<string, number>([
  ['/admin/dashboard', 10],

  ['/admin/user/list', 20],

  ['/admin/model', 30],
  ['/admin/model/platform', 31],
  ['/admin/model/list', 32],
  ['/admin/model/used', 33],
  ['/admin/model/system', 34],
  ['/admin/model/rag', 35],

  ['/admin/messages', 70],
  ['/admin/messages/chat', 71],
  ['/admin/messages/aiChat', 72],

  ['/admin/file', 40],
  ['/admin/file/avatar', 41],
  ['/admin/file/message', 42],
  ['/admin/file/rag', 43],

  ['/admin/log', 50],

  ['/admin/system', 60],
  ['/admin/system/basic', 61],
  ['/admin/system/notification', 62]
]);

const clickMenuItem = (path: string) => {
  const targetPath = path.startsWith('/admin') ? path : `/admin/${path}`;
  const menuId = menuMap.get(targetPath) || 10;
  menuStore.setSelectMenu(menuId);
  router.push(targetPath).catch((err) => {
    console.error('路由跳转失败:', err);
  });
};

const getPathByMenuId = (menuId: number): string => {
  for (const [path, id] of menuMap.entries()) {
    if (id === menuId) {
      return path;
    }
  }
  return '/admin/dashboard';
};
</script>

<style scoped lang="scss">
.menu-container {
  width: 100%;
  height: calc(100vh - 60px); /* 减去顶部导航栏高度 */
  background-color: var(--admin-menu-bg-color);
  transition: width 0.3s ease;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: var(--admin-menu-bg-color);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--admin-menu-scrollbar-color);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--admin-menu-scrollbar-color);
  }

  .el-menu-vertical {
    border-right: none;
  }

  .el-menu {
    height: 100%;
  }

  .el-menu-item,
  .el-sub-menu__title {
    &:hover {
      color: var(--admin-menu-text-color) !important;
      background-color: var(--admin-menu-active-menu-bg-color) !important;
    }
  }

  .el-menu-item.is-active {
    background-color: var(--admin-menu-active-menu-bg-color) !important;
  }
}

.active-menu {
  background-color: var(--admin-menu-active-menu-bg-color) !important;
  color: var(--admin-menu-text-color) !important;
}

.active-submenu > :first-child {
  color: var(--admin-menu-text-color) !important;
  background-color: var(--admin-menu-active-submenu-bg-color) !important;
}
</style>
