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

// ... 其他维修人员相关的 API 调用函数可以添加到这里 