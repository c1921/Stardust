<template>
  <div class="card text-white">
    <div class="card-body">
      <h5 class="card-title mb-4">Production</h5>
      <table class="table table-hover">
        <thead>
          <tr>
            <th scope="col">Resource</th>
            <th scope="col">Production</th>
            <th scope="col">Consumption</th>
            <th scope="col">Net</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in store.productionItems" :key="item.resource">
            <td>{{ item.resource }}</td>
            <td class="text-success">+{{ item.production }}/s</td>
            <td class="text-danger">-{{ item.consumption }}/s</td>
            <td :class="getNetClass(item.production - item.consumption)">
              {{ getNetValue(item.production - item.consumption) }}
            </td>
            <td>
              <span class="badge" :class="getStatusClass(item.status)">
                {{ item.status }}
              </span>
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

const store = useResourceStore()

const getNetValue = (value: number) => {
  return value > 0 ? `+${value}` : value;
};

const getNetClass = (value: number) => {
  return value > 0 ? 'text-success' : value < 0 ? 'text-danger' : '';
};

const getStatusClass = (status: ProductionItem['status']) => {
  const classes = {
    'ACTIVE': 'bg-success',
    'PAUSED': 'bg-warning',
    'NO_POWER': 'bg-danger',
    'FULL': 'bg-info'
  };
  return classes[status];
};
</script> 