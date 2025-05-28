<!-- aiMessage/ChatWindow.vue(已抛弃) -->
<template>
	<div class="chat-window">
		<div class="chat-header">
			<h2>{{ currentChat.title }}</h2>
			<div class="header-actions">
				<!-- todo -->
			</div>
		</div>

		<!-- 加载状态 -->
		<div v-if="messagesLoading" class="loading">消息加载中...</div>
		<!-- 错误状态 -->
		<div v-else-if="messagesError" class="error">{{ messagesError }}</div>
		<!-- 正常显示 -->
		<div
			v-else
			class="chat-messages"
			ref="messagesContainer"
			@scroll="handleScroll"
		>
			<template v-for="([timeKey, group], index) of displayGroups" :key="index">
				<div class="messages-container" ref="messagesContainer">
					<template v-for="(message, index) in group.items" :key="index">
						<!-- 消息内容 -->
						<div class="message" :class="message.type">
							<div class="message-content">
								<!-- 消息正文 -->
								<div class="message-text">
									{{ (message.content?.text || '').replace(/^undefined/, '') }}
								</div>
								<!-- 时间显示 -->
								<div class="message-time" :class="message.type">
									{{ message.time }}
								</div>
							</div>
						</div>
					</template>
				</div>
			</template>
		</div>
		<div class="chat-footer">
			<div class="footer-actions">
				<!-- todo -->
			</div>
			<div class="message-input">
				<textarea
					v-model="newMessage"
					placeholder="输入消息..."
					@keydown.enter.exact.prevent="sendMessage"
					:disabled="isSending"
				></textarea>
			</div>
			<div class="send-button">
				<button @click="sendMessage" :disabled="isSending">
					{{ isSending ? '发送中...' : '发送' }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useMemoryStore } from '../../stores/memoryStore';
import { ElMessage } from 'element-plus';

const messagesContainer = ref(null);
const memoryStore = useMemoryStore();
const newMessage = ref('');
const isSending = ref(false);
const showScrollToBottomButton = ref(false);
const isNearBottom = ref(true);

const { currentMessages, messagesLoading, messagesError } =
	storeToRefs(memoryStore);

// 按秒分组
const groupedMessages = computed(() => {
	// 1. 按时间升序排序（从早到晚）
	const sortedMessages = [...currentMessages.value].sort(
		(a, b) => new Date(a.rawTime) - new Date(b.rawTime)
	);

	// 2. 分组（精确到秒）
	const groups = {};
	sortedMessages.forEach((msg) => {
		const timeKey = new Date(msg.rawTime).toISOString().slice(0, 19);
		groups[timeKey] = groups[timeKey] || { time: msg.time, items: [] };
		groups[timeKey].items.push(msg);
	});

	// 3. 分组按键升序排序
	return Object.entries(groups).sort(([a], [b]) => new Date(a) - new Date(b));
});

// 显示时反转顺序（从新到旧）
const displayGroups = computed(() => groupedMessages.value.slice());

// 当前对话
const currentChat = computed(() => ({
	title: '当前对话',
	messages: currentMessages.value
}));

// 滚动处理（添加防抖）
const handleScroll = debounce((e) => {
	const container = e.target;
	const { scrollTop, scrollHeight, clientHeight } = container;
	const threshold = 50; // 距离底部50px视为"接近底部"

	// 计算是否接近底部
	isNearBottom.value = scrollTop + clientHeight >= scrollHeight - threshold;

	// 只有当不接近底部时才显示按钮
	showScrollToBottomButton.value = !isNearBottom.value;
}, 100);

// 发送消息
const sendMessage = async () => {
	if (!newMessage.value.trim() || isSending.value) return;

	try {
		isSending.value = true;

		// 添加用户消息
		memoryStore.addUserMessage({
			text: newMessage.value,
			time: new Date().toISOString()
		});

		// 构造请求参数
		const params = new URLSearchParams({
			memoryId: memoryStore.selectedChatId,
			message: newMessage.value
		});
		if (memoryStore.ragId) params.append('ragId', memoryStore.ragId);

		// 发送请求
		const response = await fetch(`/api/chat/stream?${params}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: localStorage.getItem('token')
			}
		});

		// 处理流式响应
		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		// 添加临时AI消息
		let aiMessage = memoryStore.addAIMessage({
			text: '',
			time: new Date().toISOString()
		});

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			// 解码并更新消息
			const chunk = decoder.decode(value);
			aiMessage.text += chunk;
			memoryStore.updateAIMessage(aiMessage.id, aiMessage.text);
		}
	} catch (error) {
		ElMessage.error('消息发送失败');
		memoryStore.addSystemMessage('消息发送失败，请重试');
	} finally {
		newMessage.value = '';
		isSending.value = false;
		scrollToBottom();
	}
};

const scrollToBottom = () => {
	const container = messagesContainer.value;
	if (container) {
		container.scrollTo({
			top: container.scrollHeight,
			behavior: 'smooth'
		});
		// 滚动后立即隐藏按钮
		showScrollToBottomButton.value = false;
	}
};

onMounted(() => {
	scrollToBottom();
});

watch(messagesLoading, (newVal) => {
	if (!newVal) {
		nextTick(scrollToBottom);
	}
});

watch(
	currentMessages,
	() => {
		if (isNearBottom.value) {
			nextTick(scrollToBottom);
		}
	},
	{ deep: true }
);

// 生命周期：添加/移除滚动监听
onMounted(() => {
	messagesContainer.value?.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
	messagesContainer.value?.removeEventListener('scroll', handleScroll);
});

// 防抖函数
function debounce(fn, delay) {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), delay);
	};
}
</script>

<style scoped>
.chat-window {
	flex: 1;
	display: flex;
	flex-direction: column;
	background-color: #f0f5ff;
}

.chat-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px 20px;
	background-color: white;
	border-bottom: 1px solid #e6e6e6;
}

.chat-header h2 {
	font-size: 16px;
	font-weight: 500;
	color: #333;
}

.header-actions {
	display: flex;
	gap: 15px;
}

/* 添加加载和错误样式 */
.loading {
	padding: 20px;
	text-align: center;
	color: #666;
}

.error {
	padding: 20px;
	color: #ff4444;
	text-align: center;
}

.chat-messages {
	position: relative;
	flex: 1;
	padding: 20px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.message:last-child {
	overflow-anchor: auto;
	min-height: 0.1px;
}

.message {
	display: flex;
	max-width: 80%;
	padding: 12px;
	margin: 12px 0;
	position: relative;
	border-radius: 8px;
}

/* 左侧消息样式 */
.message.received {
	flex-direction: row;
	margin-right: auto;
}

/* 右侧消息样式 */
.message.sent {
	flex-direction: row-reverse;
	margin-left: auto;
}

.message-content {
	background-color: white;
	padding: 10px 15px;
	border-radius: 8px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 禁用默认滚动动画 */
.messages-container {
	scroll-behavior: auto;
}

.message-text {
	font-size: 14px;
	color: #333;
	word-break: break-word;
}

.message-link {
	font-size: 14px;
	word-break: break-all;
}

.message-link a {
	color: #0099ff;
	text-decoration: none;
}

.message-time {
	font-size: 12px;
	color: #999;
	margin-top: 5px;
	text-align: right;
}

.chat-footer {
	background-color: white;
	padding: 15px 20px;
	display: flex;
	flex-direction: column;
	border-top: 1px solid #e6e6e6;
	position: relative;
	/* 为按钮定位提供参考 */
}

.scroll-button-container {
	background-color: #f0f5ff;
	position: absolute;
	top: -40px;
	/* 上移到输入框上方 */
	left: 50%;
	/* 水平居中 */
	transform: translateX(-50%);
	/* 精确居中 */
	z-index: 100;
	/* 确保在输入框上方 */
}

.scroll-to-bottom {
	width: 36px;
	height: 36px;
	border-radius: 18px;
	background: #2196f3;
	color: white;
	border: none;
	cursor: pointer;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	transition: all 0.3s;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
}

.scroll-to-bottom:hover {
	background: #1976d2;
	transform: translateY(-2px) scale(1.05);
}

.footer-actions {
	display: flex;
	gap: 15px;
	margin-bottom: 10px;
}

.message-input {
	margin-bottom: 10px;
}

.message-input textarea {
	width: 100%;
	height: 80px;
	border: none;
	resize: none;
	outline: none;
	font-size: 14px;
}

.send-button {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 5px;
}

.send-button button {
	background-color: #0099ff;
	color: white;
	border: none;
	padding: 6px 20px;
	border-radius: 4px;
	cursor: pointer;
	font-size: 14px;
}

.send-button button:hover {
	background-color: #0088ee;
}

/* 添加打字机效果 */
.ai-typing::after {
	content: '|';
	animation: blink 1s infinite;
}

@keyframes blink {
	50% {
		opacity: 0;
	}
}
</style>
