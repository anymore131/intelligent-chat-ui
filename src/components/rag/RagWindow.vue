<!-- rag/RagWindow.vue -->
<template>
	<div class="rag-window">
		<div v-if="ragStore.currentRagId && isUploading" class="rag-upload-loading">
			<el-icon class="loading-icon">
				<Loading />
			</el-icon>
			<span>上传到 {{ currentRag?.name }}...</span>
		</div>

		<!-- 头部标题和操作按钮 -->
		<div class="header">
			<div class="header-title">
				{{ currentRag?.name || '知识库详情' }}
				<div class="header-actions" v-if="currentRag">
					<el-button
						type="primary"
						plain
						size="small"
						@click="showEditDialog = true"
					>
						修改名称
					</el-button>
					<el-button type="danger" plain size="small" @click="handleDeleteRag">
						删除
					</el-button>
				</div>
			</div>
		</div>

		<!-- 修改名称对话框 -->
		<el-dialog v-model="showEditDialog" title="修改知识库名称" width="30%">
			<el-form :model="editForm" label-width="80px">
				<el-form-item label="新名称" prop="name">
					<el-input
						v-model="editForm.name"
						placeholder="请输入新的知识库名称"
					/>
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button @click="showEditDialog = false">取消</el-button>
				<el-button type="primary" @click="handleEditRag">确定</el-button>
			</template>
		</el-dialog>

		<el-scrollbar class="scroll-container">
			<!-- 主折叠面板 -->
			<el-collapse class="main-collapse">
				<!-- 文件管理面板 -->
				<el-collapse-item name="files" title="文件">
					<div class="file-management-panel">
						<!-- 文件列表 -->
						<div class="file-list-container">
							<div v-if="ragStore.loading" class="loading-container">
								<el-icon class="is-loading">
									<Loading />
								</el-icon>
								加载中...
							</div>

							<div v-else-if="ragStore.ragFiles.length === 0" class="empty-tip">
								<el-empty description="暂无文件" />
							</div>

							<div v-else class="file-list">
								<div
									v-for="file in sortedFiles"
									:key="file.id"
									class="file-item"
								>
									<div class="file-info">
										<div class="file-name">{{ file.fileName }}</div>
										<div class="file-time">
											{{ formatTime(file.createTime) }}
										</div>
									</div>

									<el-button
										type="primary"
										size="small"
										@click="downloadFile(file)"
									>
										下载
									</el-button>
								</div>
							</div>
						</div>

						<!-- 文件上传区域 -->
						<div class="upload-section">
							<el-upload
								class="upload-dragger"
								drag
								:action="uploadUrl"
								:headers="uploadHeaders"
								:data="{ ragId: ragStore.currentRagId }"
								:multiple="true"
								:show-file-list="false"
								:on-success="handleUploadSuccess"
								:on-error="handleUploadError"
								:before-upload="beforeUpload"
							>
								<el-icon class="el-icon--upload"><upload-filled /></el-icon>
								<div class="el-upload__text">
									拖拽文件到此处或 <em>点击上传</em>
								</div>
								<div class="el-upload__tip">
									支持上传 PDF、Word、Excel、TXT 等文档，单个文件不超过 20MB
								</div>
							</el-upload>
						</div>
					</div>
				</el-collapse-item>

				<!-- 网址面板 -->
				<el-collapse-item name="urls" title="网址">
					<div class="empty-tip">网址管理功能开发中...</div>
				</el-collapse-item>

				<!-- 笔记面板 -->
				<el-collapse-item name="notes" title="笔记">
					<div class="empty-tip">笔记管理功能开发中...</div>
				</el-collapse-item>
			</el-collapse>
		</el-scrollbar>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { UploadFilled, Loading } from '@element-plus/icons-vue';
import { useRagStore } from '@/stores/ragStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useNavigationStore } from '@/stores/navigationStore';
import { formatTime } from '@/utils/time';

const navStore = useNavigationStore();
const ragStore = useRagStore();
const isUploading = ref(false);
const showEditDialog = ref(false);
const editForm = ref({
	name: ''
});

// 计算属性
const currentRag = computed(() => ragStore.currentRag);
const uploadUrl = computed(() => '/api/rag-file/load');
const sortedFiles = computed(() => ragStore.sortedRagFiles);
const uploadHeaders = computed(() => ({
	Authorization: localStorage.getItem('token') || ''
}));

// 获取文件内容类型
const getContentType = (fileName: string) => {
	const ext = fileName.split('.').pop()?.toLowerCase();
	return ext === 'pdf' ? 'pdf' : 'text';
};

// 下载文件
const downloadFile = (file: any) => {
	const link = document.createElement('a');
	link.href = file.fileContent;
	link.download = file.fileName;
	link.click();
};

// 上传前校验
const beforeUpload = (file: File) => {
	const isLt20M = file.size / 1024 / 1024 < 20;
	if (!isLt20M) {
		ElMessage.error('文件大小不能超过 20MB');
		return false;
	}
	isUploading.value = true; // 开始上传时显示加载
	return true;
};

// 上传成功处理
const handleUploadSuccess = (response: any) => {
	isUploading.value = false; // 上传完成隐藏加载
	if (response.code === 200) {
		ElMessage.success('文件上传成功');
		ragStore.fetchRagFiles(ragStore.currentRagId!);
	} else {
		ElMessage.error(response.message || '上传失败');
	}
};

// 上传错误处理
const handleUploadError = (error: any) => {
	isUploading.value = false; // 上传完成隐藏加载
	ElMessage.error('文件上传失败');
};

// 修改知识库名称
const handleEditRag = async () => {
	if (!editForm.value.name.trim()) {
		ElMessage.warning('请输入新的知识库名称');
		return;
	}

	const success = await ragStore.updateRagName(
		ragStore.currentRagId!,
		editForm.value.name
	);

	if (success) {
		ElMessage.success('修改成功');
		showEditDialog.value = false;
		editForm.value.name = '';
	}
};

// 删除知识库
const handleDeleteRag = async () => {
	try {
		await ElMessageBox.confirm(
			`确定要删除知识库 "${currentRag.value?.name}" 吗？删除后将无法恢复`,
			'删除确认',
			{
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}
		);
		const success = await ragStore.deleteRag(ragStore.currentRagId!);
		if (success === true) {
			ElMessage.success('删除成功');
			navStore.selectMenu('rag');
		}
	} catch (error) {
		ElMessage.info('已取消删除');
	}
};

// 监听当前知识库变化
watch(
	() => ragStore.currentRagId,
	(newVal) => {
		if (newVal) {
			ragStore.fetchRagFiles(newVal);
		}
	},
	{ immediate: true }
);

// 监听当前知识库变化，重置编辑表单
watch(
	currentRag,
	(newVal) => {
		if (newVal) {
			editForm.value.name = newVal.name;
		}
	},
	{ immediate: true }
);
</script>

<style scoped>
.rag-window {
	background: var(--bg-color);
	color: var(--text-color);
	height: 100%;
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 16px;
}

.rag-upload-loading {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: var(--bg-color);
	z-index: 1000;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

/* 强作用域限制 */
.rag-window :deep(.rag-upload-loading .loading-icon) {
	font-size: 40px;
	margin: 16px 0;
	color: var(--primary-color);
	animation: rotating 2s linear infinite;
}

@keyframes rotating {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

.header {
	margin-bottom: 16px;
}

.header-title {
	margin: 0 20px;
	font-size: 20px;
	color: var(--primary-color);
}

.header-actions {
	float: right;
	margin: 5px auto 0 0;
	display: flex;
	gap: 8px;
}

.scroll-container {
	flex: 1;
	padding: 0 16px 16px;
}

.file-management {
	flex: 1;
	display: flex;
	gap: 16px;
	overflow: hidden;
}

.main-collapse {
	flex: 1;
	border-radius: 8px;
	overflow: hidden;
}

.file-management-panel {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.file-list-container {
	flex: 1;
	overflow-y: auto;
	margin-bottom: 16px;
	border: 1px solid var(--el-border-color-light);
	border-radius: 4px;
}

.loading-container {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	color: var(--text-shallow-color);
	gap: 8px;
}

.empty-tip {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
}

.file-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.file-item {
	display: flex;
	align-items: center;
	padding: 12px;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.3s;
}

.file-item:hover {
	background-color: var(--el-color-primary-light-9);
}

.file-item:last-child {
	border-bottom: none;
}

.file-item.selected {
	background-color: var(--el-color-primary-light-8);
}

.file-info {
	flex: 1;
	min-width: 0;
}

.file-name {
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.file-time {
	font-size: 12px;
	color: var(--text-shallow-color);
}

.upload-section {
	margin-top: auto;
}

.upload-dragger {
	max-width: 100%;
}

.empty-tip {
	padding: 20px;
	text-align: center;
	color: var(--text-shallow-color);
}
</style>
