<template>
  <div
    class="grid-cell"
    :class="{
      'selected': selected,
      'obstacle': obstacle,
      'selecting': selecting
    }"
    @contextmenu.prevent="$emit('context-menu', $event)"
  >
    {{ row }},{{ col }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  row: number;
  col: number;
  selected: boolean;
  obstacle: boolean;
  selecting: boolean;
}>();

defineEmits<{
  'context-menu': [event: MouseEvent];
}>();
</script>

<style scoped>
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
</style> 