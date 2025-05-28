<template>
	<div class="system-list-container">
		<!-- 操作栏 -->
		<div class="operation-bar">
			<el-button type="primary" @click="showCreate = true">新建角色</el-button>
		</div>

		<!-- 角色列表 -->
		<div class="system-list">
			<el-card shadow="never">
				<template #header>
					<span>角色列表（{{ systemStore.systems.length }}）</span>
				</template>

				<el-empty
					v-if="systemStore.systems.length === 0"
					description="暂无角色"
				/>

				<div
					v-for="system in systemStore.systems"
					:key="system.id"
					class="system-item"
					:class="{ selected: system.id === systemStore.selectedId }"
					@click="selectSystem(system.id)"
				>
					<div class="system-info">
						<div class="system-meta">
							<span class="system-name">{{ system.name }}</span>
							<el-tag
								:type="system.accessPolicy === 'public' ? 'success' : ''"
								size="small"
							>
								{{ system.accessPolicy === 'public' ? '公开' : '私有' }}
							</el-tag>
						</div>
					</div>
				</div>
			</el-card>
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
					<el-input
						v-model="createName"
						placeholder="请输入角色名称"
						clearable
					/>
				</el-form-item>
				<el-form-item label="角色描述">
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
				<el-button type="primary" @click="createSystem"> 立即创建 </el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useSystemStore } from '@/stores/systemStore';
import { useNavigationStore } from '@/stores/navigationStore';
import type { SystemRequest } from '@/stores/systemStore';

const systemStore = useSystemStore();
const navStore = useNavigationStore();

const createName = ref('');
const createDescription = ref('');
const createAccessPolicy = ref('public') || ref('private');
const showCreate = ref(false);

// 初始化对话
onMounted(() => {
	init();
});

// 初始化
const init = () => {
	systemStore.fetchSystems();
	if (systemStore.error !== null) {
		ElMessage.error(systemStore.error);
	}
};

// 选择角色
const selectSystem = (systemId: number) => {
	navStore.selectItem(systemId);
	systemStore.selectedById(systemId);
};

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
		navStore.selectItem(systemStore.selectedId!);
	} else {
		ElMessage.error(systemStore.error || '创建失败');
	}
	showCreate.value = false;
};
</script>

<style scoped lang="scss">
.system-list-container {
	border-right: 1px solid var(--border-color);
	padding: 20px;
	width: 300px;
	height: 100vh;

	.operation-bar {
		margin-bottom: 20px;
	}

	.system-list {
		.system-item {
			padding: 16px;
			margin-bottom: 12px;
			border-radius: 4px;
			border: 1px solid var(--border-color);
			cursor: pointer;
			transition: all 0.3s;

			&:hover {
				border-color: var(--nav-bg-color);
				background-color: var(--item-active-hover-color);
			}

			&.selected {
				border-color: var(--nav-bg-color);
				background-color: var(--item-active-color);
			}

			.system-meta {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-bottom: 8px;

				.system-name {
					font-size: 15px;
					font-weight: 500;
				}
			}

			.system-description {
				margin: 0;
				font-size: 13px;
				color: var(--text-shallow-color);
				line-height: 1.5;
			}
		}
	}

	:deep(.el-card__header) {
		background-color: var(--bg-card-color);
	}
}

::v-deep .el-textarea {
	.el-textarea__inner {
		resize: none;
	}
}
</style>
