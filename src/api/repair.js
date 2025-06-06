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