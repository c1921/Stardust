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
            <small>Selected Star: {{ selectedStar.name }} ({{ Math.round(selectedStar.temperature) }}K)</small>
          </div>
          <div class="text-muted">
            <small>Stars: {{ starCount }} | Hyperspace Routes: {{ Math.floor(routeCount) }}</small>
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
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Raycaster, Vector2 } from 'three'
import StarSystem from './StarSystem.vue'

const container = ref<HTMLDivElement | null>(null)
const starCount = ref(0)
const routeCount = ref(0)
const showRoutes = ref(true)
const routeLines = ref<THREE.Line[]>([])  // 存储航道线条的引用
const selectedStar = ref<SelectedStar | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let starMesh: THREE.InstancedMesh
const raycaster = new Raycaster()
const mouse = new Vector2()

interface Star {
  id: string
  name: string
  position: THREE.Vector3
  connections: Star[]
}

interface SelectedStar {
  id: string
  name: string
  index: number
  position: THREE.Vector3
  temperature: number
}

// 星系配置常量
const BASE_STARS = 4000  // 基础恒星数
const STAR_VARIATION = 0.05  // 随机变化
const TOTAL_STARS = BASE_STARS + Math.floor((Math.random() * 2 - 1) * BASE_STARS * STAR_VARIATION)  // 最终恒星数
const BACKGROUND_STAR_RATIO = 0.4  // 背景星占总数的比例
const MIN_STAR_DISTANCE = 0.3  // 恒星之间的最小距离

// 发光效果配置
const GLOW_CONFIG = {
  selected: {
    color: 0x00ffff,
    opacity: 0.5,
    size: 0.4
  },
  hover: {
    color: 0x00ffff,
    opacity: 0.2,
    size: 0.4
  }
}

// 生成恒星名称
const generateStarName = (id: number): string => {
  return `HIP-${id.toString().padStart(4, '0')}`
}

// 检查新恒星是否与现有恒星过近
const isTooClose = (position: THREE.Vector3, stars: Star[]): boolean => {
  return stars.some(existingStar => 
    position.distanceTo(existingStar.position) < MIN_STAR_DISTANCE
  )
}

// 生成随机星系
const generateGalaxy = (maxDistance: number): Star[] => {
  const stars: Star[] = []
  const armCount = 4  // 螺旋臂数量
  const armWindings = 0.4  // 螺旋臂缠绕圈数
  const armWidth = 0.15  // 螺旋臂宽度
  const armOffset = 0.12  // 恒星偏离螺旋臂的最大距离
  const armDensity = 0.8  // 控制螺旋臂的密度
  const fadeDistance = 0.85  // 开始渐变消失的距离比例
  const innerTightness = 2  // 内部螺旋的紧密程度
  const centerThickness = 0.25  // 中心区域的厚度系数
  
  // 生成背景星场
  let starId = 1
  while (stars.length < Math.floor(TOTAL_STARS * BACKGROUND_STAR_RATIO)) {
    const angle = Math.random() * Math.PI * 2
    const radiusRatio = Math.pow(Math.random(), 2)
    const radius = maxDistance * radiusRatio
    
    // 根据到中心的距离计算保留概率
    const keepProbability = Math.pow(1 - radius / maxDistance, 2)
    if (Math.random() > keepProbability) {
      continue
    }

    // 修改高度计算，中心更厚
    const heightScale = Math.pow(radius / maxDistance, 1.5)
    const centerFactor = Math.exp(-radius / (maxDistance * 0.2))  // 指数衰减
    const height = (Math.random() - 0.5) * maxDistance * 
      (0.05 + centerFactor * centerThickness) * heightScale

    const position = new THREE.Vector3(
      radius * Math.cos(angle),
      height,
      radius * Math.sin(angle)
    )

    // 检查距离
    if (isTooClose(position, stars)) {
      continue
    }

    stars.push({
      id: starId.toString(),
      name: generateStarName(starId),
      position,
      connections: []
    })
    starId++
  }

  // 生成螺旋臂上的恒星
  while (stars.length < TOTAL_STARS) {
    const arm = Math.floor(Math.random() * armCount)
    const radius = Math.random() * maxDistance
    
    // 使用对数螺旋线，让内部弯曲更平滑
    const angleOffset = Math.log(radius / maxDistance + 0.1) * innerTightness
    const spiralAngle = (radius / maxDistance) * armWindings * Math.PI * 2 + angleOffset
    
    // 添加螺旋臂偏移
    let angle = (arm / armCount) * Math.PI * 2 + spiralAngle
    
    // 在螺旋臂周围添加随机偏移，使用高斯分布
    // 内部区域减小偏移量
    const innerFactor = Math.min(1, radius / (maxDistance * 0.2))
    const radialOffset = (Math.random() + Math.random() - 1) * armOffset * maxDistance * innerFactor
    const angularOffset = (Math.random() + Math.random() - 1) * armWidth * (1 - radius / maxDistance) * innerFactor
    
    // 应用偏移
    let adjustedRadius = radius + radialOffset * (radius / maxDistance)
    angle += angularOffset
    
    // 限制半径范围
    adjustedRadius = Math.max(0, Math.min(maxDistance, adjustedRadius))
    
    // 在末端区域增加随机性和渐变消失效果
    const distanceRatio = adjustedRadius / maxDistance
    if (distanceRatio > fadeDistance) {
      const fadeProgress = (distanceRatio - fadeDistance) / (1 - fadeDistance)
      const extraOffset = fadeProgress * armWidth * 2
      angle += (Math.random() - 0.5) * extraOffset
      
      if (Math.random() < fadeProgress * 0.8) {
        continue
      }
    }
    
    // 根据到螺旋臂中心的距离决定是否保留这颗恒星
    const distanceFromArm = Math.abs(angularOffset)
    if (Math.random() > armDensity * (1 - distanceFromArm / armWidth)) {
      continue
    }
    
    // 修改高度计算，中心更厚
    const heightScale = (1 - (adjustedRadius / maxDistance)) * innerFactor
    const centerFactor = Math.exp(-adjustedRadius / (maxDistance * 0.2))  // 指数衰减
    const heightRandomness = distanceRatio > fadeDistance ? 
      (distanceRatio - fadeDistance) / (1 - fadeDistance) : 0
    const height = (Math.random() - 0.5) * maxDistance * 
      (0.05 + centerFactor * centerThickness + heightRandomness * 0.1) * heightScale

    const position = new THREE.Vector3(
      adjustedRadius * Math.cos(angle),
      height,
      adjustedRadius * Math.sin(angle)
    )

    // 检查距离
    if (isTooClose(position, stars)) {
      continue
    }

    stars.push({
      id: starId.toString(),
      name: generateStarName(starId),
      position,
      connections: []
    })
    starId++
  }

  // 连接邻近的恒星，限制每个恒星最多5个连接
  const maxConnectionDistance = maxDistance * 0.1 // 最大连接距离
  const maxConnections = 5 // 每个恒星最多连接数

  stars.forEach(star => {
    // 找出所有可能的连接并按距离排序
    const possibleConnections = stars
      .filter(otherStar => star !== otherStar)
      .map(otherStar => ({
        star: otherStar,
        distance: star.position.distanceTo(otherStar.position)
      }))
      .filter(conn => conn.distance < maxConnectionDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxConnections) // 只取最近的5个

    // 添加连接
    possibleConnections.forEach(conn => {
      star.connections.push(conn.star)
    })
  })

  return stars
}

// 获取恒星颜色
const getStarColor = (temperature: number) => {
  // 恒星颜色范围：2000K (红) 到 30000K (蓝)
  const t = (temperature - 2000) / 28000  // 归一化温度
  
  // 基于黑体辐射的近似颜色
  const r = t < 0.5 ? 1 : 1 - (t - 0.5) * 0.5
  const g = t < 0.5 ? t * 2 : 1
  const b = t < 0.5 ? 0 : (t - 0.5) * 2

  return new THREE.Color(r, g, b)
}

// 切换航道显示
const toggleRoutes = () => {
  routeLines.value.forEach(line => {
    const material = line.material as THREE.LineBasicMaterial
    material.opacity = showRoutes.value ? 0.1 : 0
  })
}

// 创建发光材质
const createGlowMaterial = (config: typeof GLOW_CONFIG.selected) => {
  return new THREE.MeshBasicMaterial({
    color: config.color,
    transparent: true,
    opacity: config.opacity,
    blending: THREE.AdditiveBlending
  })
}

// 在 script setup 中添加变量
let selectedGlowMesh: THREE.Mesh | null = null
let hoverGlowMesh: THREE.Mesh | null = null

// 添加鼠标移动处理
const handleMouseMove = (event: MouseEvent) => {
  if (!container.value) return

  const rect = container.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(starMesh)

  if (intersects.length > 0) {
    const instanceId = intersects[0].instanceId
    if (instanceId !== undefined) {
      // 如果鼠标悬停在当前选中的恒星上，不显示悬浮效果
      if (selectedStar.value && instanceId === selectedStar.value.index) {
        if (hoverGlowMesh) {
          hoverGlowMesh.visible = false
        }
        return
      }

      const position = new THREE.Vector3()
      const matrix = new THREE.Matrix4()
      starMesh.getMatrixAt(instanceId, matrix)
      position.setFromMatrixPosition(matrix)

      // 创建或更新悬浮发光效果
      if (!hoverGlowMesh) {
        const glowGeometry = new THREE.SphereGeometry(GLOW_CONFIG.hover.size, 16, 12)
        const glowMaterial = createGlowMaterial(GLOW_CONFIG.hover)
        hoverGlowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
        scene.add(hoverGlowMesh)
      }
      
      hoverGlowMesh.position.copy(position)
      hoverGlowMesh.visible = true
    }
  } else {
    if (hoverGlowMesh) {
      hoverGlowMesh.visible = false
    }
  }
}

// 修改点击处理函数
const handleStarClick = (event: MouseEvent) => {
  if (!container.value) return

  const rect = container.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(starMesh)
  
  if (intersects.length > 0) {
    const instanceId = intersects[0].instanceId
    if (instanceId !== undefined) {
      // 如果点击已选中的恒星，取消选中
      if (selectedStar.value && instanceId === selectedStar.value.index) {
        selectedStar.value = null
        if (selectedGlowMesh) {
          selectedGlowMesh.visible = false
        }
        return
      }

      const position = new THREE.Vector3()
      const matrix = new THREE.Matrix4()
      starMesh.getMatrixAt(instanceId, matrix)
      position.setFromMatrixPosition(matrix)

      // 获取恒星颜色（温度）
      const color = new THREE.Color()
      starMesh.getColorAt(instanceId, color)
      const temperature = color.b > 0 ? 
        15000 + color.b * 15000 : 
        2000 + color.g * 13000

      selectedStar.value = {
        id: generateStarName(instanceId + 1),  // +1 因为ID从1开始
        name: generateStarName(instanceId + 1),
        index: instanceId,
        position,
        temperature
      }

      // 创建或更新选中发光效果
      if (!selectedGlowMesh) {
        const glowGeometry = new THREE.SphereGeometry(GLOW_CONFIG.selected.size, 16, 12)
        const glowMaterial = createGlowMaterial(GLOW_CONFIG.selected)
        selectedGlowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
        scene.add(selectedGlowMesh)
      }
      
      selectedGlowMesh.position.copy(position)
      selectedGlowMesh.visible = true

      // 隐藏悬浮效果
      if (hoverGlowMesh) {
        hoverGlowMesh.visible = false
      }
    }
  } else {
    // 点击空白处，取消选中
    selectedStar.value = null
    if (selectedGlowMesh) {
      selectedGlowMesh.visible = false
    }
  }
}

// 初始化场景
const initScene = () => {
  if (!container.value) return

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // 创建相机
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000)
  
  // 修改相机位置为俯视视角
  camera.position.y = 130  // 改为从上方看
  camera.position.z = 0    // 清除 z 轴偏移
  camera.lookAt(0, 0, 0)   // 看向原点

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  container.value.appendChild(renderer.domElement)

  // 添加轨道控制
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05  // 添加阻尼效果
  controls.screenSpacePanning = true  // 使平移更自然

  // 生成星系，只传入最大距离参数
  const stars = generateGalaxy(100)
  starCount.value = stars.length

  // 创建恒星实例化网格
  const sphereGeometry = new THREE.SphereGeometry(1, 8, 6)  // 基础半径设为1，方便缩放
  const starMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending
  })

  // 创建实例化网格
  starMesh = new THREE.InstancedMesh(
    sphereGeometry,
    starMaterial,
    stars.length
  )

  // 设置每个实例的变换矩阵和颜色
  const matrix = new THREE.Matrix4()
  const scale = new THREE.Vector3()
  
  stars.forEach((star, i) => {
    const distanceFromCenter = star.position.length()
    const distanceRatio = distanceFromCenter / 100

    // 计算恒星大小
    let baseSize = 0.15
    if (distanceRatio < 0.2) {
      baseSize *= 1.5
    }
    const randomScale = 0.7 + Math.random() * 0.6
    const finalSize = baseSize * randomScale

    // 设置缩放和位置
    scale.set(finalSize, finalSize, finalSize)
    matrix.makeScale(scale.x, scale.y, scale.z)
    matrix.setPosition(star.position)
    starMesh.setMatrixAt(i, matrix)

    // 设置恒星颜色
    let temperature
    if (distanceRatio < 0.2) {
      // 中心区域更热（更蓝）
      temperature = 15000 + Math.random() * 15000
    } else {
      // 外围区域温度更多样
      temperature = 2000 + Math.random() * 28000
      
      // 螺旋臂上的年轻恒星更热
      if (Math.random() < 0.3) {  // 30% 的概率是年轻恒星
        temperature = 10000 + Math.random() * 20000
      }
    }
    
    starMesh.setColorAt(i, getStarColor(temperature))
  })

  starMesh.instanceMatrix.needsUpdate = true
  starMesh.instanceColor!.needsUpdate = true  // 更新颜色
  scene.add(starMesh)

  // 创建超空间航道
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x7b7b7b,
    opacity: showRoutes.value ? 0.1 : 0,
    transparent: true
  })

  let routes = 0
  stars.forEach(star => {
    star.connections.forEach(connectedStar => {
      const lineGeometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([
        star.position.x, star.position.y, star.position.z,
        connectedStar.position.x, connectedStar.position.y, connectedStar.position.z
      ])
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      const line = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(line)
      routeLines.value.push(line)  // 保存线条引用
      routes++
    })
  })
  routeCount.value = routes / 2  // 除以2因为每条航道被计算了两次

  // 动画循环
  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()

    // 更新发光效果动画
    const time = Date.now() * 0.003
    const scale = 1 + Math.sin(time) * 0.1

    if (selectedGlowMesh && selectedGlowMesh.visible) {
      selectedGlowMesh.scale.set(scale, scale, scale)
    }
    if (hoverGlowMesh && hoverGlowMesh.visible) {
      hoverGlowMesh.scale.set(scale, scale, scale)
    }

    renderer.render(scene, camera)
  }
  animate()
}

// 处理窗口大小变化
const handleResize = () => {
  if (!container.value) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onMounted(() => {
  initScene()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (container.value) {
    container.value.innerHTML = ''
  }
  if (selectedGlowMesh) {
    scene.remove(selectedGlowMesh)
    selectedGlowMesh.geometry.dispose()
    ;(selectedGlowMesh.material as THREE.Material).dispose()
  }
  if (hoverGlowMesh) {
    scene.remove(hoverGlowMesh)
    hoverGlowMesh.geometry.dispose()
    ;(hoverGlowMesh.material as THREE.Material).dispose()
  }
})

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