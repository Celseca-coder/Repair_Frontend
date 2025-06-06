import api from './index';

// 添加评论
export const addReview = (reviewData) => {
  return api.post('/reviews/addReviews', reviewData);
};

// 获取评论列表（如果需要的话）
export const getReviews = (orderId) => {
  return api.get(`/reviews/${orderId}`);
}; 