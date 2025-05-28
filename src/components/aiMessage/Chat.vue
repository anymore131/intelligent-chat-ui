<!-- aiMessage/Chat.vue -->
<template>
	<div class="chat-container">
		<!-- 顶部信息栏 -->
		<div class="header">
			<el-dropdown>
				<h2>{{ memoryStore.selectedChat?.name }}</h2>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item @click="showRenameDialog = true"
							>修改名称</el-dropdown-item
						>
						<el-dropdown-item @click="showDeleteDialog = true"
							>删除对话</el-dropdown-item
						>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<div
				class="nav-button"
				@click="showSystemDetailDialog = true"
				v-if="memoryStore.selectedChat?.system"
			>
				关于
			</div>
		</div>

		<!-- 关于对话框 -->
		<el-dialog
			v-model="showSystemDetailDialog"
			title="详情"
			width="30%"
			:before-close="handleCloseSystemDetailDialog"
		>
			<div>
				<p>名称：{{ chatStore.systemDetail.name }}</p>
				<p>
					状态：
					<el-tag
						:type="
							chatStore.systemDetail.accessPolicy === 'public'
								? 'success'
								: chatStore.systemDetail.accessPolicy === 'delete'
								? 'danger'
								: ''
						"
						size="small"
					>
						{{
							chatStore.systemDetail.accessPolicy === 'public'
								? '公开'
								: chatStore.systemDetail.accessPolicy === 'delete'
								? '已删除'
								: '私有'
						}}
					</el-tag>
				</p>
				<p>描述：{{ chatStore.systemDetail.description }}</p>
			</div>

			<template #footer>
				<el-button @click="showSystemDetailDialog = false">关闭</el-button>
			</template>
		</el-dialog>

		<!-- 聊天记录区域 -->
		<div class="chat-content">
			<!-- 加载状态提示 -->
			<div v-if="isWaitingForAI" class="loading-indicator">
				<div class="spinner"></div>
				<span>深度思考中... {{ waitingTime }}秒</span>
			</div>
			<!-- 消息列表 -->
			<div
				v-for="message in filteredMessages"
				:key="message.id"
				class="message-item"
				:class="{ 'user-message': message.type === 'USER' }"
			>
				<img
					:src="userStore.avatarUrl"
					alt="User avatar"
					v-if="message.type === 'USER'"
					class="avatar"
				/>
				<div class="message-bubble">
					<div
						class="message-text"
						v-if="message.contentsType === 'IMAGE' && message.type === 'USER'"
						@click="handleImageClick(message.text)"
					>
						<el-image
							style="width: 100px; height: 100px"
							:src="message.text"
							fit="cover"
						/>
					</div>
					<div
						class="message-text"
						v-if="message.contentsType === 'TEXT' && message.type === 'USER'"
					>
						{{ message.text }}
					</div>
					<div
						class="markdown-body"
						v-if="message.type === 'AI'"
						v-html="renderMarkdown(message.text)"
					></div>
				</div>
				<div>
					<div class="message-time" v-if="message.contentsType === 'TEXT'">
						{{ formatTime(message.createTime) }}
					</div>
				</div>
			</div>
			<!-- 加载更多指示器 -->
			<div
				class="loading-more"
				id="loading-more"
				ref="loadingMoreRef"
				v-if="!chatStore.isAll"
			>
				<el-button type="text" @click="getChat">点击加载更多</el-button>
			</div>
		</div>

		<!-- 图片预览 -->
		<div>
			<el-image-viewer
				v-if="showPreview"
				:url-list="chatStore.imageList"
				show-progress
				:initial-index="imageIndex"
				@close="showPreview = false"
			/>
		</div>

		<!-- 输入区域 -->
		<div class="input-area">
			<!-- 图片加载区 -->
			<div class="preview-images" v-if="inputImages.length">
				<div
					v-for="(img, index) in inputImages"
					:key="index"
					class="image-item"
				>
					<img :src="img.url" />
					<el-icon class="close-icon" @click="removeImage(index)">
						<Close />
					</el-icon>
				</div>
			</div>
			<!-- 输入框 -->
			<el-input
				v-model="inputText"
				type="textarea"
				:autosize="{ minRows: 4, maxRows: 6 }"
				placeholder="输入消息..."
			/>
			<!-- 输入控制区 -->
			<div class="input-controls">
				<div class="left-controls">
					<el-button
						:class="{ 'active-btn': deep }"
						@click="deep = !deep"
						v-if="!memoryStore.selectedChat?.system"
					>
						深度思考
					</el-button>
					<el-button
						:class="{ 'active-btn': web }"
						@click="web = !web"
						v-if="!memoryStore.selectedChat?.system"
					>
						联网搜索
					</el-button>
					<el-select
						:value-on-clear="null"
						v-model="knowledgeBase"
						clearable
						placeholder="知识库"
						:class="{
							'knowledge-base-select-btn': memoryStore.selectedChat?.system,
							'knowledge-base-select-btn-disabled':
								!memoryStore.selectedChat?.system
						}"
						value-key="id"
					>
						<el-option
							v-for="item in ragStore.ragList"
							:key="item.id"
							:label="item.name"
							:value="item"
						/>
					</el-select>
				</div>
				<div class="right-controls">
					<el-upload
						action="#"
						:show-file-list="false"
						:before-upload="handleImageUpload"
					>
						<el-icon class="upload-icon">
							<Picture />
						</el-icon>
					</el-upload>
					<el-button
						type="primary"
						class="send-btn"
						@click="sendMessage"
						v-if="!chatStore.isChat"
						>发送</el-button
					>
					<el-button
						type="primary"
						disabled
						class="send-btn"
						v-if="chatStore.isChat"
						>发送中</el-button
					>
				</div>
			</div>
		</div>

		<!-- 改名对话框 -->
		<el-dialog
			v-model="showRenameDialog"
			title="修改名称"
			width="400"
			align-center
		>
			<!-- 对话框内容 -->
			<el-input v-model="editingName" placeholder="请输入名称" />
			<template #footer>
				<el-button @click="showRenameDialog = false">取消</el-button>
				<el-button type="primary" @click="handleRenameConfirm">确定</el-button>
			</template>
		</el-dialog>

		<!-- 删除对话框 -->
		<el-dialog
			v-model="showDeleteDialog"
			title="删除对话"
			width="400"
			align-center
		>
			<div>确定要删除对话吗？</div>
			<template #footer>
				<el-button @click="showDeleteDialog = false">取消</el-button>
				<el-button type="primary" @click="handleDeleteConfirm">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { Close, Picture } from '@element-plus/icons-vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { formatTime } from '@/utils/time';
import { useMemoryStore } from '@/stores/memoryStore';
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { useRagStore } from '@/stores/ragStore';
import { useNavigationStore } from '@/stores/navigationStore';
import type { ChatHistoryRequest, InputImages } from '@/stores/chatStore';
import type { RagItem } from '@/stores/ragStore';

const memoryStore = useMemoryStore();
const chatStore = useChatStore();
const userStore = useUserStore();
const ragStore = useRagStore();
const navStore = useNavigationStore();

// 初始化对话
onMounted(() => {
	init();
});

// 发送参数
const memoryId = ref('');
const inputText = ref('');
const knowledgeBase = ref<RagItem>();
const deep = ref(false);
const web = ref(false);
// 预设参数
const imageIndex = ref(0);
const inputImages = ref<InputImages[]>([]);
const editingName = ref('');
const waitingTime = ref(0);
const timer = ref<ReturnType<typeof setTimeout>>();
const isWaitingForAI = computed(() => chatStore.isWaiting && deep.value);
// 展示参数
const showRenameDialog = ref(false);
const showDeleteDialog = ref(false);
const showPreview = ref(false);
const showSystemDetailDialog = ref(false);

// 监听memory变化
watch(
	() => chatStore.memoryId,
	(val) => {
		if (val) {
			chatStore.clearState();
			init();
		}
	}
);
// 监听对话名称变化
watch(showRenameDialog, (val) => {
	if (val && memoryStore.selectedChat) {
		editingName.value = memoryStore.selectedChat.name;
	}
});
// 监听加载状态变化
watch(isWaitingForAI, (newVal) => {
	if (newVal) {
		waitingTime.value = 0;
		timer.value = setInterval(() => {
			waitingTime.value++;
		}, 1000);
	} else {
		if (timer.value) clearInterval(timer.value);
	}
});

// 初始化
const init = () => {
	if (!memoryStore.selectedChat) {
		ElMessage.error('对话错误！');
		return;
	}
	memoryId.value = memoryStore.selectedChat?.memoryId;
	chatStore.memoryId = memoryStore.selectedChat?.memoryId;
	if (memoryStore.selectedChat?.system) {
		chatStore.fetchSystemDetail(memoryStore.selectedChat?.memoryId);
	}
	ragStore.fetchRagList();
	if (chatStore.useData == true) {
		chatStore.isAll = true;
		inputText.value = chatStore.data.inputText;
		if (
			chatStore.data.inputImages !== null &&
			chatStore.data.inputImages != undefined
		) {
			inputImages.value[0] = chatStore.data.inputImages;
		}
		if (
			chatStore.data.knowledgeBase !== null &&
			chatStore.data.knowledgeBase != undefined
		) {
			knowledgeBase.value = chatStore.data.knowledgeBase;
		}
		deep.value = chatStore.data.deep;
		web.value = chatStore.data.web;
		chatStore.isChat = false;
		chatStore.data = {
			inputText: '',
			deep: false,
			web: false,
			inputImages: {} as InputImages,
			knowledgeBase: null
		};
		sendMessage();
	} else {
		chatStore.fetchChatHistory({
			lastId: null,
			memoryId: memoryStore.selectedChat?.memoryId,
			pageSize: 10
		} as ChatHistoryRequest);
	}
};

// 获取聊天记录
const getChat = () => {
	if (chatStore.isAll) {
		return;
	}
	chatStore.fetchChatHistory({
		lastId: chatStore.chatHistory[chatStore.chatHistory.length - 1]?.id,
		memoryId: memoryStore.selectedChat?.memoryId,
		pageSize: 10
	} as ChatHistoryRequest);
};

// 初始化Markdown解析器
const md = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return `<pre class="hljs"><code>${
					hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
				}</code></pre>`;
			} catch (__) {}
		}
		return '';
	}
});

// 解析Markdown
const renderMarkdown = (text: string) => {
	return md.render(text);
};

// 处理'SYSTEM'记录
const filteredMessages = computed(() => {
	return chatStore.chatHistory.filter((m) => m.type !== 'SYSTEM');
});

// 上传图片
const handleImageUpload = (file: File) => {
	inputImages.value.push({
		url: URL.createObjectURL(file),
		file
	});
	return false;
};

// 移除图片
const removeImage = (index: number) => {
	inputImages.value.splice(index, 1);
};

// 关闭详情对话框
const handleCloseSystemDetailDialog = () => {
	showSystemDetailDialog.value = false;
};

// 点击图片
const handleImageClick = (url: string) => {
	imageIndex.value = chatStore.imageList.indexOf(url);
	showPreview.value = true;
};

// 发送消息
const sendMessage = async () => {
	if (inputText.value.trim() === '') {
		ElMessage.error('请输入内容！');
		return;
	}
	const text = inputText.value;
	const imageUrl = inputImages.value.map((item) => item.url)[0] || null;
	const imageFile = inputImages.value.map((item) => item.file)[0] || null;
	inputText.value = '';
	inputImages.value = [];
	chatStore.addUserMessage({
		text: text,
		contentsType: 'TEXT'
	});
	let k = null;
	if (Number(knowledgeBase.value?.id) !== 0) {
		k = Number(knowledgeBase.value?.id);
	}
	try {
		if (memoryStore.selectedChat?.system) {
			if (imageUrl !== null) {
				ElMessage.info('暂不支持');
			} else {
				await chatStore.systemStreamChatResponse({
					ragId: k,
					memoryId: chatStore.memoryId || '',
					message: text
				});
			}
		} else {
			if (imageUrl !== null) {
				chatStore.addUserMessage({
					text: imageUrl,
					contentsType: 'IMAGE'
				});
				chatStore.imageList = [...chatStore.imageList, imageUrl];
				await chatStore.multiStreamChatResponse({
					memoryId: chatStore.memoryId || '',
					message: text,
					file: imageFile
				});
			} else {
				await chatStore.streamChatResponse({
					ragId: k,
					memoryId: chatStore.memoryId || '',
					message: text,
					deep: deep.value,
					web: web.value
				});
			}
		}
	} catch (error) {
		ElMessage.error('发送失败');
	}
};

// 修改名称
const handleRenameConfirm = () => {
	memoryStore.changeMemoryName(memoryId.value, editingName.value);
	showRenameDialog.value = false;
};

// 删除对话
const handleDeleteConfirm = async () => {
	const success = await memoryStore.deleteMemory(memoryId.value);
	if (success === true) {
		navStore.selectMenu('aiMessage');
	}
	showDeleteDialog.value = false;
};

// 组件卸载时清除定时器
onBeforeUnmount(() => {
	if (timer.value) clearInterval(timer.value);
	chatStore.clearState();
});
</script>

<style scoped>
.chat-container {
	flex: 1;
	display: flex;
	flex-direction: column;
	height: 100vh;
}

.header {
	padding: 16px;
	border-bottom: 1px solid var(--border-color);
	display: flex;
	gap: 20px;
}

.nav-button {
	cursor: pointer;
	font-size: 15px;
	color: var(--text-shallow-color);
}

.chat-content {
	flex: 1;
	overflow-y: auto;
	padding: 20px;
	display: flex;
	flex-direction: column-reverse;
	position: relative;
}

/* 新增加载状态样式 */
.loading-indicator {
	display: flex;
	align-items: center;
	padding: 16px;
	margin: 10px;
	background: var(--bg-color);
	border-radius: 8px;
	gap: 12px;
	color: var(--text-shallow-color);
}

.spinner {
	width: 20px;
	height: 20px;
	border: 3px solid var(--border-color);
	border-top: 3px solid var(--primary-color);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

/* 新增加载更多样式 */
.loading-more {
	text-align: center;
	padding: 0 10px 10px 10px;
	color: var(--primary-color);
	font-size: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
}

.is-loading {
	animation: rotate 1s linear infinite;
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

.message-item {
	display: flex;
	margin-bottom: 20px;
}

.user-message {
	flex-direction: row-reverse;
}

.message-bubble {
	max-width: 70%;
	padding: 12px 16px;
	border-radius: 8px;
	background: var(--bg-card-color);
	position: relative;
}

.markdown-body {
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
		sans-serif;
	font-size: 15px;
	line-height: 1.7;
	color: var(--text-color);
}

.hljs {
	font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier,
		monospace;
	font-size: 13px;
}

/* 添加Markdown基础样式 */
.markdown-body {
	line-height: 1.6;
	word-wrap: break-word;
}

.markdown-body :deep(h1) {
	font-size: 1.8em;
	margin: 0.8em 0;
}

.markdown-body :deep(code) {
	background-color: var(--bg-color);
	padding: 0.2em 0.4em;
	border-radius: 3px;
}

.markdown-body :deep(pre) {
	background-color: var(--bg-color);
	padding: 1em;
	border-radius: 8px;
	overflow-x: auto;
	margin: 1em 0;
}

.markdown-body :deep(blockquote) {
	border-left: 4px solid var(--border-color);
	padding-left: 1em;
	color: var(--text-shallow-color);
	margin: 1em 0;
}

.markdown-body :deep(ul) {
	padding-left: 2em;
	margin: 1em 0;
}

.markdown-body :deep(ol) {
	padding-left: 2em;
	margin: 1em 0;
}

.markdown-body :deep(table) {
	border-collapse: collapse;
	margin: 1em 0;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
	border: 1px solid var(--border-color);
	padding: 0.6em;
}

.message-time {
	font-size: 12px;
	color: var(--text-shallow-color);
	margin-top: auto;
	margin-left: 8px;
	margin-right: 8px;
	margin-bottom: 0;
}

.message_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.user-message .message-bubble {
	background: var(--primary-color);
	color: var(--text-opposite-color);
}

.avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	margin: 0 10px;
}

.input-area {
	border: 1px solid var(--input-color);
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	margin: 20px;
	padding: 16px;
}

.input-controls {
	display: flex;
	justify-content: space-between;
	margin-top: 10px;
}

.left-controls {
	display: flex;
}

.knowledge-base-select-btn-disabled {
	margin-left: 20px;
	width: 200px;
}

.knowledge-base-select-btn {
	width: 200px;
}

.right-controls {
	display: flex;
}

.preview-images {
	display: flex;
	gap: 10px;
	margin-bottom: 10px;
}

.image-item {
	position: relative;
	width: 100px;
	height: 100px;
}

.image-item img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 4px;
}

.close-icon {
	position: absolute;
	right: -8px;
	top: -8px;
	cursor: pointer;
	background: var(--bg-color);
	border-radius: 50%;
}

::v-deep .el-textarea {
	.el-textarea__inner {
		resize: none;
	}
}

.upload-icon {
	margin-top: 10px;
}

.send-btn {
	margin-left: 10px;
}

.active-btn {
	border: 1px solid var(--primary-color) !important;
	background-color: var(--btn-color) !important;
}
</style>
