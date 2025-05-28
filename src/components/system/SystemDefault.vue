<!-- system/SystemDefault.vue -->
<template>
	<div class="system-default">
		<h2>角色管理</h2>
		<p>请从左侧选择角色或创建角色</p>
		<el-button type="primary" @click="showCreate = true">创建角色</el-button>
	</div>

	<!-- 创建角色弹窗 -->
	<el-dialog
		v-model="showCreate"
		title="新建角色"
		width="600px"
		@closed="
			createName = '';
			createDescription = '';
		"
	>
		<el-form label-width="100px">
			<el-form-item label="角色名称" required>
				<el-input v-model="createName" placeholder="请输入角色名称" clearable />
			</el-form-item>
			<el-form-item label="角色描述" required>
				<el-input
					v-model="createDescription"
					type="textarea"
					:rows="3"
					placeholder="请输入角色描述"
				/>
			</el-form-item>
			<el-form-item label="访问策略">
				<el-radio-group v-model="createAccessPolicy">
					<el-radio label="public">公开（所有用户可见）</el-radio>
					<el-radio label="private">私有（仅自己可见）</el-radio>
				</el-radio-group>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="showCreate = false">取消</el-button>
			<el-button
				type="primary"
				:loading="systemStore.loading"
				@click="createSystem"
			>
				立即创建
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useSystemStore } from '@/stores/systemStore';
import { useNavigationStore } from '@/stores/navigationStore';
import type { SystemRequest } from '@/stores/systemStore';

const systemStore = useSystemStore();
const navStore = useNavigationStore();

const createName = ref();
const createDescription = ref();
const createAccessPolicy = ref('public') || ref('private');
const showCreate = ref(false);

// 创建角色
const createSystem = async () => {
	const request = {
		name: createName.value,
		description: createDescription.value,
		accessPolicy: createAccessPolicy.value
	} as SystemRequest;
	const success = await systemStore.createSystem(request);
	if (success) {
		ElMessage.success('创建成功');
		systemStore.selectedById(systemStore.selectedId!);
		navStore.selectItem(systemStore.selectedId!);
	} else {
		ElMessage.error(systemStore.error || '创建失败');
	}
	showCreate.value = false;
};
</script>

<style scoped>
.system-default {
	flex: 1;
	padding: 20px;
	text-align: center;
}

.system-default h2 {
	margin-bottom: 16px;
	color: var(--text-color);
}

.system-default p {
	margin-bottom: 24px;
	color: var(--text-shallow-color);
}

::v-deep .el-textarea {
	.el-textarea__inner {
		resize: none;
	}
}
</style>
