<template>
  <div class="card text-white">
    <div class="card-body">
      <h5 class="card-title mb-4">Resource Production Rates</h5>
      <div class="chart-container">
        <canvas ref="chartRef"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useResourceStore } from '../stores/resource'
import { Chart, ChartConfiguration } from 'chart.js/auto'

const store = useResourceStore()
const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
const maxDataPoints = 60 // 显示最近60秒的数据

// 为每个资源准备数据数组
const datasets = store.resources.map(resource => ({
  label: resource.name,
  data: [] as number[],
  borderColor: getResourceColor(resource.name),
  tension: 0.4,
  fill: false
}))

// 为不同资源分配不同颜色
function getResourceColor(resourceName: string) {
  const colors = {
    'Metal': '#ffc107',   // 金色
    'Water': '#0dcaf0',   // 蓝色
    'Fuel': '#dc3545',    // 红色
    'Alloy': '#6c757d'    // 灰色
  }
  return colors[resourceName as keyof typeof colors] || '#ffffff'
}

// 更新图表数据
function updateChart() {
  if (!chart) return

  // 更新每个资源的数据
  datasets.forEach(dataset => {
    const rate = store.getResourceRate(dataset.label)
    dataset.data.push(rate)
    if (dataset.data.length > maxDataPoints) {
      dataset.data.shift()
    }
  })

  // 更新标签
  const labels = Array(Math.max(...datasets.map(d => d.data.length)))
    .fill(0)
    .map((_, i) => `-${Math.max(...datasets.map(d => d.data.length)) - i}s`)

  chart.data.labels = labels
  chart.data.datasets = datasets
  chart.update()
}

onMounted(() => {
  if (!chartRef.value) return

  const config: ChartConfiguration = {
    type: 'line',
    data: {
      labels: [],
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#ffffff'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#ffffff'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#ffffff'
          }
        }
      }
    }
  }

  chart = new Chart(chartRef.value, config)
  
  // 每秒更新图表
  const interval = setInterval(updateChart, 1000)
  
  onUnmounted(() => {
    clearInterval(interval)
    chart?.destroy()
  })
})
</script>

<style scoped>
.chart-container {
  height: 300px;
  position: relative;
}
</style> 