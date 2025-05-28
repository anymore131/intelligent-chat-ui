// stores/systemStore.ts
import { defineStore } from 'pinia';
import type { MenuKey } from '@/types/navigation';
import { useMessageStore } from '@/stores/messageStore';
import { useMemoryStore } from '@/stores/memoryStore';
import { useContactStore } from '@/stores/contactStore';
import { useRagStore } from '@/stores/ragStore';
import { useChatStore } from '@/stores/chatStore';
import { useSystemStore } from '@/stores/systemStore';

const messageStore = useMessageStore();
const memoryStore = useMemoryStore();
const contactStore = useContactStore();
const ragStore = useRagStore();
const chatStore = useChatStore();
const systemStore = useSystemStore();

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    selectedMenu: 'message' as MenuKey, // 默认选中消息图标
    selectedItemId: null as string | number | null, // 当前选中的列表项ID
    menuItems: [
      { key: 'message', name: '聊天' },
      { key: 'contact', name: '联系人' },
      { key: 'aiMessage', name: 'ai聊天' },
      { key: 'system', name: '角色' },
      { key: 'rag', name: '知识库' }
      // ...其他菜单项...
    ] as const
  }),
  actions: {
    selectMenu(menuKey: MenuKey) {
      messageStore.clearState();
      memoryStore.clearState();
      chatStore.clearState();
      contactStore.clearState();
      ragStore.clearState();
      systemStore.clearState();

      this.selectedMenu = menuKey;
      this.selectedItemId = null;
    },
    selectItem(itemId: string | number) {
      this.selectedItemId = itemId;
    },
    selectNull() {
      this.selectedItemId = null;
    }
  }
});
