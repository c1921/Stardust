<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="card-title mb-0">Star Map</h5>
        <div class="d-flex align-items-center gap-3">
          <div class="form-check form-switch">
            <input 
              class="form-check-input" 
              type="checkbox" 
              v-model="showRoutes"
              @change="toggleRoutes"
            >
            <label class="form-check-label text-muted">
              <small>Show Routes</small>
            </label>
          </div>
          <div v-if="selectedStar" class="text-muted me-3">
            <small>
              Selected Star: {{ selectedStar.name }} 
              ({{ Math.round(selectedStar.temperature) }}K)
            </small>
          </div>
          <div class="text-muted">
            <small>
              Stars: {{ starCount }} | 
              Hyperspace Routes: {{ Math.floor(routeCount) }}
            </small>
          </div>
        </div>
      </div>
      <div 
        ref="container" 
        class="star-map-container"
        @click="handleStarClick"
        @mousemove="handleMouseMove"
      ></div>
    </div>
    <StarSystem 
      :star="selectedStar" 
      @close="selectedStar = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StarSystem from './StarSystem.vue'
import { useStarMap } from '../composables/useStarMap'
import type { SelectedStar } from '../types/star'

const container = ref<HTMLDivElement | null>(null)

const {
  starCount,
  routeCount,
  showRoutes,
  selectedStar,
  handleStarClick,
  handleMouseMove,
  toggleRoutes
} = useStarMap(container)

// 导出 SelectedStar 类型供其他组件使用
export type { SelectedStar }
</script>

<style scoped>
.star-map-container {
  width: 100%;
  height: 600px;
  background-color: black;
  cursor: pointer;
}

.form-check-input {
  cursor: pointer;
}

.form-check-label {
  cursor: pointer;
  user-select: none;
}
</style> 