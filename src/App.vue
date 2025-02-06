<script setup lang="ts">
import ResourceList from './components/ResourceList.vue'
import SpaceshipList from './components/SpaceshipList.vue'
import ProductionList from './components/ProductionList.vue'
import MiningList from './components/MiningList.vue'
import ResourceChart from './components/ResourceChart.vue'
</script>

<template>
  <div class="min-vh-100 p-4">
    <div class="container-fluid">
      <div class="row g-4">
        <div class="col">
          <div class="d-flex flex-column gap-4">
            <ResourceList />
            <ResourceChart />
            <SpaceshipList />
            <MiningList />
            <ProductionList />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
