<!-- views/admin/home/Window.vue -->
<template>
	<router-view></router-view>
</template>

<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { watch } from 'vue'
import { useMenuStore } from '@/stores/admin/menuStore'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()

watch(
  () => route.path,
  (path) => {
    if (path === '/admin') {
      menuStore.setSelectMenu(10)
      router.replace('/admin/dashboard')
    }
  },
  { immediate: true }
)
</script>

<style scoped></style>
