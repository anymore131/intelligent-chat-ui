<!-- aiMessage/ChatList.vue -->
<template>
	<div class="chat-list">
		<div class="header">
			<div class="search-box">
				<Search class="icon" size="16" />
				<input type="text" placeholder="Search" />
			</div>
			<PlusCircle class="icon" size="20" />
		</div>

		<div v-if="memoryStore.loading">加载中...</div>
		<div v-else>
			<el-scrollbar>
				<div
					v-for="chat in memoryStore.chats"
					:key="chat.memoryId"
					class="chat-item"
					:class="{
						'chat-active': chat.memoryId === memoryStore.selectedChatId,
						disabled: isChat
					}"
					@click="handleItemClick(chat.memoryId)"
				>
					<div class="chat-info">
						<div class="name">{{ chat.name }}</div>
						<el-tag size="small" v-if="chat.system"> 角色 </el-tag>
					</div>
					<div class="time">{{ chat.time }}</div>
				</div>
			</el-scrollbar>
		</div>

		<div class="new-chat" @click="createNewChat">
			<SmilePlus class="icon" size="24" />
		</div>
	</div>
</template>

<script setup>
import { Search, PlusCircle, SmilePlus } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useMemoryStore } from '../../stores/memoryStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useChatStore } from '@/stores/chatStore';

const memoryStore = useMemoryStore();
const navStore = useNavigationStore();
const chatStore = useChatStore();
const { isChat } = storeToRefs(chatStore); // 添加响应式状态

// 初始化加载数据
onMounted(() => {
	init();
});

const init = () => {
	memoryStore.fetchChats();
};

const handleItemClick = (id) => {
	if (isChat.value) return; // 禁用状态下阻止选择
	selectChat(id);
};

// 选择聊天
const selectChat = (id) => {
	navStore.selectItem(id);
	memoryStore.selectChat(id);
};

// 创建新聊天
const createNewChat = () => {
	navStore.selectNull();
	memoryStore.selectNull();
};
</script>

<style scoped>
.chat-list {
	border-right: 1px solid var(--border-color);
	background-color: var(--secondary);
	width: 300px;
	height: 100vh;
	padding: 20px;
	display: flex;
	flex-direction: column;
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

.search-box input {
	border: none;
	outline: none;
	background-color: transparent;
	color: var(--text-color);
	width: 100%;
}

.header .icon {
	color: var(--text-color);
	cursor: pointer;
}

.chat-item {
	position: relative;
	padding: 12px;
	transition: all 0.3s ease;
	display: flex;
	justify-content: space-between;
	align-items: center;
	cursor: pointer;
}

/* 鼠标悬停状态 */
.chat-item:hover {
	border-radius: 10px;
	background: var(--item-color);
}

.chat-active {
	border-radius: 10px;
	background: var(--item-active-color);
}

.chat-active:hover {
	border-radius: 10px;
	background: var(--item-active-hover-color);
}

/* 新增禁用状态样式 */
.chat-item.disabled {
	cursor: not-allowed !important;
	opacity: 0.6;
	pointer-events: none;
}

/* 调整悬停状态 */
.chat-item.disabled:hover {
	border-radius: 10px;
	background: var(--item-color);
}

/* 保持激活状态可见性 */
.chat-item.active {
	border-radius: 10px;
	background: var(--item-active-color);
}

.chat-main {
	flex: 1;
	display: flex;
	justify-content: space-between;
}

.chat-info {
	flex: 1;
}

.name {
	font-weight: 500;
	color: var(--text-color);
	font-size: 14px;
}

.message {
	color: var(--text-shallow-color);
	font-size: 12px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.time {
	color: var(--text-shallow-color);
	font-size: 12px;
}

.new-chat {
	margin-top: auto;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--primary-color);
	color: var(--text-opposite-color);
	border-radius: 12px;
	padding: 12px;
	cursor: pointer;
}
</style>
