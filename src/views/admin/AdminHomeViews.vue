<!-- views/admin/AdminHomeViews.vue -->
<template>
  <div class="home-container">
    <el-container>
      <el-header>
        <Header />
      </el-header>
      <el-container>
        <el-aside width="200px">
          <Menu />
        </el-aside>
        <el-main>
          <Window />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import Header from './home/Header.vue';
import Menu from './home/Menu.vue';
import Window from './home/Window.vue';
import { watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const userStore = useUserStore();

// 检查登录状态
const checkAuth = () => {
  if (!userStore.token) {
    router.push('/login');
  }
};

onMounted(() => {
  checkAuth();
});

// 监听 token 变化
watch(
  () => userStore.token,
  (newToken) => {
    if (!newToken) {
      router.push('/login');
    }
  }
);
</script>

<style scoped>
.home-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

::v-deep .el-table {
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  background-color: var(--admin-bg-color) !important;
  color: var(--admin-text-color);
  border: var(--admin-border-color) !important;
}

::v-deep .el-table th {
  background-color: var(--admin-bg-color) !important;
  color: var(--admin-text-color);
  font-weight: bold;
  border: var(--admin-border-color);
}

::v-dee .el-table .el-table__row--striped td {
  background-color: var(--admin-bg-color) !important;
  color: var(--admin-text-color);
  border: var(--admin-border-color);
}

::v-deep .el-table td {
  background-color: var(--admin-bg-color) !important;
  color: var(--admin-text-color);
  border: var(--admin-border-color);
}

::v-deep .el-table template {
  background-color: var(--admin-bg-color) !important;
  color: var(--admin-text-color);
  border: var(--admin-border-color);
}

::v-deep .el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: var(--admin-bg-color) !important;
  color: var(--admin-text-color);
  border: var(--admin-border-color);
}

::v-deep .el-input__inner {
  color: var(--admin-text-color) !important;
  border: var(--admin-border-color) !important;
  padding: var(--admin-border-color) !important;
}
</style>
