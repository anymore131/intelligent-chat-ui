<!-- home/Window.vue -->
<template>
  <component :is="currentWindowComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNavigationStore } from '@/stores/navigationStore';
import type { MenuKey, WindowComponents } from '@/types/navigation';
import MessageDefault from '@/components/message/MessageDefault.vue';
import MessageWindow from '@/components/message/MessageWindow.vue';
import ChatDefault from '@/components/aiMessage/ChatDefault.vue';
import Chat from '@/components/aiMessage/Chat.vue';
import RagDefault from '@/components/rag/RagDefault.vue';
import RagWindow from '@/components/rag/RagWindow.vue';
import SystemDefault from '@/components/system/SystemDefault.vue';
import SystemWindow from '@/components/system/SystemWindow.vue';
import ContactDefault from '@/components/contact/ContactDefault.vue';
import ContactWindow from '@/components/contact/ContactWindow.vue';

const navStore = useNavigationStore();

const windowComponents: Record<MenuKey, WindowComponents> = {
  message: {
    default: MessageDefault,
    detail: MessageWindow
  },
  aiMessage: {
    default: ChatDefault,
    detail: Chat
  },
  rag: {
    default: RagDefault,
    detail: RagWindow
  },
  system: {
    default: SystemDefault,
    detail: SystemWindow
  },
  contact: {
    default: ContactDefault,
    detail: ContactWindow
  }
};

// 计算当前应该显示的窗口组件
const currentWindowComponent = computed(() => {
  const menu = navStore.selectedMenu;
  return navStore.selectedItemId
    ? windowComponents[menu].detail
    : windowComponents[menu].default;
});
</script>
