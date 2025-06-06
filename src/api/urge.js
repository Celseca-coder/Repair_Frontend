import api from './index';

// 催单
export const urgeOrder = (orderId, urgeData) => {
  return api.post(`/api/orders/${orderId}/urge`, urgeData);
}; 