<!-- contact/ContactList.vue -->
<template>
	<div class="contact-list-container">
		<!-- 搜索框和添加按钮 -->
		<div class="search-bar">
			<el-input placeholder="搜索联系人" class="search-input" />
			<el-button type="primary" circle class="add-button">
				<el-icon>
					<Plus />
				</el-icon>
			</el-button>
		</div>

		<!-- 新增好友通知 -->
		<div class="notification-item" @click="openNotificationDialog">
			<el-icon>
				<Bell />
			</el-icon>
			<span>好友通知</span>
			<el-badge
				v-if="contactStore.unreadCount > 0"
				:value="contactStore.unreadCount"
			/>
		</div>

		<!-- 联系人类型选择 -->
		<div class="contact-type-selector">
			<el-radio-group
				v-model="contactStore.contactType"
				@change="contactStore.fetchContacts"
			>
				<el-radio-button :label="1">好友</el-radio-button>
				<el-radio-button :label="2">群聊</el-radio-button>
			</el-radio-group>
		</div>

		<!-- 联系人列表 -->
		<div class="contact-list">
			<div
				v-for="contact in contactStore.contacts"
				:key="contact.id"
				class="contact-item"
				:class="{ 'active-contact': contact.id === contactStore.contactId }"
				@click="selectContact(contact.id, contact.contactId)"
			>
				<el-avatar :src="contact.avatar" class="contact-avatar" />
				<span class="contact-name">{{ contact.contactName }}</span>
			</div>
		</div>

		<!-- 申请列表对话框 -->
		<el-dialog v-model="notificationDialog" title="好友申请" width="40%">
			<div v-loading="loading">
				<div
					v-for="item in contactStore.notifications"
					:key="item.id"
					class="request-item"
				>
					<el-avatar :src="item.avatar" />
					<div class="user-info">
						<div class="username">{{ item.userName }}</div>
						<div class="time">申请时间：{{ formatTime(item.createTime) }}</div>
					</div>
					<div class="actions">
						<el-button
							type="success"
							size="small"
							@click="openConfirmDialog(item)"
							>同意</el-button
						>
						<el-button
							type="danger"
							size="small"
							@click="handleResponse(item.id, 4, null)"
							>拒绝</el-button
						>
					</div>
				</div>
			</div>
		</el-dialog>

		<!-- 备注输入对话框 -->
		<el-dialog v-model="remarkDialog" title="设置备注" width="30%">
			<el-input v-model="remarkName" :placeholder="defaultRemark" />
			<template #footer>
				<el-button @click="remarkDialog = false">取消</el-button>
				<el-button type="primary" @click="handleConfirm">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Bell } from '@element-plus/icons-vue';
import { useContactStore } from '@/stores/contactStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ElMessage } from 'element-plus';

const navStore = useNavigationStore();
const contactStore = useContactStore();
const notificationDialog = ref(false);
const remarkDialog = ref(false);
const loading = ref(false);
const remarkName = ref('');
const currentRequest = ref<any>(null);
const defaultRemark = ref('');

// 初始化加载
contactStore.fetchContacts();
contactStore.fetchNotifications();

const formatTime = (timeString: string | undefined) => {
	if (!timeString || !Date.parse(timeString)) {
		// 双重校验
		return '暂无记录';
	}
	return new Date(timeString).toLocaleString();
};

// 打开申请对话框
const openNotificationDialog = async () => {
	try {
		loading.value = true;
		await contactStore.fetchNotifications();
		notificationDialog.value = true;
	} finally {
		loading.value = false;
	}
};

// 处理备注对话框的提交
const handleConfirm = async () => {
	if (!remarkName.value.trim()) {
		ElMessage.warning('备注名称不能为空');
		return;
	}

	await contactStore.confirmRequest({
		id: currentRequest.value.id,
		contactName: remarkName.value,
		status: 1
	});
	remarkDialog.value = false;
	notificationDialog.value = false;
};

// 处理拒绝或同意请求
const handleResponse = async (
	id: number,
	status: number,
	contactName: string | null
) => {
	await contactStore.rejectRequest({ id, status, contactName });
};

// 打开备注对话框
const openConfirmDialog = (item: any) => {
	currentRequest.value = item;
	defaultRemark.value = item.userName;
	remarkName.value = item.userName;
	remarkDialog.value = true;
};

// 选择联系人
const selectContact = (id: number, contactId: number) => {
	navStore.selectItem(id.toString());
	contactStore.selectContact(id, contactId);
};
</script>

<style scoped>
/* 保持原有样式不变 */
.contact-list-container {
	border-right: 1px solid var(--border-color);
	width: 400px;
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 20px;
}

.search-bar {
	display: flex;
	margin-bottom: 20px;
}

.search-input {
	flex: 1;
	margin-right: 10px;
}

.add-button {
	margin-left: 10px;
	width: 30px;
	height: 30px;
}

.notification-item {
	cursor: pointer;
	padding: 12px 20px;
	display: flex;
	align-items: center;
	gap: 8px;
	transition: background 0.3s;

	&:hover {
		background: var(--item-color);
	}

	:deep(.el-badge) {
		margin-left: auto;
	}
}

.request-item {
	display: flex;
	align-items: center;
	padding: 12px;
	border-bottom: 1px solid var(--border-color);

	.el-avatar {
		margin-right: 15px;
	}

	.user-info {
		flex: 1;

		.username {
			font-weight: 500;
		}

		.time {
			color: var(--text-shallow-color);
			font-size: 12px;
		}
	}

	.actions {
		display: flex;
		gap: 8px;
	}
}

.contact-type-selector {
	margin-bottom: 20px;
}

.contact-list {
	flex: 1;
	overflow-y: auto;
}

.contact-item {
	display: flex;
	align-items: center;
	padding: 10px;
	cursor: pointer;
	border-radius: 4px;
	margin-bottom: 5px;
	transition: background-color 0.3s;
}

.contact-item:hover {
	border-radius: 10px;
	background-color: var(--item-active-hover-color);
}

.active-contact {
	border-radius: 10px;
	background-color: var(--item-active-color);
	font-weight: bold;
}

.active-contact:hover {
	border-radius: 10px;
	background-color: var(--item-active-hover-color);
	font-weight: bold;
}

.contact-avatar {
	margin-right: 10px;
}

.contact-name {
	font-size: 14px;
}
</style>
