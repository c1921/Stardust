<template>
  <div class="card text-white">
    <div class="card-body">
      <h5 class="card-title mb-4">Spaceships</h5>
      <table class="table table-hover">
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Working/Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ship in store.spaceshipTypes" :key="ship.id">
            <td>{{ ship.name }}</td>
            <td>{{ ship.assignedToMining }}/{{ ship.count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceStore } from '../stores/resource'

const store = useResourceStore()
</script>

