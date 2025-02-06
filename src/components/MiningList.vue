<template>
  <div class="card text-white">
    <div class="card-body">
      <h5 class="card-title mb-4">Mining Operations</h5>
      <table class="table table-hover">
        <thead>
          <tr>
            <th scope="col">Location</th>
            <th scope="col">Resource</th>
            <th scope="col">Base Rate</th>
            <th scope="col">Efficiency</th>
            <th scope="col">Ships</th>
            <th scope="col">Actual Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="operation in store.miningOperations" :key="operation.id">
            <td>{{ operation.location }}</td>
            <td>{{ operation.resource }}</td>
            <td>{{ operation.rate }}/s</td>
            <td :class="getEfficiencyClass(operation.efficiency)">
              {{ operation.efficiency }}%
            </td>
            <td>{{ operation.assignedShips }}</td>
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
import { useResourceStore } from '../stores/resource'

const store = useResourceStore()

const getEfficiencyClass = (efficiency: number) => {
  if (efficiency >= 110) return 'text-success'
  if (efficiency >= 100) return 'text-info'
  if (efficiency >= 90) return 'text-warning'
  return 'text-danger'
}
</script> 