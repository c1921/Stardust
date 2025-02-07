<template>
  <div class="modal fade show" v-if="star" tabindex="-1" 
    style="display: block">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content bg-dark bg-opacity-75">
        <div class="modal-header">
          <div class="d-flex justify-content-between align-items-center w-100">
            <h5 class="modal-title">{{ star.name }}</h5>
            <small class="text-muted">ID: {{ star.id }}</small>
          </div>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <StarSystemOrbits :star="star" class="mb-4" />
          <div class="d-flex flex-column gap-3">
            <div class="d-flex gap-3">
              <div class="text-secondary fw-medium w-25">Temperature:</div>
              <div>
                {{ Math.round(star.temperature) }}K
                <small class="text-muted ms-2">
                  ({{ getStarClass(star.temperature) }}-class)
                </small>
              </div>
            </div>

            <div class="d-flex gap-3">
              <div class="text-secondary fw-medium w-25">Position:</div>
              <div>
                X: {{ star.position.x.toFixed(2) }}<br>
                Y: {{ star.position.y.toFixed(2) }}<br>
                Z: {{ star.position.z.toFixed(2) }}
              </div>
            </div>

            <div class="d-flex gap-3">
              <div class="text-secondary fw-medium w-25">Distance from Center:</div>
              <div>
                {{ star.position.length().toFixed(2) }} ly
              </div>
            </div>

            <div class="d-flex gap-3">
              <div class="text-secondary fw-medium w-25">Star Type:</div>
              <div>
                {{ getStarType(star.temperature) }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SelectedStar } from './StarMap.vue'
import StarSystemOrbits from './StarSystemOrbits.vue'

const { star } = defineProps<{
  star: SelectedStar | null
}>()

defineEmits<{
  close: []
}>()

// 根据温度获取恒星光谱分类
const getStarClass = (temperature: number): string => {
  if (temperature >= 30000) return 'O'
  if (temperature >= 10000) return 'B'
  if (temperature >= 7500) return 'A'
  if (temperature >= 6000) return 'F'
  if (temperature >= 5200) return 'G'
  if (temperature >= 3700) return 'K'
  return 'M'
}

// 根据温度获取恒星类型描述
const getStarType = (temperature: number): string => {
  if (temperature >= 30000) return 'Blue Giant'
  if (temperature >= 10000) return 'Blue-White Star'
  if (temperature >= 7500) return 'White Star'
  if (temperature >= 6000) return 'Yellow-White Star'
  if (temperature >= 5200) return 'Yellow Star'
  if (temperature >= 3700) return 'Orange Star'
  return 'Red Dwarf'
}
</script> 