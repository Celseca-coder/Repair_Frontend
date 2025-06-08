<template>
  <div class="order-history">
    <h2>维修订单历史</h2>
    <OrderTable :username="username" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import OrderTable from '@/components/OrderTable.vue'

const authStore = useAuthStore()
const username = computed(() => authStore.username)
</script>

<style scoped>
.order-history {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}
</style> 