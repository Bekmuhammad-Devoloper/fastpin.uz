import axios from 'axios'

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use(config => {
	const accessToken = localStorage.getItem('accessToken')
	if (accessToken) {
		config.headers['Authorization'] = `Bearer ${accessToken}`
	}
	return config
})

let isRefreshing = false
let pendingQueue: Array<{
	resolve: (token: string) => void
	reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
	pendingQueue.forEach(({ resolve, reject }) => {
		if (error) reject(error)
		else resolve(token!)
	})
	pendingQueue = []
}

api.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config
		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					pendingQueue.push({ resolve, reject })
				})
					.then(token => {
						originalRequest.headers['Authorization'] = `Bearer ${token}`
						return api(originalRequest)
					})
					.catch(err => Promise.reject(err))
			}

			originalRequest._retry = true
			isRefreshing = true

			const refreshToken = localStorage.getItem('refreshToken')
			if (!refreshToken) {
				if (!localStorage.getItem('userToken')) {
					localStorage.clear()
					window.location.href = '/register'
				}
				return Promise.reject(error)
			}

			try {
				const response = await axios.post(
					`${import.meta.env.VITE_API_URL}/users/refresh`,
					{ refresh_token: refreshToken }
				)
				const { access_token, refresh_token } = response.data
				try {
					const payload = JSON.parse(atob(access_token.split('.')[1]))
					localStorage.setItem('userToken', payload.user_id || '')
					localStorage.setItem('userRole', payload.role || '')
				} catch {}
				localStorage.setItem('accessToken', access_token)
				localStorage.setItem('refreshToken', refresh_token)
				processQueue(null, access_token)
				originalRequest.headers['Authorization'] = `Bearer ${access_token}`
				return api(originalRequest)
			} catch (refreshError) {
				processQueue(refreshError, null)
				localStorage.clear()
				window.location.href = '/register'
				return Promise.reject(refreshError)
			} finally {
				isRefreshing = false
			}
		}

		return Promise.reject(error)
	}
)

export default api
