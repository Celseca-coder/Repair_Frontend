// stores/order.js
export const useOrderStore = defineStore('order', {
  actions: {
    async updateStatus(orderId, newStatus) {
      await axios.patch(`/api/orders/${orderId}`, { status: newStatus })
      // 状态改为已完成时自动计算费用[^2]
      if (newStatus === 'completed') {
        await this.calculateFee(orderId)
      }
    }
  }
})