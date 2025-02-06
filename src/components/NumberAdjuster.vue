<template>
  <div class="d-flex align-items-center gap-2">
    <button 
      class="btn btn-sm btn-outline-secondary" 
      @click="$emit('decrease')"
      :disabled="disabled || disableDecrease"
    >-</button>
    <slot>{{ value }}</slot>
    <button 
      class="btn btn-sm btn-outline-secondary" 
      @click="$emit('increase')"
      :disabled="disabled || disableIncrease"
    >+</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value?: number
  disabled?: boolean
  disableDecrease?: boolean
  disableIncrease?: boolean
}>()

defineEmits<{
  decrease: []
  increase: []
}>()
</script> 