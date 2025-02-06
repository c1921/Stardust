<template>
  <div class="card text-white">
    <div class="card-body">
      <h5 class="card-title mb-4">Resources</h5>
      <table class="table table-hover">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Amount</th>
            <th scope="col">Rate</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resource in store.resources" :key="resource.id">
            <td>{{ resource.name }}</td>
            <td>{{ Math.floor(resource.amount) }}</td>
            <td :class="store.getResourceRate(resource.name) > 0 ? 'text-success' : 'text-danger'">
              {{ store.getResourceRate(resource.name) > 0 ? '+' : '' }}{{ store.getResourceRate(resource.name) }}/s
            </td>
            <td class="text-muted">{{ resource.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceStore } from '../stores/resource'
import { onMounted } from 'vue'

const store = useResourceStore()

onMounted(() => {
  store.startResourceLoop()
})
</script>

