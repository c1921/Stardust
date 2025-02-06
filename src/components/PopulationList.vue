<template>
  <div class="card text-white">
    <div class="card-body">
      <h5 class="card-title mb-4">Population</h5>
      <table class="table table-hover">
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Working/Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pop in store.populationTypes" :key="pop.id">
            <td>{{ pop.name }}</td>
            <td>{{ pop.assignedToProduction }}/{{ pop.count }}</td>
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