<!-- AvatarDialog.vue -->
<template>
	<!-- 修改头像的主对话框 -->
	<el-dialog v-model="avatarDialogVisible" title="修改头像" width="70%">
		<div class="avatar-selection">
			<div
				v-for="avatar in avatarList"
				:key="avatar.id"
				class="avatar-item"
				:class="{
					'active-avatar': avatar.status === 1,
					'selected-avatar': selectedAvatarId === avatar.id
				}"
				@click="selectedAvatarId = avatar.id"
			>
				<img :src="avatar.avatar" alt="用户头像" />
				<div v-if="avatar.status === 1" class="active-badge">使用中</div>
				<div v-if="selectedAvatarId === avatar.id" class="selected-badge">
					✓
				</div>
			</div>
		</div>

		<template #footer>
			<el-button @click="avatarDialogVisible = false">取消</el-button>
			<el-button type="primary" @click="handleConfirmAvatar">确定</el-button>
			<el-button type="primary" @click="showUploadDialog = true"
				>添加头像</el-button
			>
		</template>
	</el-dialog>

	<!-- 上传头像的对话框 -->
	<el-dialog v-model="showUploadDialog" title="上传新头像" width="50%">
		<el-upload
			class="avatar-uploader"
			action="#"
			:show-file-list="false"
			:before-upload="beforeAvatarUpload"
			:http-request="handleAvatarUpload"
		>
			<img v-if="uploadedImage" :src="uploadedImage" class="avatar" />
			<el-icon v-else class="avatar-uploader-icon">
				<Plus />
			</el-icon>
		</el-upload>

		<template #footer>
			<el-button @click="showUploadDialog = false">取消</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElLoading } from 'element-plus';
import { useUserStore } from '@/stores/userStore';
import { Plus } from '@element-plus/icons-vue';
import AvatarDialog from '@/components/AvatarDialog.vue';

const userStore = useUserStore();

const avatarDialogVisible = ref(false);
const showUploadDialog = ref(false);
const avatarList = ref<AvatarInfo[]>([]);
const selectedAvatarId = ref<number | null>(null);
const uploadedImage = ref<string>('');

// 定义 AvatarInfo 接口
interface AvatarInfo {
	id: number;
	userId: number;
	avatar: string;
	status: number; // 1-启用, 0-未启用
	createTime: string;
	updateTime: string;
}

// 打开头像选择对话框
const openAvatarDialog = async () => {
	const loading = ElLoading.service({ lock: true });
	try {
		avatarList.value = await userStore.fetchAvatarList();
		selectedAvatarId.value =
			avatarList.value.find((a) => a.status === 1)?.id || null;
		avatarDialogVisible.value = true;
	} finally {
		loading.close();
	}
};

// 确认选择头像
const handleConfirmAvatar = async () => {
	if (!selectedAvatarId.value) {
		ElMessage.warning('请选择要使用的头像');
		return;
	}

	const loading = ElLoading.service({ lock: true });
	try {
		const success = await userStore.changeAvatar(selectedAvatarId.value);
		if (success) {
			ElMessage.success('头像修改成功');
			// 重新获取头像列表和当前头像
			avatarList.value = await userStore.fetchAvatarList();
			await userStore.fetchUserAvatar();
			avatarDialogVisible.value = false; // 修改成功后关闭对话框
		} else {
			ElMessage.error('头像修改失败');
		}
	} finally {
		loading.close();
	}
};

// 上传前校验
const beforeAvatarUpload = (file: File) => {
	const isImage = file.type.startsWith('image/');
	const isLt2M = file.size / 1024 / 1024 < 2;

	if (!isImage) {
		ElMessage.error('只能上传图片文件!');
	}
	if (!isLt2M) {
		ElMessage.error('图片大小不能超过2MB!');
	}

	return isImage && isLt2M;
};

// 处理头像上传
const handleAvatarUpload = async (options: any) => {
	const { file } = options;
	const reader = new FileReader();

	reader.onload = (e) => {
		uploadedImage.value = e.target?.result as string;
	};
	reader.readAsDataURL(file);

	// const loading = ElLoading.service({ lock: true })
	try {
		const success = await userStore.uploadAvatar(file);
		if (success) {
			ElMessage.success('头像上传成功');
			// 刷新头像列表
			avatarList.value = await userStore.fetchAvatarList();
			showUploadDialog.value = false;
			uploadedImage.value = '';
		} else {
			ElMessage.error('头像上传失败');
		}
	} finally {
		// loading.close()
	}
};

// 暴露方法给父组件
defineExpose({
	openAvatarDialog
});
</script>

<style scoped>
.avatar-selection {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
	gap: 20px;
	max-height: 60vh;
	overflow-y: auto;
}

.avatar-item {
	position: relative;
	width: 100px;
	height: 100px;
	border-radius: 8px;
	overflow: hidden;
	cursor: pointer;
	transition: all 0.3s;
	border: 2px solid transparent;
}

.avatar-item img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.active-avatar {
	border-color: var(--el-color-primary);
}

/* 被选中的头像样式 */
.selected-avatar {
	border-color: var(--el-color-success);
	box-shadow: 0 0 0 3px rgba(var(--el-color-success-rgb), 0.3);
}

.active-badge {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: var(--el-color-primary);
	color: white;
	text-align: center;
	font-size: 12px;
	padding: 2px 0;
}

.selected-badge {
	position: absolute;
	top: 0;
	right: 0;
	width: 24px;
	height: 24px;
	background-color: var(--el-color-success);
	color: white;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	font-weight: bold;
}

.avatar-uploader {
	display: flex;
	justify-content: center;
}

.avatar-uploader .avatar {
	width: 200px;
	height: 200px;
	display: block;
	object-fit: cover;
	border-radius: 8px;
}

.avatar-uploader-icon {
	font-size: 28px;
	color: #8c939d;
	width: 200px;
	height: 200px;
	line-height: 200px;
	text-align: center;
	border: 1px dashed var(--el-border-color);
	border-radius: 8px;
	cursor: pointer;
	transition: border-color 0.3s;
}

.avatar-uploader-icon:hover {
	border-color: var(--el-color-primary);
}
</style>
