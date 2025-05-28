<!-- components/message/MessageList.vue -->
<template>
  <div class="message-list">
    <div class="header">
      <div class="search-box">
        <Search class="icon" :size="16" />
        <input type="text" placeholder="Search" />
      </div>
      <PlusCircle class="icon" :size="20" />
    </div>

    <div v-if="messageStore.chatListLoading"></div>
    <div v-else>
      <el-scrollbar>
        <div
          v-for="contact in messageStore.chatLists"
          :key="contact.contactId"
          class="message-item"
          :class="{
            pinned: contact.isPinned === 1,
            active: contact.contactId === selectedContactId
          }"
          @click="handleItemClick(contact.contactId)"
        >
          <div class="avatar">
            <el-avatar :src="contact.avatar" alt="" />
          </div>
          <div class="message-info">
            <div class="name">{{ contact.name }}</div>
            <div class="unread" v-if="contact.unreadCount != 0">
              {{ contact.unreadCount }}
            </div>
            <div class="message">{{ contact.lastMessage }}</div>
          </div>
          <div class="time">{{ formatTime(contact.lastMessageTime!) }}</div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Search, PlusCircle, SmilePlus } from 'lucide-vue-next';
import { formatTime } from '@/utils/time';
import { useMessageStore } from '@/stores/messageStore';
import { useNavigationStore } from '@/stores/navigationStore';

const messageStore = useMessageStore();
const navStore = useNavigationStore();

const { selectedContactId } = storeToRefs(messageStore);

onMounted(() => {
  messageStore.fetchChatList().then(() => {
    if (messageStore.selectedContactId) {
      handleItemClick(messageStore.selectedContactId);
    }
  });
  messageStore.setupWatchers();
});

const handleItemClick = (contactId: number) => {
  navStore.selectItem(contactId);
  messageStore.selectContact(contactId);
};
</script>

<style scoped>
.message-list {
  width: 300px;
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  border-right: 1px solid var(--border-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  background-color: var(--bg-color);
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  margin-right: 10px;
}

.header .icon {
  color: var(--text-color);
  cursor: pointer;
}

.search-box input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 14px;
}

.message-item {
  display: flex;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.message-item:hover {
  border-radius: 10px;
  background-color: var(--item-color);
}

.message-item.active {
  border-radius: 10px;
  background-color: var(--item-active-color) !important;
}

.message-item.active:hover {
  border-radius: 10px;
  background-color: var(--item-active-hover-color) !important;
  z-index: 1;
}

.message-item.pinned {
  border-radius: 10px;
  background-color: var(--item-color);
}

.message-item.pinned:hover {
  border-radius: 10px;
  background-color: var(--item-deep-color);
}

.avatar {
  margin-right: 12px;
}

.message-info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-color);
}

.message {
  font-size: 13px;
  color: var(--text-shallow-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  font-size: 12px;
  color: var(--text-shallow-color);
  margin-left: 8px;
}

.unread {
  position: absolute;
  right: 16px;
  top: 12px;
  background-color: var(--red-dot-color);
  color: var(--text-opposite-color);
  font-size: 12px;
  padding: 0 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  text-align: center;
  line-height: 18px;
}

/* 滚动条样式优化 */
:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

:deep(.el-scrollbar__bar.is-horizontal) {
  display: none;
}
</style>
