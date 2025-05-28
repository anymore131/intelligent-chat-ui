<!-- home/List.vue -->
<template>
	<div class="list-container">
		<component :is="currentListComponent" :selectedId="navStore.selectedItemId" @select="handleSelectItem" />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNavigationStore } from '@/stores/navigationStore'
import { ElMessage } from 'element-plus'
import messageList from '@/components/message/MessageList.vue';
import ChatList from '@/components/aiMessage/ChatList.vue'
import SystemList from '@/components/system/SystemList.vue'
import RagList from '@/components/rag/RagList.vue'
import ContactList from '@/components/contact/ContactList.vue'

const navStore = useNavigationStore()

const componentMap: Record<string, any> = {
	message: messageList,
	aiMessage: ChatList,
	system: SystemList,
	rag: RagList,
	contact: ContactList,
	// 其他菜单对应组件...
}

const currentListComponent = computed(() => {
	return componentMap[navStore.selectedMenu] || ElMessage.info('编辑资料功能待实现')
})

const handleSelectItem = (id: string | number) => {
	navStore.selectItem(id)
}
</script>