<template>
	<div class="system-container">
		<!-- 信息卡片 -->
		<el-card class="system-card" v-if="s">
			<template #header>
				<div class="card-header">
					<span class="system-title">角色信息</span>
					<div class="operation-buttons">
						<el-button type="primary" @click="showUpdateDialog = true"
							>更新角色</el-button
						>
						<el-button type="danger" @click="showDeleteDialog = true"
							>删除角色</el-button
						>
					</div>
				</div>
			</template>

			<el-descriptions :column="1" border>
				<el-descriptions-item label="角色名称">{{
					s!.name
				}}</el-descriptions-item>
				<el-descriptions-item label="角色描述">{{
					s!.description
				}}</el-descriptions-item>
				<el-descriptions-item label="访问策略">
					<el-tag
						:type="s!.accessPolicy === 'public' ? 'success' : ''"
						size="small"
					>
						{{ s!.accessPolicy === 'public' ? '公开' : '私有' }}
					</el-tag>
				</el-descriptions-item>
				<el-descriptions-item label="创建时间">{{
					formatTime(s.createTime)
				}}</el-descriptions-item>
			</el-descriptions>

			<div class="card-header">
				<span class="user-title">创建者信息</span>
			</div>
			<el-descriptions :column="1" border>
				<el-descriptions-item label="用户名" v-if="u">{{
					u.userName
				}}</el-descriptions-item>
				<el-descriptions-item label="用户名" v-else>{{
					null
				}}</el-descriptions-item>
				<el-descriptions-item label="姓名" v-if="u">{{
					u.name
				}}</el-descriptions-item>
				<el-descriptions-item label="姓名" v-else>{{
					null
				}}</el-descriptions-item>
			</el-descriptions>
		</el-card>
		<div class="operation-buttons">
			<el-button type="success" @click="createChat">新建对话</el-button>
		</div>
	</div>

	<!-- 更新对话框 -->
	<el-dialog v-model="showUpdateDialog" title="更新角色" align-center>
		<el-form label-width="100px">
			<el-form-item label="角色名称">
				<el-input v-model="s!.name" />
			</el-form-item>
			<el-form-item label="角色描述">
				<el-input
					v-model="s!.description"
					type="textarea"
					:autosize="{ minRows: 2, maxRows: 4 }"
					placeholder="请输入角色描述"
				/>
			</el-form-item>
			<el-form-item label="访问策略">
				<el-select
					v-model="s!.accessPolicy"
					placeholder="访问策略"
					style="width: 240px"
				>
					<el-option
						v-for="item in options"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="showUpdateDialog = false">取消</el-button>
			<el-button type="primary" @click="updateSystem">确认</el-button>
		</template>
	</el-dialog>

	<!-- 删除确认对话框 -->
	<el-dialog
		v-model="showDeleteDialog"
		title="删除确认"
		width="30%"
		align-center
	>
		<span>确定要删除该角色吗？此操作不可恢复！</span>
		<template #footer>
			<el-button @click="showDeleteDialog = false">取消</el-button>
			<el-button type="primary" @click="deleteSystem">确认删除</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useSystemStore } from '@/stores/systemStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useMemoryStore } from '@/stores/memoryStore';
import { useChatStore } from '@/stores/chatStore';
import { formatTime } from '@/utils/time';

const systemStore = useSystemStore();
const navStore = useNavigationStore();
const memoryStore = useMemoryStore();
const chatStore = useChatStore();

const options = [
	{ value: 'public', label: 'public' },
	{ value: 'private', label: 'private' }
];
const s = computed(() => systemStore.selectedSystem);
const u = computed(() => systemStore.systemUser);
const showDeleteDialog = ref(false);
const showUpdateDialog = ref(false);
const showCreateChatDialog = ref(false);

const updateSystem = async () => {
	const success = await systemStore.updateSystem({
		id: s.value!.id,
		name: s.value!.name,
		description: s.value!.description,
		accessPolicy: s.value!.accessPolicy
	});
	if (success) {
		ElMessage.success('更新成功');
	} else {
		ElMessage.error(systemStore.error || '更新失败');
	}
	showUpdateDialog.value = false;
};

const deleteSystem = async () => {
	const success = await systemStore.deleteSystem(s.value!.id);
	if (success) {
		ElMessage.success('删除成功');
		navStore.selectMenu('system');
	} else {
		ElMessage.error(systemStore.error || '删除失败');
	}
	showDeleteDialog.value = false;
};

const createChat = () => {
	systemStore.createChat(s.value!.id).then((success) => {
		if (success) {
			ElMessage.success('创建成功');
			navStore.selectMenu('aiMessage');
			if (systemStore.createdMemoryId !== null) {
				memoryStore.fetchChats().then(() => {
					navStore.selectItem(systemStore.createdMemoryId!);
					memoryStore.selectChat(systemStore.createdMemoryId!);
				});
			}
		} else {
			ElMessage.error(systemStore.error || '创建失败');
		}
	});
	showCreateChatDialog.value = false;
};
</script>

<style scoped>
.system-container {
	background-color: var(--bg-color);
	color: var(--text-color);
	flex: 1;
	display: flex;
	flex-direction: column;
	height: 100vh;
	margin: 20px auto;
	padding: 20px;
}

.system-card,
.user-card {
	margin-bottom: 20px;
}

.card-header {
	font-size: 18px;
	font-weight: bold;
}

.system-title {
	color: var(--text-color);
}

.user-title {
	margin-top: 20px;
	color: var(--text-color);
}

.el-descriptions {
	margin-top: 15px;
}

:deep(.el-descriptions__label) {
	width: 100px;
	font-weight: bold;
}

.operation-buttons {
	display: flex;
	gap: 10px;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.el-button {
	margin-left: 0;
}

::v-deep .el-textarea {
	.el-textarea__inner {
		resize: none;
	}
}
</style>
