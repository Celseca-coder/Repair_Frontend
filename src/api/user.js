import api from './index';
import { useAuthStore } from '../stores/auth';

// 用户注册
export const userRegister = (userData) => {
  return api.post('/users/register', userData);
};

// 用户登录
export const userLogin = (credentials) => {
  const params = new URLSearchParams();
  params.append('username', credentials.username);
  params.append('password', credentials.password);
  return api.post('/users/login', credentials);
};

// 用户注销
export const userLogout = () => {
  return api.get('/users/logout');
};

// 修改用户信息
export const editUser = (userData) => {
  return api.post('/users/editUser', userData);
};
export const getUserInfo = () => {
  return api.get('/users/info');
};

// 获取用户维修订单
export const getRecentOrders = (vehicleId) => {
  return api.post('/repairs/getOrders', {
    vehicleId: vehicleId || 0
  });
};

