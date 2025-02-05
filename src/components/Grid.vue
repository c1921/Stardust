<template>
  <div class="grid-container">
    <div class="grid"
      @mousedown="startSelection"
      @mousemove="updateSelection"
      @mouseup="endSelection"
      @mouseleave="endSelection"
    >
      <div v-for="row in 10" :key="row" class="grid-row">
        <Cell
          v-for="col in 10"
          :key="col"
          :row="row"
          :col="col"
          :selected="isSelected(row, col)"
          :obstacle="isObstacle(row, col)"
          :selecting="isInSelectionArea(row, col)"
          @context-menu="(event) => showContextMenu(event, row, col)"
        />
      </div>
    </div>
    
    <ContextMenu
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      @select-as-obstacles="setSelectedAsObstacles"
      @update:show="(value) => contextMenu.show = value"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import Cell from './Cell.vue';
import ContextMenu from './ContextMenu.vue';

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

// 障碍物格子
const obstacles = reactive(new Set<string>());

// 选择状态
const isSelecting = ref(false);
const selectionStart = reactive({ row: 0, col: 0 });
const selectionEnd = reactive({ row: 0, col: 0 });

// 显示右键菜单
const showContextMenu = (event: MouseEvent, row: number, col: number) => {
  contextMenu.show = true;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.row = row;
  contextMenu.col = col;
};

// 开始选择
const startSelection = (event: MouseEvent) => {
  if (event.button !== 0) return; // 只响应左键
  const cell = getCellFromEvent(event);
  if (!cell) return;
  
  isSelecting.value = true;
  selectionStart.row = cell.row;
  selectionStart.col = cell.col;
  selectionEnd.row = cell.row;
  selectionEnd.col = cell.col;
  
  // 如果没有按住 shift，清除之前的选择
  if (!event.shiftKey) {
    selectedCells.clear();
  }
  
  updateSelectedCells();
};

// 更新选择
const updateSelection = (event: MouseEvent) => {
  if (!isSelecting.value) return;
  
  const cell = getCellFromEvent(event);
  if (!cell) return;
  
  selectionEnd.row = cell.row;
  selectionEnd.col = cell.col;
  updateSelectedCells();
};

// 结束选择
const endSelection = () => {
  isSelecting.value = false;
};

// 从事件获取单元格坐标
const getCellFromEvent = (event: MouseEvent) => {
  const element = event.target as HTMLElement;
  if (!element.classList.contains('grid-cell')) return null;
  
  const row = parseInt(element.textContent?.split(',')[0] || '0');
  const col = parseInt(element.textContent?.split(',')[1] || '0');
  return { row, col };
};

// 更新选中的单元格
const updateSelectedCells = () => {
  const startRow = Math.min(selectionStart.row, selectionEnd.row);
  const endRow = Math.max(selectionStart.row, selectionEnd.row);
  const startCol = Math.min(selectionStart.col, selectionEnd.col);
  const endCol = Math.max(selectionStart.col, selectionEnd.col);
  
  // 创建一个临时集合来存储新选择的单元格
  const newSelection = new Set<string>();
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (!isObstacle(row, col)) {  // 不选中障碍物
        newSelection.add(`${row},${col}`);
      }
    }
  }
  
  // 将新选择的单元格添加到已选择的集合中
  newSelection.forEach(cell => {
    selectedCells.add(cell);
  });
};

// 判断是否在当前选择区域内
const isInSelectionArea = (row: number, col: number) => {
  if (!isSelecting.value) return false;
  
  const startRow = Math.min(selectionStart.row, selectionEnd.row);
  const endRow = Math.max(selectionStart.row, selectionEnd.row);
  const startCol = Math.min(selectionStart.col, selectionEnd.col);
  const endCol = Math.max(selectionStart.col, selectionEnd.col);
  
  return row >= startRow && row <= endRow && col >= startCol && col <= endCol;
};

// 将选中的格子设为障碍物
const setSelectedAsObstacles = () => {
  selectedCells.forEach(cellKey => {
    obstacles.add(cellKey);
  });
  selectedCells.clear();
  contextMenu.show = false;
};

// 判断格子是否被选中
const isSelected = (row: number, col: number) => {
  return selectedCells.has(`${row},${col}`);
};

// 判断格子是否是障碍物
const isObstacle = (row: number, col: number) => {
  return obstacles.has(`${row},${col}`);
};
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

.grid-cell.obstacle {
  background-color: #595959;
  border-color: #434343;
  color: white;
}

.grid-cell.obstacle:hover {
  background-color: #434343;
}

.grid-cell.selecting {
  background-color: rgba(24, 144, 255, 0.3);
}

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