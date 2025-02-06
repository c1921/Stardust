import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Resource {
  id: number
  name: string
  amount: number
}

export interface PopulationType {
  id: number
  name: string  // 'Human' | 'Robot'
  count: number
  assignedToProduction: number
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
  requiredWorkers: number
  assignedHumans: number
  assignedRobots: number
}

export interface MiningOperation {
  id: number
  resource: string
  rate: number
  assignedShips: number
  efficiency: number
  minEfficiency: number
  maxEfficiency: number
}

export interface SpaceshipType {
  id: number
  name: string
  count: number
  assignedToMining: number
}

export const useResourceStore = defineStore('resource', () => {
  // 资源列表
  const resources = ref<Resource[]>([
    {
      id: 1,
      name: "Fuel",
      amount: 1000
    },
    {
      id: 2,
      name: "Metal",
      amount: 500
    },
    {
      id: 3,
      name: "Water",
      amount: 800
    },
    {
      id: 4,
      name: "Alloy",
      amount: 0
    }
  ])

  // 人口类型列表
  const populationTypes = ref<PopulationType[]>([
    {
      id: 1,
      name: "Human",
      count: 10,
      assignedToProduction: 0
    },
    {
      id: 2,
      name: "Robot",
      count: 5,
      assignedToProduction: 0
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
      ],
      requiredWorkers: 2,
      assignedHumans: 0,
      assignedRobots: 0
    },
    {
      resource: "Alloy",
      production: 1.0,
      consumption: 0,
      status: 'ACTIVE',
      requires: [
        { resource: "Metal", amount: 2.0 }
      ],
      requiredWorkers: 3,
      assignedHumans: 0,
      assignedRobots: 0
    }
  ])

  // 采矿配置
  const miningOperations = ref<MiningOperation[]>([
    {
      id: 1,
      resource: "Metal",
      rate: 3.5,
      assignedShips: 0,
      efficiency: 100,
      minEfficiency: 80,
      maxEfficiency: 120
    },
    {
      id: 2,
      resource: "Water",
      rate: 2.0,
      assignedShips: 0,
      efficiency: 100,
      minEfficiency: 90,
      maxEfficiency: 110
    }
  ])

  // 舰船类型列表
  const spaceshipTypes = ref<SpaceshipType[]>([
    {
      id: 1,
      name: "Mining Ship",
      count: 5,
      assignedToMining: 0
    },
    {
      id: 2,
      name: "Guard Ship",
      count: 3,
      assignedToMining: 0
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

  // 修改生产率计算
  const getProductionEfficiency = (production: ProductionItem) => {
    if (production.requiredWorkers === 0) return 1
    return (production.assignedHumans + production.assignedRobots) / production.requiredWorkers
  }

  // 修改工人分配逻辑
  const assignWorkerToProduction = (workerId: number, productionResource: string, count: number) => {
    const worker = populationTypes.value.find(w => w.id === workerId)
    const production = productionItems.value.find(p => p.resource === productionResource)
    
    if (!worker || !production) return
    
    const totalAssigned = production.assignedHumans + production.assignedRobots
    const availableWorkers = worker.count - worker.assignedToProduction
    const neededWorkers = production.requiredWorkers - totalAssigned
    const actualAssignment = Math.min(count, availableWorkers, neededWorkers)
    
    worker.assignedToProduction += actualAssignment
    if (worker.name === 'Human') {
      production.assignedHumans += actualAssignment
    } else {
      production.assignedRobots += actualAssignment
    }
  }

  // 修改工人移除逻辑
  const unassignWorkerFromProduction = (workerId: number, productionResource: string, count: number) => {
    const worker = populationTypes.value.find(w => w.id === workerId)
    const production = productionItems.value.find(p => p.resource === productionResource)
    
    if (!worker || !production) return
    
    const assignedCount = worker.name === 'Human' ? production.assignedHumans : production.assignedRobots
    const actualUnassignment = Math.min(count, assignedCount)
    
    worker.assignedToProduction -= actualUnassignment
    if (worker.name === 'Human') {
      production.assignedHumans -= actualUnassignment
    } else {
      production.assignedRobots -= actualUnassignment
    }
  }

  // 修改资源变化率计算
  const getResourceRate = (resourceName: string) => {
    let rate = 0

    // 加上生产量（考虑工人效率）
    const production = productionItems.value.find(item => item.resource === resourceName)
    if (production && production.status === 'ACTIVE' && hasEnoughResources(production)) {
      const efficiency = getProductionEfficiency(production)
      rate += (production.production - production.consumption) * efficiency
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

  // 分配舰船到采矿操作
  const assignShipToMining = (shipTypeId: number, miningId: number, count: number) => {
    const shipType = spaceshipTypes.value.find(s => s.id === shipTypeId)
    const mining = miningOperations.value.find(m => m.id === miningId)
    
    if (!shipType || !mining) return
    
    // 确保不超过可用舰船数量
    const availableShips = shipType.count - shipType.assignedToMining
    const actualAssignment = Math.min(count, availableShips)
    
    shipType.assignedToMining += actualAssignment
    mining.assignedShips += actualAssignment
  }

  // 从采矿操作中移除舰船
  const unassignShipFromMining = (shipTypeId: number, miningId: number, count: number) => {
    const shipType = spaceshipTypes.value.find(s => s.id === shipTypeId)
    const mining = miningOperations.value.find(m => m.id === miningId)
    
    if (!shipType || !mining) return
    
    // 确保不超过已分配的舰船数量
    const actualUnassignment = Math.min(count, mining.assignedShips)
    
    shipType.assignedToMining -= actualUnassignment
    mining.assignedShips -= actualUnassignment
  }

  return {
    resources,
    productionItems,
    miningOperations,
    getResourceRate,
    startResourceLoop,
    spaceshipTypes,
    assignShipToMining,
    unassignShipFromMining,
    populationTypes,
    assignWorkerToProduction,
    unassignWorkerFromProduction
  }
}) 