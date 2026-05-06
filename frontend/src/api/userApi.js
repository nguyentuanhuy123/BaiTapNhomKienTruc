import axiosClient from './axiosClient';

const userApi = {
    // Lấy thông tin user hiện tại
    getCurrentUser: async () => {
        // Lấy email từ localStorage để gửi lên theo yêu cầu của Backend
        const email = localStorage.getItem('userEmail');
        const response = await axiosClient.get('/api/user/me', {
            headers: {
                'X-User-Email': email
            }
        });
        return response.data;
    },

    getUserById: async (id) => {
        const response = await axiosClient.get(`/api/user/${id}`);
        return response.data;
    },

    createUser: async (data) => {
        const response = await axiosClient.post('/api/user', data);
        return response.data;
    },

    checkOnlineStatus: async (id) => {
        const response = await axiosClient.get(`/api/user/${id}/online-status`);
        return response.data;
    }
};

export default userApi;