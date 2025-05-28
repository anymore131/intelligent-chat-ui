<!-- HomeViews.vue -->
<template>
  <div class="home-container">
    <Menu />
    <List />
    <Window />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import Menu from '@/views/home/Menu.vue';
import List from '@/views/home/List.vue';
import Window from '@/views/home/Window.vue';

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
</style>
