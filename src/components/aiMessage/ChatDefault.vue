<!-- aiMessage/ChatDefault.vue -->
<template>
	<div class="chat-container">
		<!-- 顶部信息栏 -->
		<div class="header">
			<h2>新对话</h2>
		</div>

		<!-- 聊天记录区域 -->
		<div class="chat-content"></div>

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
					<el-button :class="{ 'active-btn': deep }" @click="deep = !deep">
						深度思考
					</el-button>
					<el-button :class="{ 'active-btn': web }" @click="web = !web">
						联网搜索
					</el-button>
					<el-select
						:value-on-clear="null"
						v-model="knowledgeBase"
						clearable
						placeholder="知识库"
						class="knowledge-base-select-btn"
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
					<el-button type="primary" class="send-btn" @click="sendMessage"
						>发送</el-button
					>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Close, Picture } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRagStore } from '@/stores/ragStore';
import { useMemoryStore } from '@/stores/memoryStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useChatStore } from '@/stores/chatStore';
import type { RagItem } from '@/stores/ragStore';
import type { InputImages } from '@/stores/chatStore';

const ragStore = useRagStore();
const navStore = useNavigationStore();
const memoryStore = useMemoryStore();
const chatStore = useChatStore();

// 发送参数
const inputText = ref('');
const knowledgeBase = ref<RagItem>();
const deep = ref(false);
const web = ref(false);
const inputImages = ref<InputImages[]>([]);

onMounted(() => {
	ragStore.fetchRagList();
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

const sendMessage = async () => {
	if (!inputText.value && inputImages.value.length == 0) {
		ElMessage.error('请输入内容！');
	}
	memoryStore.createMemory().then((memoryId) => {
		memoryStore.fetchChats().then(() => {
			navStore.selectItem(memoryId!);
			memoryStore.selectChat(memoryId!);
			chatStore.initSend(
				inputText.value,
				deep.value,
				web.value,
				inputImages.value[0],
				knowledgeBase.value!
			);
			inputImages.value = [];
		});
	});
};
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

.chat-content {
	flex: 1;
	overflow-y: auto;
	padding: 20px;
	display: flex;
	flex-direction: column-reverse;
	position: relative;
}

.input-area {
	border: 1px solid var(--border-color);
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	margin: 20px;
	padding: 16px;
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

.input-controls {
	display: flex;
	justify-content: space-between;
	margin-top: 10px;
}

.left-controls {
	display: flex;
}

.active-btn {
	border: 1px solid var(--primary-color) !important;
	background-color: var(--nav-btn-color) !important;
}

.knowledge-base-select-btn {
	margin-left: 20px;
	width: 200px;
}

.right-controls {
	display: flex;
}

.upload-icon {
	margin-top: 10px;
}

.send-btn {
	margin-left: 10px;
}
</style>
