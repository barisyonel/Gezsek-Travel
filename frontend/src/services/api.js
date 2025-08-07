const API_BASE_URL = '/api';

// API istekleri için yardımcı fonksiyon
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Bir hata oluştu');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  verify: (code) => apiRequest('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
  }),
  
  resendCode: () => apiRequest('/auth/resend-code', {
    method: 'POST',
  }),
  
  getProfile: () => apiRequest('/auth/profile'),
  
  updateProfile: (userData) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};

// Tour API
export const tourAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/tours?${queryString}`);
  },
  
  getById: (id) => apiRequest(`/tours/${id}`),
  
  purchase: (id, purchaseData) => apiRequest(`/tours/${id}/purchase`, {
    method: 'POST',
    body: JSON.stringify(purchaseData),
  }),
  
  getMyPurchases: () => apiRequest('/tours/my/purchases'),
  
  addReview: (id, reviewData) => apiRequest(`/tours/${id}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  }),
  
  getReviews: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/tours/${id}/reviews?${queryString}`);
  },
};

// Blog API
export const blogAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/blog?${queryString}`);
  },
  
  getById: (id) => apiRequest(`/blog/${id}`),
};

export default apiRequest; 