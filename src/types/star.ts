import * as THREE from 'three'

// 基础恒星接口
export interface Star {
  id: string
  name: string
  position: THREE.Vector3
  connections: Star[]
}

// 选中恒星的扩展信息
export interface SelectedStar {
  id: string
  name: string
  index: number
  position: THREE.Vector3
  temperature: number
}

// 发光效果配置接口
export interface GlowConfig {
  color: number
  opacity: number
  size: number
}

// 星系配置接口
export interface GalaxyConfig {
  BASE_STARS: number
  STAR_VARIATION: number
  BACKGROUND_STAR_RATIO: number
  MIN_STAR_DISTANCE: number
  MAX_CONNECTIONS: number
  MAX_CONNECTION_DISTANCE: number
} 