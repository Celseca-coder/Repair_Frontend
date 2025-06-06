import api from './index';
import { useAuthStore } from '../stores/auth';

// 添加车辆
export const addVehicle = (vehicleData) => {
  return api.post('/vehicles/addVehicles', vehicleData);
};

// 获取用户的车辆列表
export const getVehicles = (username) => {
  return api.post('/vehicles/getVehicles', { username });
};

// 获取用户的车辆列表
export const getUserVehicles = () => {
  return api.get('/vehicles/getUserVehicles', {
    params: {
      username: useAuthStore().username
    }
  });
};

// 编辑车辆信息
export const editVehicle = (vehicleData) => {
  return api.post('/vehicles/editVehicles', vehicleData);
};

// 删除车辆
export const deleteVehicle = (vehicleData) => {
  return api.post('/vehicles/deleteVehicles', vehicleData);
}; 