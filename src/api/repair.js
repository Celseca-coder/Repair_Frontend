import api from './index';

// 添加维修请求
export const addRepairRequest = (requestData) => {
  return api.post('/repairs/addRequest', requestData);
};

// 获取用户的维修请求列表
export const getRepairRequests = (username) => {
  return api.post('/repairs/getRequest', { username });
};

// 获取维修订单列表
export const getRepairOrders = (vehicleId) => {
  return api.post('/repairs/getOrders', { vehicleId });
};

/**
 * 用户催单
 * @param {number} orderId - 订单ID
 * @param {string} username - 用户名
 * @param {string} remark - 备注
 * @returns {Promise}
 */
export const urgeOrder = (orderId, username, remark) => {
  return api.post(`/api/orders/${orderId}/urge`, {
    username: username,
    remark: remark
  })
} 