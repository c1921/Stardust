<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title mb-4">Star Map</h5>
      <div ref="container" class="star-map-container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const container = ref<HTMLDivElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls

interface Star {
  position: THREE.Vector3
  connections: Star[]
}

// 生成随机星系
const generateGalaxy = (starCount: number, maxDistance: number): Star[] => {
  const stars: Star[] = []
  const armCount = 4  // 螺旋臂数量
  const armWindings = 0.4  // 螺旋臂缠绕圈数
  const armWidth = 0.15  // 增加螺旋臂宽度
  const armOffset = 0.12  // 增加恒星偏离螺旋臂的最大距离
  const armDensity = 0.8  // 增加密度以填充更宽的螺旋臂
  const fadeDistance = 0.85  // 开始渐变消失的距离比例
  const innerTightness = 2  // 内部螺旋的紧密程度
  const backgroundStarCount = starCount * 0.5  // 背景星星数量
  
  // 生成背景星场
  for (let i = 0; i < backgroundStarCount; i++) {
    const angle = Math.random() * Math.PI * 2
    
    // 使用幂函数使中心更密集
    const radiusRatio = Math.pow(Math.random(), 2)  // 使用平方来增加中心密度
    const radius = maxDistance * radiusRatio
    
    // 根据到中心的距离计算保留概率，使中心区域保留更多恒星
    const keepProbability = Math.pow(1 - radius / maxDistance, 2)  // 使用平方增加中心保留概率
    if (Math.random() > keepProbability) {
      continue
    }

    // 减小高度变化，使中心区域更扁平
    const heightScale = Math.pow(radius / maxDistance, 1.5)  // 使用幂函数控制高度
    const height = (Math.random() - 0.5) * maxDistance * 0.05 * heightScale

    const star: Star = {
      position: new THREE.Vector3(
        radius * Math.cos(angle),
        height,
        radius * Math.sin(angle)
      ),
      connections: []
    }
    stars.push(star)
  }

  // 生成螺旋臂上的恒星
  for (let i = 0; i < starCount; i++) {
    // 螺旋臂上的恒星
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
    
    // 高度随距离增加而减小，内部区域高度更小
    const heightScale = (1 - (adjustedRadius / maxDistance)) * innerFactor
    const heightRandomness = distanceRatio > fadeDistance ? 
      (distanceRatio - fadeDistance) / (1 - fadeDistance) : 0
    const height = (Math.random() - 0.5) * maxDistance * (0.05 + heightRandomness * 0.1) * heightScale

    const star: Star = {
      position: new THREE.Vector3(
        adjustedRadius * Math.cos(angle),
        height,
        adjustedRadius * Math.sin(angle)
      ),
      connections: []
    }
    stars.push(star)
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

  // 生成星系
  const stars = generateGalaxy(10000, 100)

  // 创建恒星实例化网格
  const sphereGeometry = new THREE.SphereGeometry(1, 8, 6)  // 基础半径设为1，方便缩放
  const starMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  // 创建实例化网格
  const starMesh = new THREE.InstancedMesh(
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
    color: 0x4444ff,
    opacity: 0,
    transparent: true
  })

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
    })
  })

  // 动画循环
  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
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
})
</script>

<style scoped>
.star-map-container {
  width: 100%;
  height: 600px;
  background-color: black;
}
</style> 