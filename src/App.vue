<script setup lang="ts">
import ResourceList from './components/ResourceList.vue'
import SpaceshipList from './components/SpaceshipList.vue'
import ProductionList from './components/ProductionList.vue'
import MiningList from './components/MiningList.vue'
import ResourceChart from './components/ResourceChart.vue'
import PopulationList from './components/PopulationList.vue'
</script>

<template>
  <div class="min-vh-100 p-4">
    <div class="container-fluid">
      <ul class="nav nav-tabs mb-4" role="tablist">
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link active" 
            data-bs-toggle="tab" 
            data-bs-target="#resources-tab" 
            type="button" 
            role="tab" 
            aria-selected="true"
          >
            Resources
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link" 
            data-bs-toggle="tab" 
            data-bs-target="#production-tab" 
            type="button" 
            role="tab" 
            aria-selected="false"
          >
            Production
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link" 
            data-bs-toggle="tab" 
            data-bs-target="#mining-tab" 
            type="button" 
            role="tab" 
            aria-selected="false"
          >
            Mining
          </button>
        </li>
      </ul>

      <div class="tab-content">
        <div 
          class="tab-pane fade show active" 
          id="resources-tab" 
          role="tabpanel" 
          tabindex="0"
        >
          <div class="d-flex flex-column gap-4">
            <ResourceList />
            <ResourceChart />
            <PopulationList />
            <SpaceshipList />
          </div>
        </div>

        <div 
          class="tab-pane fade" 
          id="production-tab" 
          role="tabpanel" 
          tabindex="0"
        >
          <div class="d-flex flex-column gap-4">
            <ProductionList />
          </div>
        </div>

        <div 
          class="tab-pane fade" 
          id="mining-tab" 
          role="tabpanel" 
          tabindex="0"
        >
          <div class="d-flex flex-column gap-4">
            <MiningList />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
