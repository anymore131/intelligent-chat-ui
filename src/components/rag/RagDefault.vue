<!-- rag/RagDefault.vue -->
<template>
	<div class="rag-default">
		<h2>知识库管理</h2>
		<p>请从左侧选择知识库或创建新知识库</p>
		<el-button type="primary" @click="showAddDialog = true"
			>创建新知识库</el-button
		>
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRagStore } from '@/stores/ragStore';

const showAddDialog = ref(false);
const ragStore = useRagStore();
const newRagForm = ref({
	name: ''
});

// 添加新RAG
const handleAddRag = async () => {
	if (!newRagForm.value.name.trim()) {
		ElMessage.warning('请输入知识库名称');
		return;
	}

	const success = await ragStore.createRag(newRagForm.value.name);
	if (success) {
		showAddDialog.value = false;
		newRagForm.value.name = '';
	}
};
</script>

<style scoped>
.rag-default {
	flex: 1;
	padding: 20px;
	text-align: center;
}

.rag-default h2 {
	margin-bottom: 16px;
	color: var(--text-color);
}

.rag-default p {
	margin-bottom: 24px;
	color: var(--text-shallow-color);
}
</style>
