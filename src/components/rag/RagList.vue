<!-- rag/RagList.vue -->
<template>
	<div class="rag-list-container">
		<!-- 添加知识库按钮 -->
		<div class="rag-item add-rag" @click="showAddDialog = true">
			<span>+ 添加知识库</span>
		</div>

		<!-- RAG列表 -->
		<div class="rag-list">
			<div
				v-for="rag in sortedRagList"
				:key="rag.id"
				class="rag-item"
				:class="{ 'active-rag': rag.id === currentRagId }"
				@click="selectRag(rag.id)"
			>
				<span>{{ rag.name }}</span>
				<div class="rag-time">{{ formatTime(rag.createTime) }}</div>
			</div>
		</div>

		<!-- 添加知识库对话框 -->
		<el-dialog v-model="showAddDialog" title="添加知识库" width="30%">
			<el-form :model="newRagForm" label-width="80px">
				<el-form-item label="名称" prop="name">
					<el-input v-model="newRagForm.name" placeholder="请输入知识库名称" />
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button @click="showAddDialog = false">取消</el-button>
				<el-button type="primary" @click="handleAddRag">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useRagStore } from '@/stores/ragStore';
import { useNavigationStore } from '@/stores/navigationStore';

const ragStore = useRagStore();
const navStore = useNavigationStore();

ragStore.fetchRagList();

const showAddDialog = ref(false);
const newRagForm = ref({
	name: ''
});

// 计算属性
const sortedRagList = computed(() => ragStore.sortedRagList);
const currentRagId = computed(() => ragStore.currentRagId);

// 格式化时间
const formatTime = (timeString: string) => {
	return new Date(timeString).toLocaleDateString();
};

// 选择知识库
const selectRag = (ragId: number) => {
	ragStore.setCurrentRag(ragId);
	navStore.selectItem(ragId.toString()); // 通知导航store
};

// 添加新RAG
const handleAddRag = async () => {
	if (!newRagForm.value.name.trim()) {
		ElMessage.warning('请输入知识库名称');
		return;
	}

	const success = await ragStore.createRag(newRagForm.value.name);
	if (success) {
		showAddDialog.value = false;
		ElMessage.success('知识库创建成功');
		newRagForm.value.name = '';
	}
};
</script>

<style scoped>
.rag-list-container {
	border-right: 1px solid var(--border-color);
	width: 300px;
	height: 100vh;
	padding: 20px;
	max-width: 800px;
	display: flex;
	flex-direction: column;
}

.rag-item {
	padding: 12px 16px;
	margin-bottom: 10px;
	background-color: var(--item-color);
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.3s;
}

.rag-item:hover {
	background-color: var(--item-active-color);
	transform: translateX(5px);
}

/* 选中状态的样式 */
.active-rag {
	background-color: var(--item-active-color);
	font-weight: 500;
	box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

/* 选中状态的样式 */
.active-rag:hover {
	background-color: var(--item-active-hover-color);
	font-weight: 500;
	box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.add-rag {
	background-color: var(--item-color);
	font-weight: bold;
	margin-bottom: 20px;
}

.add-rag:hover {
	background-color: var(--item-deep-color);
}

.rag-list {
	margin-top: 10px;
}
</style>
