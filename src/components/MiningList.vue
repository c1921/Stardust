<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title mb-4">Mining Operations</h5>
      <table class="table table-hover">
        <thead>
          <tr>
            <th scope="col">Resource</th>
            <th scope="col">Base Rate</th>
            <th scope="col">Efficiency</th>
            <th scope="col">Ships</th>
            <th scope="col">Actual Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="operation in store.miningOperations" :key="operation.id">
            <td>{{ operation.resource }}</td>
            <td>{{ operation.rate }}/s</td>
            <td :class="getEfficiencyClass(operation.efficiency)">
              {{ operation.efficiency }}%
            </td>
            <td>
              <NumberAdjuster
                :value="operation.assignedShips"
                :disable-decrease="operation.assignedShips <= 0"
                :disable-increase="!hasAvailableShips"
                @decrease="removeShip(operation.id)"
                @increase="addShip(operation.id)"
              />
            </td>
            <td class="text-success">
              +{{ Number((operation.rate * operation.efficiency / 100 * operation.assignedShips).toFixed(1)) }}/s
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResourceStore } from '../stores/resource'
import NumberAdjuster from './NumberAdjuster.vue'

const store = useResourceStore()

const miningShip = computed(() => 
  store.spaceshipTypes.find(ship => ship.name === "Mining Ship")
)

const hasAvailableShips = computed(() => {
  if (!miningShip.value) return false
  return miningShip.value.assignedToMining < miningShip.value.count
})

const addShip = (miningId: number) => {
  if (!miningShip.value || !hasAvailableShips.value) return
  store.assignShipToMining(miningShip.value.id, miningId, 1)
}

const removeShip = (miningId: number) => {
  if (!miningShip.value) return
  store.unassignShipFromMining(miningShip.value.id, miningId, 1)
}

const getEfficiencyClass = (efficiency: number) => {
  if (efficiency >= 110) return 'text-success'
  if (efficiency >= 100) return 'text-info'
  if (efficiency >= 90) return 'text-warning'
  return 'text-danger'
}
</script> 