import api from './index';
export const userRegister = (userData) => {
  return api.post('/users/register', userData);
};
export const userLogin = (credentials) => {
  // TODO: 确认普通用户登录 API 的具体 URL 和请求/响应格式
  const params = new URLSearchParams();
  params.append('username', credentials.username);
  params.append('password', credentials.password);
  return api.post('/users/login', credentials);
};

