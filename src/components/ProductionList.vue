<template>
  <div class="card text-white">
    <div class="card-body">
      <h5 class="card-title mb-4">Production</h5>
      <table class="table table-hover">
        <thead>
          <tr>
            <th scope="col">Resource</th>
            <th scope="col">Base Rate</th>
            <th scope="col">Workers</th>
            <th scope="col">Actual Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in store.productionItems" :key="item.resource">
            <td>{{ item.resource }}</td>
            <td>{{ item.production }}/s</td>
            <td>
              <div class="d-flex align-items-center gap-2">
                <div class="me-3">
                  <span class="text-info">H:</span>
                  <NumberAdjuster
                    :value="item.assignedHumans"
                    :disable-decrease="item.assignedHumans <= 0"
                    :disable-increase="!hasAvailableWorkers('Human') || getTotalAssigned(item) >= item.requiredWorkers"
                    @decrease="removeWorker('Human', item.resource)"
                    @increase="addWorker('Human', item.resource)"
                  />
                </div>
                <div>
                  <span class="text-warning">R:</span>
                  <NumberAdjuster
                    :value="item.assignedRobots"
                    :disable-decrease="item.assignedRobots <= 0"
                    :disable-increase="!hasAvailableWorkers('Robot') || getTotalAssigned(item) >= item.requiredWorkers"
                    @decrease="removeWorker('Robot', item.resource)"
                    @increase="addWorker('Robot', item.resource)"
                  />
                </div>
                <small class="text-muted ms-2">({{ getTotalAssigned(item) }}/{{ item.requiredWorkers }})</small>
              </div>
            </td>
            <td class="text-success">
              +{{ Number((item.production * getProductionEfficiency(item)).toFixed(1)) }}/s
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceStore } from '../stores/resource'
import type { ProductionItem } from '../stores/resource'
import NumberAdjuster from './NumberAdjuster.vue'

const store = useResourceStore()

const hasAvailableWorkers = (type: string) => {
  const population = store.populationTypes.find(pop => pop.name === type)
  if (!population) return false
  return population.assignedToProduction < population.count
}

const getTotalAssigned = (item: ProductionItem) => {
  return item.assignedHumans + item.assignedRobots
}

const getProductionEfficiency = (item: ProductionItem) => {
  if (item.requiredWorkers === 0) return 1
  return getTotalAssigned(item) / item.requiredWorkers
}

const addWorker = (type: string, productionResource: string) => {
  const worker = store.populationTypes.find(pop => pop.name === type)
  if (!worker || !hasAvailableWorkers(type)) return
  store.assignWorkerToProduction(worker.id, productionResource, 1)
}

const removeWorker = (type: string, productionResource: string) => {
  const worker = store.populationTypes.find(pop => pop.name === type)
  if (!worker) return
  store.unassignWorkerFromProduction(worker.id, productionResource, 1)
}
</script> 