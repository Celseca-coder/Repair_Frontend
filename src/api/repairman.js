import api from './index';

// 维修人员注册
export const repairmanRegister = (userData) => {
  return api.post('/api/repairman/register', userData);
};

// 维修人员登录 - 使用 URL 参数
export const repairmanLogin = (credentials) => {
  // 使用 URLSearchParams 构造查询参数
  const params = new URLSearchParams();
  params.append('username', credentials.username);
  params.append('password', credentials.password);
  // 将参数附加到 URL 上
  return api.post(`/api/repairman/login?${params.toString()}`);
};

// 获取当前维修人员信息 (需要认证和维修人员权限)
export const getCurrentRepairman = () => {
  return api.get('/api/repairman/current');
};

/**
 * 获取维修人员的历史工单
 * @param {number} repairmanId - 维修人员ID
 * @returns {Promise} 返回维修人员的历史工单列表
 */
export const getRepairmanHistory = (repairmanId) => {
  return api.get(`/api/repairman/${repairmanId}/history`);
};

// 接受工单
export const acceptRepairOrder = (repairmanId, orderId) => {
  return api.post(`/api/repairman/${repairmanId}/orders/${orderId}/accept`);
};

// 拒绝工单
export const rejectRepairOrder = (repairmanId, orderId, reason) => {
  return api.post(`/api/repairman/${repairmanId}/orders/${orderId}/reject`, {
    reason: reason
  });
};

/**
 * 接受工单
 * @param {number} repairmanId - 维修人员ID
 * @param {number} orderId - 工单ID
 * @returns {Promise} 
 */
export const acceptOrder = (repairmanId, orderId) => {
  return api.post(`/api/repairman/${repairmanId}/orders/${orderId}/accept`);
};

/**
 * 拒绝工单
 * @param {number} repairmanId - 维修人员ID
 * @param {number} orderId - 工单ID
 * @returns {Promise} 
 */
export const rejectOrder = (repairmanId, orderId) => {
  return api.post(`/api/repairman/${repairmanId}/orders/${orderId}/reject`);
};

/**
 * 更新工单的维修结果
 * @param {number} repairmanId - 维修人员ID
 * @param {number} orderId - 工单ID
 * @param {string} result - 维修结果（例如："finish"）
 * @returns {Promise}
 */
export const updateRepairResult = (repairmanId, orderId, result) => {
  return api.put(`/api/repairman/${repairmanId}/orders/${orderId}/result`, null, {
    params: { result: result }
  });
};

/**
 * 获取维修人员的总收入
 * @param {number} repairmanId - 维修人员ID
 * @returns {Promise<number>} 返回维修人员的总收入
 */
export const getRepairmanIncome = (repairmanId) => {
  return api.get(`/api/repairman/${repairmanId}/income`)
}

/**
 * 记录工单的材料使用情况
 * @param {number} orderId - 工单ID
 * @param {object} materialData - 材料数据对象
 * @returns {Promise}
 */
export const recordOrderMaterial = (orderId, materialData) => {
  return api.post(`/api/repairman/orders/${orderId}/materials`, materialData)
}

// ... 其他维修人员相关的 API 调用函数可以添加到这里 