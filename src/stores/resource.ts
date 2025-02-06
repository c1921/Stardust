import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Resource {
  id: number
  name: string
  amount: number
  description: string
}

export interface ProductionItem {
  resource: string
  production: number
  consumption: number
  status: 'ACTIVE' | 'PAUSED' | 'NO_POWER' | 'FULL'
  requires?: {
    resource: string
    amount: number
  }[]
}

export interface MiningOperation {
  id: number
  location: string
  resource: string
  rate: number
  assignedShips: number
  efficiency: number  // 当前效率
  minEfficiency: number  // 最小效率
  maxEfficiency: number  // 最大效率
}

export const useResourceStore = defineStore('resource', () => {
  // 资源列表
  const resources = ref<Resource[]>([
    {
      id: 1,
      name: "Fuel",
      amount: 1000,
      description: "Spacecraft fuel for interstellar travel"
    },
    {
      id: 2,
      name: "Metal",
      amount: 500,
      description: "Raw materials for construction"
    },
    {
      id: 3,
      name: "Water",
      amount: 800,
      description: "Essential for life support"
    },
    {
      id: 4,
      name: "Alloy",
      amount: 0,
      description: "Advanced construction material"
    }
  ])

  // 生产配置
  const productionItems = ref<ProductionItem[]>([
    {
      resource: "Fuel",
      production: 2.0,
      consumption: 0,
      status: 'ACTIVE',
      requires: [
        { resource: "Water", amount: 1.0 }
      ]
    },
    {
      resource: "Alloy",
      production: 1.0,
      consumption: 0,
      status: 'ACTIVE',
      requires: [
        { resource: "Metal", amount: 2.0 }
      ]
    }
  ])

  // 采矿配置
  const miningOperations = ref<MiningOperation[]>([
    {
      id: 1,
      location: "Asteroid Belt Alpha",
      resource: "Metal",
      rate: 3.5,
      assignedShips: 2,
      efficiency: 100,
      minEfficiency: 80,
      maxEfficiency: 120
    },
    {
      id: 2,
      location: "Ice Field Beta",
      resource: "Water",
      rate: 2.0,
      assignedShips: 1,
      efficiency: 100,
      minEfficiency: 90,
      maxEfficiency: 110
    }
  ])

  // 检查是否有足够的原材料
  const hasEnoughResources = (production: ProductionItem) => {
    if (!production.requires) return true
    
    return production.requires.every(requirement => {
      const resource = resources.value.find(r => r.name === requirement.resource)
      return resource && resource.amount >= requirement.amount
    })
  }

  // 消耗原材料

  // 更新采矿效率
  const updateMiningEfficiency = () => {
    miningOperations.value.forEach(operation => {
      // 在最小和最大效率之间随机波动
      const variation = (Math.random() - 0.5) * 10 // -5 到 +5 的随机变化
      let newEfficiency = operation.efficiency + variation
      
      // 确保效率在范围内
      newEfficiency = Math.max(operation.minEfficiency, newEfficiency)
      newEfficiency = Math.min(operation.maxEfficiency, newEfficiency)
      
      operation.efficiency = Number(newEfficiency.toFixed(1))
    })
  }

  // 计算每个资源的净收益率
  const getResourceRate = (resourceName: string) => {
    let rate = 0

    // 加上生产量（考虑原材料消耗）
    const production = productionItems.value.find(item => item.resource === resourceName)
    if (production && production.status === 'ACTIVE' && hasEnoughResources(production)) {
      rate += production.production - production.consumption
    }

    // 减去作为原材料的消耗
    productionItems.value.forEach(item => {
      if (item.status === 'ACTIVE' && hasEnoughResources(item)) {
        item.requires?.forEach(req => {
          if (req.resource === resourceName) {
            rate -= req.amount
          }
        })
      }
    })

    // 加上采矿量（考虑效率）
    const mining = miningOperations.value.find(op => op.resource === resourceName)
    if (mining) {
      const actualRate = mining.rate * (mining.efficiency / 100) * mining.assignedShips
      rate += Number(actualRate.toFixed(1))
    }

    return Number(rate.toFixed(1))
  }

  // 更新资源数量
  const updateResources = () => {
    updateMiningEfficiency() // 更新采矿效率
    resources.value.forEach(resource => {
      const rate = getResourceRate(resource.name)
      resource.amount += rate
    })
  }

  // 启动定时器
  const startResourceLoop = () => {
    setInterval(updateResources, 1000)
  }

  return {
    resources,
    productionItems,
    miningOperations,
    getResourceRate,
    startResourceLoop
  }
}) 