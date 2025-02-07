<template>
  <div class="orbit-map">
    <svg 
      ref="svg" 
      class="w-100 h-100"
      :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel.prevent="handleWheel"
    >
      <!-- 背景网格 -->
      <circle
        v-for="r in gridCircles"
        :key="r"
        :r="r"
        cx="0"
        cy="0"
        fill="none"
        :stroke="ORBIT_CONFIG.colors.grid"
        stroke-width="1"
      />

      <!-- 行星轨道和行星 -->
      <g v-for="planet in PLANETS" :key="planet.name">
        <!-- 轨道 -->
        <circle
          :r="planet.orbitRadius"
          cx="0"
          cy="0"
          fill="none"
          :stroke="planet.color"
          stroke-width="1.5"
        />
        <!-- 行星和文字分开处理 -->
        <g :transform="`rotate(${planet.angle * 180 / Math.PI})`">
          <circle
            :cx="planet.orbitRadius"
            cy="0"
            r="3"
            :fill="planet.color"
          />
        </g>
        <!-- 文字不旋转，使用计算后的坐标 -->
        <text
          :x="planet.orbitRadius * Math.cos(planet.angle)"
          :y="planet.orbitRadius * Math.sin(planet.angle)"
          :fill="ORBIT_CONFIG.colors.labels"
          font-size="12"
          :dx="8"
          :dy="4"
        >{{ planet.name }}</text>
      </g>

      <!-- 中心恒星 -->
      <g v-if="star">
        <circle
          r="5"
          cx="0"
          cy="0"
          :fill="ORBIT_CONFIG.colors.star"
        />
        <text
          x="0"
          y="-15"
          :fill="ORBIT_CONFIG.colors.labels"
          font-size="14"
          text-anchor="middle"
        >{{ star.name }}</text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { SelectedStar } from '../types/star'

const { star } = defineProps<{
  star: SelectedStar | null
}>()

// 轨道配置
const ORBIT_CONFIG = {
  colors: {
    grid: '#1a1a1a',
    labels: '#4a9cbc',
    star: '#ffffff'
  }
}

// 行星配置
interface Planet {
  name: string
  orbitRadius: number
  color: string
  angle: number
}

// 行星数据
const PLANETS: Planet[] = [
  { name: 'Planet I', orbitRadius: 20, color: '#4a9cbc', angle: Math.random() * Math.PI * 2 },
  { name: 'Planet II', orbitRadius: 35, color: '#6a5acd', angle: Math.random() * Math.PI * 2 },
  { name: 'Planet III', orbitRadius: 55, color: '#20b2aa', angle: Math.random() * Math.PI * 2 },
  { name: 'Planet IV', orbitRadius: 80, color: '#ba55d3', angle: Math.random() * Math.PI * 2 }
]

// 视图状态
const viewBox = reactive({
  x: -150,
  y: -150,
  width: 300,
  height: 300
})

// 网格圆圈半径
const gridCircles = [20, 40, 60, 80, 100]

// 平移和缩放状态
const dragState = reactive({
  isDragging: false,
  lastX: 0,
  lastY: 0
})

// 鼠标事件处理
const handleMouseDown = (event: MouseEvent) => {
  dragState.isDragging = true
  dragState.lastX = event.clientX
  dragState.lastY = event.clientY
}

const handleMouseMove = (event: MouseEvent) => {
  if (!dragState.isDragging) return
  
  const deltaX = event.clientX - dragState.lastX
  const deltaY = event.clientY - dragState.lastY
  
  viewBox.x -= deltaX * viewBox.width / 300
  viewBox.y -= deltaY * viewBox.height / 300
  
  dragState.lastX = event.clientX
  dragState.lastY = event.clientY
}

const handleMouseUp = () => {
  dragState.isDragging = false
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  
  const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9
  const minScale = 0.5
  const maxScale = 2
  
  const newWidth = viewBox.width * zoomFactor
  const newHeight = viewBox.height * zoomFactor
  
  if (newWidth / 300 >= minScale && newWidth / 300 <= maxScale) {
    const mouseX = event.offsetX / 300 * viewBox.width + viewBox.x
    const mouseY = event.offsetY / 300 * viewBox.height + viewBox.y
    
    viewBox.x = mouseX - (mouseX - viewBox.x) * zoomFactor
    viewBox.y = mouseY - (mouseY - viewBox.y) * zoomFactor
    viewBox.width = newWidth
    viewBox.height = newHeight
  }
}

// 重置行星位置
const resetPlanetPositions = () => {
  PLANETS.forEach(planet => {
    planet.angle = Math.random() * Math.PI * 2
  })
}

// 监听恒星变化
watch(() => star, () => {
  resetPlanetPositions()
})
</script>

<style scoped>
.orbit-map {
  width: 100%;
  height: 300px;
  background-color: #000;
  overflow: hidden;
}

svg {
  cursor: grab;
}

svg:active {
  cursor: grabbing;
}
</style> 