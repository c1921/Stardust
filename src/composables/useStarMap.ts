import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { SelectedStar } from '../types/star'
import { generateGalaxy, getStarColor, GLOW_CONFIG } from '../utils/starUtils'

export function useStarMap(containerRef: Ref<HTMLDivElement | null>) {
  // 基础状态
  const starCount = ref(0)
  const routeCount = ref(0)
  const showRoutes = ref(true)
  const routeLines = ref<THREE.Line[]>([])
  const selectedStar = ref<SelectedStar | null>(null)

  // Three.js 相关变量
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let controls: OrbitControls
  let starMesh: THREE.InstancedMesh
  let selectedGlowMesh: THREE.Mesh | null = null
  let hoverGlowMesh: THREE.Mesh | null = null
  
  // Raycaster 用于处理鼠标交互
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  // 创建发光材质
  const createGlowMaterial = (config: typeof GLOW_CONFIG.selected) => {
    return new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: config.opacity,
      blending: THREE.AdditiveBlending
    })
  }

  // 切换航道显示
  const toggleRoutes = () => {
    routeLines.value.forEach(line => {
      const material = line.material as THREE.LineBasicMaterial
      material.opacity = showRoutes.value ? 0.1 : 0
    })
  }

  // 处理鼠标移动
  const handleMouseMove = (event: MouseEvent) => {
    if (!containerRef.value) return

    const rect = containerRef.value.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / containerRef.value.clientWidth) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / containerRef.value.clientHeight) * 2 + 1

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

  // 处理恒星点击
  const handleStarClick = (event: MouseEvent) => {
    if (!containerRef.value) return

    const rect = containerRef.value.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / containerRef.value.clientWidth) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / containerRef.value.clientHeight) * 2 + 1

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
          id: `HIP-${(instanceId + 1).toString().padStart(4, '0')}`,
          name: `HIP-${(instanceId + 1).toString().padStart(4, '0')}`,
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

  // 处理窗口大小变化
  const handleResize = () => {
    if (!containerRef.value) return
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  // 初始化场景
  const initScene = () => {
    if (!containerRef.value) return

    // 创建场景
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    // 创建相机
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000)
    camera.position.y = 130
    camera.position.z = 0
    camera.lookAt(0, 0, 0)

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    containerRef.value.appendChild(renderer.domElement)

    // 添加轨道控制
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = true

    // 生成星系
    const stars = generateGalaxy(100)
    starCount.value = stars.length

    // 创建恒星实例化网格
    const sphereGeometry = new THREE.SphereGeometry(1, 8, 6)
    const starMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    })

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
        temperature = 15000 + Math.random() * 15000
      } else {
        temperature = 2000 + Math.random() * 28000
        if (Math.random() < 0.3) {
          temperature = 10000 + Math.random() * 20000
        }
      }
      
      starMesh.setColorAt(i, getStarColor(temperature))
    })

    starMesh.instanceMatrix.needsUpdate = true
    starMesh.instanceColor!.needsUpdate = true
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
        routeLines.value.push(line)
        routes++
      })
    })
    routeCount.value = routes / 2

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

  // 生命周期钩子
  onMounted(() => {
    initScene()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (containerRef.value) {
      containerRef.value.innerHTML = ''
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

  return {
    starCount,
    routeCount,
    showRoutes,
    selectedStar,
    handleStarClick,
    handleMouseMove,
    toggleRoutes
  }
} 