import axios from 'axios';
import toast from 'react-hot-toast';

import { BASE_URL } from '../constants/constants';
import { storage } from '../utils/utils';

const axiosClient = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

axiosClient.interceptors.request.use(
	(config) => {
		const token = storage.getToken();
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

axiosClient.interceptors.response.use(
	(res) => {
		return res;
	},
	async (err) => {
		const originalConfig = err.config;

		if (originalConfig.url !== '/user/login' && err.response) {
			// Access Token was expired
			if (err.response.status === 401 && !originalConfig._retry) {
				originalConfig._retry = true;
				try {
					const res = await axios.post(BASE_URL + 'user/refresh', {
						refreshToken: storage.getRefreshToken(),
					});
					storage.setToken(res.data.accessToken);
					storage.setRefreshToken(res.data.refreshToken);
					storage.setExpiration(res.data.expiresIn);

					return axiosClient(originalConfig);
				} catch (_error) {
					toast.error('Session time out. Please login again.', {
						id: 'sessionTimeOut',
					});
					// Logging out the user by removing all the tokens from local
					storage.clearTokens();
					// Redirecting the user to the landing page
					window.location.href = window.location.origin;
					return Promise.reject(_error);
				}
			}
		}

		return Promise.reject(err);
	}
);

export default axiosClient;
