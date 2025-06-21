import { defineStore } from 'pinia';
import { getAllUsers, updateUser as updateUserAPI, deleteUser as deleteUserAPI } from '@/api/admin'; // 导入获取用户列表、更新用户和删除用户的 API 函数

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [], // 存放用户列表数据
    loadingUsers: false, // 表示是否正在加载用户列表
    usersError: null, // 存放加载用户列表时的错误信息
    // 可以添加状态来跟踪编辑或删除操作
    loadingUserAction: false,
    userActionError: null,
  }),

  actions: {
    async fetchUsers() {
      this.loadingUsers = true;
      this.usersError = null; // 重置错误信息
      try {
        const response = await getAllUsers();
        // TODO: 根据实际后端响应结构调整数据获取方式
        // 假设后端直接返回用户数组在 response.data 中
        this.users = response.data; 
      } catch (error) {
        this.usersError = error.message || '获取用户列表失败';
        console.error('获取用户列表失败:', error);
      } finally {
        this.loadingUsers = false;
      }
    },

    async updateUser(userId, userData) {
      this.loadingUserAction = true;
      this.userActionError = null; // 重置错误信息
      try {
        const response = await updateUserAPI(userId, userData);
        // TODO: 根据实际后端响应结构调整数据更新方式
        // 假设后端返回更新后的用户对象在 response.data 中
        const updatedUser = response.data;
        // 在用户列表中找到并更新该用户
        const index = this.users.findIndex(user => user.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        return updatedUser; // 返回更新后的用户数据
      } catch (error) {
        this.userActionError = error.message || '更新用户失败';
        console.error('更新用户失败:', error);
        throw new Error(this.userActionError); // 抛出错误，以便组件中处理
      } finally {
        this.loadingUserAction = false;
      }
    },

    async deleteUser(userId) {
      this.loadingUserAction = true;
      this.userActionError = null;
      try {
        // 调用删除 API
        await deleteUserAPI(userId);
        // 从用户列表中移除已删除的用户
        this.users = this.users.filter(user => user.id !== userId);
      } catch (error) {
        this.userActionError = error.message || '删除用户失败';
        console.error('删除用户失败:', error);
        throw new Error(this.userActionError); // 抛出错误
      } finally {
        this.loadingUserAction = false;
      }
    },

    // TODO: 添加其他管理员相关的 actions (如获取维修人员、车辆、工单等)
  },
}); 