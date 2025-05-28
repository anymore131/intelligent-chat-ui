<!-- contact/ContactWindow.vue -->
<template>
	<div
		v-if="contactStore.contactDetail !== null"
		class="contact-window-container"
	>
		<!-- 用户头像和信息 -->
		<div class="user-header">
			<div class="user-avatar">
				<el-avatar :size="100" :src="contactStore.contactDetail?.avatar" />
			</div>
			<div class="user-info">
				<h2>{{ contactStore.contactDetail?.contactName }}</h2>
				<p class="user-name">
					{{ contactStore.contactDetail?.name }} (@{{
						contactStore.contactDetail?.userName
					}})
				</p>
				<p class="user-join">
					加入时间: {{ formatTime(contactStore.contactDetail?.userCreateTime) }}
				</p>
			</div>
			<div class="action-buttons">
				<el-button type="info" plain @click="openEditDialog">
					修改备注
				</el-button>
				<el-button
					type="danger"
					plain
					@click="deleteDialogVisible = true"
					:loading="deleteLoading"
				>
					删除好友
				</el-button>
			</div>
		</div>

		<!-- 详细信息 -->
		<div class="detail-section">
			<el-descriptions :column="1" class="custom-descriptions">
				<el-descriptions-item label="最后联系时间">
					<span class="detail-value">
						{{
							contactStore.contactDetail?.lastContactTime
								? formatTime(contactStore.contactDetail?.lastContactTime)
								: '暂无记录'
						}}
					</span>
				</el-descriptions-item>
			</el-descriptions>
		</div>

		<div class="action-buttons">
			<el-button type="primary" plain @click="handleSendMessage"
				>发送消息</el-button
			>
		</div>

		<!-- 删除确认对话框 -->
		<el-dialog v-model="deleteDialogVisible" title="删除确认" width="30%">
			<span
				>确定要删除好友
				{{ contactStore.contactDetail?.contactName }} 吗？此操作不可撤销。</span
			>
			<template #footer>
				<el-button @click="deleteDialogVisible = false">取消</el-button>
				<el-button type="danger" @click="confirmDeleteFriend">确定</el-button>
			</template>
		</el-dialog>

		<!-- 修改备注对话框 -->
		<el-dialog v-model="editDialogVisible" title="修改备注" width="30%">
			<el-input
				v-model="newContactName"
				placeholder="请输入新的备注名称"
				clearable
			/>
			<template #footer>
				<el-button @click="editDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleUpdateContactName"
					>确认修改</el-button
				>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useContactStore } from '@/stores/contactStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useMessageStore } from '@/stores/messageStore';
import { formatTime } from '@/utils/time';

const contactStore = useContactStore();
const navStore = useNavigationStore();
const messageStore = useMessageStore();

const deleteLoading = ref(false);
const deleteDialogVisible = ref(false);
const editDialogVisible = ref(false);
const newContactName = ref('');

// 删除好友
const confirmDeleteFriend = async () => {};

// 打开修改备注对话框
const openEditDialog = () => {
	newContactName.value = contactStore.contactDetail?.contactName || '';
	editDialogVisible.value = true;
};

// 修改备注名称
const handleUpdateContactName = async () => {
	if (!newContactName.value.trim()) {
		ElMessage.warning('备注名称不能为空');
		return;
	}

	try {
		await contactStore.updateContactName(
			contactStore.contactDetail!.id,
			newContactName.value
		);
		ElMessage.success('修改成功');
		editDialogVisible.value = false;
	} catch (error) {
		ElMessage.error((error as Error).message || '修改失败');
	}
};

// 发送消息
const handleSendMessage = () => {
	if (contactStore.contactId) {
		const contactId = contactStore.contact?.contactId;

		if (contactId) {
			messageStore.createChat(contactId).then(() => {
				navStore.selectMenu('message');
				messageStore.selectedContactId = contactId;
			});
		}
	}
};
</script>

<style scoped>
.contact-window-container {
	flex: 1;
	max-width: 1200px;
	min-height: 600px;
	margin: 20px auto;
	padding: 30px;
	background-color: var(--bg-color);
	color: var(--text-color);
	border-radius: 8px;
}

.user-header {
	display: flex;
	align-items: center;
	margin-bottom: 40px;
	padding-bottom: 20px;
	border-bottom: 1px solid var(--border-color);
	position: relative;
}

.user-avatar {
	margin-right: 30px;
}

.user-info {
	flex: 1;
}

.user-info h2 {
	margin: 0 0 10px 0;
	font-size: 28px;
	color: var(--text-color);
	font-weight: 500;
}

.user-name {
	margin: 0 0 8px 0;
	color: var(--text-color);
	font-size: 16px;
}

.user-join {
	margin: 0;
	color: var(--text-shallow-color);
	font-size: 14px;
}

.detail-section {
	width: 80%;
	margin: 0 auto;
}

.custom-descriptions :deep(.el-descriptions__label) {
	width: 150px;
	text-align: right;
	font-weight: bold;
	color: var(--text-shallow-color);
}

.custom-descriptions :deep(.el-descriptions__content) {
	text-align: left;
	padding-left: 30px;
}

.detail-value {
	font-size: 16px;
	color: var(--text-shallow-color);
}

.action-buttons {
	display: flex;
	/* flex-direction: column; */
	gap: 15px;
	margin-top: 30px;
}

.loading-container {
	padding: 30px;
	max-width: 1200px;
	margin: 20px auto;
}
</style>
