<template>
  <div class="orbit-map">
    <canvas ref="canvas" class="w-100 h-100"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { SelectedStar } from './StarMap.vue'

const { star } = defineProps<{
  star: SelectedStar | null
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

// 行星配置
interface Planet {
  name: string
  orbitRadius: number
  color: string
}

// 添加行星数据
const PLANETS: Planet[] = [
  { name: 'Planet I', orbitRadius: 20, color: '#4a9cbc' },
  { name: 'Planet II', orbitRadius: 35, color: '#6a5acd' },
  { name: 'Planet III', orbitRadius: 55, color: '#20b2aa' },
  { name: 'Planet IV', orbitRadius: 80, color: '#ba55d3' }
]

// 修改轨道配置
const ORBIT_CONFIG = {
  centerX: 0,
  centerY: 0,
  scale: 1,
  gridSize: 50,
  orbitColors: {
    grid: '#1a1a1a',
    orbits: '#2a4b5c',
    labels: '#4a9cbc',
    star: '#ffffff',
    planet: '#4a9cbc'
  }
}

// 初始化画布
const initCanvas = () => {
  if (!canvas.value) return
  
  // 设置画布大小
  const container = canvas.value.parentElement
  if (!container) return
  
  canvas.value.width = container.clientWidth
  canvas.value.height = container.clientHeight
  
  ctx = canvas.value.getContext('2d')
  if (!ctx) return
  
  // 设置中心点
  ORBIT_CONFIG.centerX = canvas.value.width / 2
  ORBIT_CONFIG.centerY = canvas.value.height / 2
  
  // 计算缩放比例
  ORBIT_CONFIG.scale = Math.min(canvas.value.width, canvas.value.height) / 300
}

// 绘制网格
const drawGrid = () => {
  if (!ctx || !canvas.value) return
  
  ctx.strokeStyle = ORBIT_CONFIG.orbitColors.grid
  ctx.lineWidth = 1
  
  // 只绘制同心圆
  for (let r = ORBIT_CONFIG.gridSize; r < Math.min(canvas.value.width, canvas.value.height) / 2; r += ORBIT_CONFIG.gridSize) {
    ctx.beginPath()
    ctx.arc(ORBIT_CONFIG.centerX, ORBIT_CONFIG.centerY, r * ORBIT_CONFIG.scale, 0, Math.PI * 2)
    ctx.stroke()
  }
}

// 绘制轨道标签
const drawLabels = () => {
  if (!ctx || !canvas.value) return
  
  ctx.fillStyle = ORBIT_CONFIG.orbitColors.labels
  ctx.font = '12px Arial'
  ctx.textAlign = 'left'
  
  // 绘制距离标签
  for (let r = ORBIT_CONFIG.gridSize; r < Math.min(canvas.value.width, canvas.value.height) / 2; r += ORBIT_CONFIG.gridSize) {
    const label = `${r} ly`
    ctx.fillText(label, ORBIT_CONFIG.centerX + r * ORBIT_CONFIG.scale + 5, ORBIT_CONFIG.centerY)
  }
}

// 绘制中心恒星
const drawStar = () => {
  if (!ctx || !star) return
  
  ctx.fillStyle = ORBIT_CONFIG.orbitColors.star
  ctx.beginPath()
  ctx.arc(ORBIT_CONFIG.centerX, ORBIT_CONFIG.centerY, 5, 0, Math.PI * 2)
  ctx.fill()
  
  // 绘制恒星名称
  ctx.fillStyle = ORBIT_CONFIG.orbitColors.labels
  ctx.font = '14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(star.name, ORBIT_CONFIG.centerX, ORBIT_CONFIG.centerY - 15)
}

// 添加行星绘制函数
const drawPlanets = () => {
  if (!ctx) return
  
  PLANETS.forEach(planet => {
    // 使用非空断言操作符 (!)
    ctx!.strokeStyle = planet.color
    ctx!.lineWidth = 1.5
    ctx!.beginPath()
    ctx!.arc(
      ORBIT_CONFIG.centerX,
      ORBIT_CONFIG.centerY,
      planet.orbitRadius * ORBIT_CONFIG.scale,
      0,
      Math.PI * 2
    )
    ctx!.stroke()

    // 计算行星位置（随机角度）
    const angle = Math.random() * Math.PI * 2
    const x = ORBIT_CONFIG.centerX + Math.cos(angle) * planet.orbitRadius * ORBIT_CONFIG.scale
    const y = ORBIT_CONFIG.centerY + Math.sin(angle) * planet.orbitRadius * ORBIT_CONFIG.scale

    // 绘制行星
    ctx!.fillStyle = planet.color
    ctx!.beginPath()
    ctx!.arc(x, y, 3, 0, Math.PI * 2)
    ctx!.fill()

    // 绘制行星名称
    ctx!.fillStyle = ORBIT_CONFIG.orbitColors.labels
    ctx!.font = '12px Arial'
    ctx!.textAlign = 'left'
    ctx!.fillText(planet.name, x + 8, y + 4)
  })
}

// 修改绘制函数，添加行星绘制
const drawOrbitMap = () => {
  if (!ctx || !canvas.value) return
  
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  
  drawGrid()
  drawLabels()
  drawPlanets()  // 在恒星之前绘制行星
  drawStar()
}

// 监听窗口大小变化
const handleResize = () => {
  initCanvas()
  drawOrbitMap()
}

// 监听恒星变化
watch(() => star, () => {
  drawOrbitMap()
})

onMounted(() => {
  initCanvas()
  drawOrbitMap()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.orbit-map {
  width: 100%;
  height: 300px;
  background-color: #000;
}
</style> 