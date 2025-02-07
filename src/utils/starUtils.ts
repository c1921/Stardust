import * as THREE from 'three'
import type { Star } from '../types/star'

// 星系配置常量
export const GALAXY_CONFIG = {
  BASE_STARS: 4000,  // 基础恒星数
  STAR_VARIATION: 0.05,  // 随机变化
  BACKGROUND_STAR_RATIO: 0.4,  // 背景星占总数的比例
  MIN_STAR_DISTANCE: 0.3,  // 恒星之间的最小距离
  MAX_CONNECTIONS: 5,  // 每个恒星最多连接数
  MAX_CONNECTION_DISTANCE: 10  // 最大连接距离（相对于星系大小）
}

// 发光效果配置
export const GLOW_CONFIG = {
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
export const generateStarName = (id: number): string => {
  return `HIP-${id.toString().padStart(4, '0')}`
}

// 检查新恒星是否与现有恒星过近
export const isTooClose = (position: THREE.Vector3, stars: Star[]): boolean => {
  return stars.some(existingStar => 
    position.distanceTo(existingStar.position) < GALAXY_CONFIG.MIN_STAR_DISTANCE
  )
}

// 获取恒星颜色
export const getStarColor = (temperature: number): THREE.Color => {
  // 恒星颜色范围：2000K (红) 到 30000K (蓝)
  const t = (temperature - 2000) / 28000  // 归一化温度
  
  // 基于黑体辐射的近似颜色
  const r = t < 0.5 ? 1 : 1 - (t - 0.5) * 0.5
  const g = t < 0.5 ? t * 2 : 1
  const b = t < 0.5 ? 0 : (t - 0.5) * 2

  return new THREE.Color(r, g, b)
}

// 生成随机星系
export const generateGalaxy = (maxDistance: number): Star[] => {
  const stars: Star[] = []
  const TOTAL_STARS = GALAXY_CONFIG.BASE_STARS + 
    Math.floor((Math.random() * 2 - 1) * GALAXY_CONFIG.BASE_STARS * GALAXY_CONFIG.STAR_VARIATION)

  // 螺旋臂参数
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
  while (stars.length < Math.floor(TOTAL_STARS * GALAXY_CONFIG.BACKGROUND_STAR_RATIO)) {
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
    const heightScale = (1 - (adjustedRadius / maxDistance))
    const centerFactor = Math.exp(-adjustedRadius / (maxDistance * 0.2))
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

  // 连接邻近的恒星
  const maxConnectionDistance = maxDistance * (GALAXY_CONFIG.MAX_CONNECTION_DISTANCE / 100)

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
      .slice(0, GALAXY_CONFIG.MAX_CONNECTIONS)

    // 添加连接
    possibleConnections.forEach(conn => {
      star.connections.push(conn.star)
    })
  })

  return stars
} 