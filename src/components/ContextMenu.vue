<template>
  <div
    v-if="show"
    class="context-menu"
    :style="{
      left: x + 'px',
      top: y + 'px'
    }"
    @click.stop
  >
    <div class="menu-item" @click="$emit('select-as-obstacles')">
      Set selected as obstacles
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  show: boolean;
  x: number;
  y: number;
}>();

const emit = defineEmits<{
  'select-as-obstacles': [];
  'update:show': [value: boolean];
}>();

// 处理点击事件
const handleClick = () => {
  if (props.show) {
    emit('update:show', false);
  }
};

// 在组件挂载时添加事件监听
onMounted(() => {
  document.addEventListener('click', handleClick);
});

// 在组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClick);
});
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}
</style> 