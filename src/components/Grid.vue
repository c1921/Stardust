<template>
  <div class="grid-container">
    <div class="grid">
      <div v-for="row in 10" :key="row" class="grid-row">
        <div
          v-for="col in 10"
          :key="col"
          class="grid-cell"
          :class="{ 'selected': isSelected(row, col) }"
          @contextmenu.prevent="showContextMenu($event, row, col)"
        >
          {{ row }},{{ col }}
        </div>
      </div>
    </div>
    
    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{
        left: contextMenu.x + 'px',
        top: contextMenu.y + 'px'
      }"
    >
      <div class="menu-item" @click="selectCell">Select this cell</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue';

// 右键菜单状态
const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  row: 0,
  col: 0
});

// 选中的格子
const selectedCells = reactive(new Set<string>());

// 显示右键菜单
const showContextMenu = (event: MouseEvent, row: number, col: number) => {
  contextMenu.show = true;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.row = row;
  contextMenu.col = col;
};

// 选择格子
const selectCell = () => {
  const cellKey = `${contextMenu.row},${contextMenu.col}`;
  if (selectedCells.has(cellKey)) {
    selectedCells.delete(cellKey);
  } else {
    selectedCells.add(cellKey);
  }
  contextMenu.show = false;
};

// 判断格子是否被选中
const isSelected = (row: number, col: number) => {
  return selectedCells.has(`${row},${col}`);
};

// 处理点击事件的函数
const handleClick = () => {
  contextMenu.show = false;
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
.grid-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.grid {
  display: flex;
  flex-direction: column;
  border: 2px solid #333;
}

.grid-row {
  display: flex;
}

.grid-cell {
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.grid-cell:hover {
  background-color: #f0f0f0;
}

.grid-cell.selected {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
}

.menu-item:hover {
  background-color: #f5f5f5;
}
</style> 