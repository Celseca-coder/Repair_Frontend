import api from './index';
import { useAuthStore } from '@/stores/auth';

// 添加评论
export const addReview = (reviewData) => {
  const authStore = useAuthStore(); // 获取 authStore 实例
  return api.post('/reviews/addReviews', {
    ...reviewData,
    userId: authStore.user.id // 从 authStore 中获取 userId
  });
};

// 获取评论列表（如果需要的话）
export const getReviews = (orderId) => {
  return api.get(`/reviews/${orderId}`);
}; 