import api from './index';

// 管理员登录
export const adminLogin = (credentials) => {
  const params = new URLSearchParams();
  params.append('username', credentials.username);
  params.append('password', credentials.password);
  return api.post('/api/admin/login', params);
};

// 获取所有用户（需要认证和管理员权限）
export const getAllUsers = () => {
  return api.get('/api/admin/users');
};

// 更新用户信息
// URL: /api/admin/users/{userId}
// 方法: PUT
// 请求体: UserDTO对象
export const updateUser = (userId, userData) => {
  return api.put(`/api/admin/users/${userId}`, userData);
};

// 删除用户
// URL: /api/admin/users/{userId}
// 方法: DELETE
export const deleteUser = (userId) => {
  return api.delete(`/api/admin/users/${userId}`);
};

// 维修人员管理
export const getAllRepairmen = () => {
  return api.get('/api/admin/repairmen');
};

export const getRepairmanById = (repairmanId) => {
  return api.get(`/api/admin/repairmen/${repairmanId}`);
};

export const updateRepairman = (repairmanId, repairmanData) => {
  return api.put(`/api/admin/repairmen/${repairmanId}`, repairmanData);
};

export const deleteRepairman = (repairmanId) => {
  return api.delete(`/api/admin/repairmen/${repairmanId}`);
};

// 车辆管理
export const getAllVehicles = () => {
  return api.get('/api/admin/vehicles');
};

export const addVehicle = (vehicleData) => {
  return api.post('/vehicles/addVehicles', vehicleData);
};

export const getVehicleById = (vehicleId) => {
  return api.get(`/api/admin/vehicles/${vehicleId}`);
};

export const updateVehicle = (vehicleId, vehicleData) => {
  return api.put(`/api/admin/vehicles/${vehicleId}`, vehicleData);
};

export const deleteVehicle = (vehicleId) => {
  return api.delete(`/api/admin/vehicles/${vehicleId}`);
};

// 维修工单管理
export const getAllRepairOrders = () => {
  return api.get('/api/admin/orders');
};

export const getRepairOrderById = (orderId) => {
  return api.get(`/api/admin/orders/${orderId}`);
};

export const updateRepairOrder = (orderId, orderData) => {
  return api.put(`/api/admin/orders/${orderId}`, orderData);
};

export const deleteRepairOrder = (orderId) => {
  return api.delete(`/api/admin/orders/${orderId}`);
};

// 数据导出
export const exportRepairmen = () => {
  return api.get('/api/admin/export/repairmen', { responseType: 'blob' });
};

export const exportVehicles = () => {
  return api.get('/api/admin/export/vehicles', { responseType: 'blob' });
};

export const exportOrders = () => {
  return api.get('/api/admin/export/orders', { responseType: 'blob' });
};

// 获取待处理维修请求
export const getPendingRepairRequests = () => {
  return api.get('/api/admin/repair-requests/pending');
};

// 将维修请求转换为订单
export const convertRepairRequestToOrder = (requestId, orderData) => {
  return api.post(`/api/admin/repair-requests/${requestId}/convert-to-order`, orderData);
};

/**
 * 获取所有用户列表
 * @returns {Promise<Array>}
 */
export const getUsers = () => {
  return api.get('/api/admin/users');
};

// ... 其他管理员相关的 API 调用函数可以添加到这里 