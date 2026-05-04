import { create } from 'zustand'

interface TokenStore {
	token: string       
	accessToken: string 
	refreshToken: string
	balance: string
	userRole: string
	setToken: (token: string) => void
	setTokens: (access: string, refresh: string) => void
	setBalance: (balance: string) => void
	setUserRole: (role: string) => void
	resetToken: () => void
	resetBalance: () => void
}

function decodeJwt(jwt: string): { user_id?: string; role?: string } {
	try {
		return JSON.parse(atob(jwt.split('.')[1]))
	} catch {
		return {}
	}
}

function safeGet(key: string): string {
	const val = localStorage.getItem(key)
	if (!val || val === 'undefined' || val === 'null') {
		localStorage.removeItem(key)
		return ''
	}
	return val
}

export const useTokenStore = create<TokenStore>(set => ({
	token: safeGet('userToken'),
	accessToken: safeGet('accessToken'),
	refreshToken: safeGet('refreshToken'),
	balance: safeGet('userBalance'),
	userRole: safeGet('userRole'),
	setToken: (token: string) => {
		if (!token || token === 'undefined') return
		localStorage.setItem('userToken', token)
		set({ token })
	},
	setTokens: (access: string, refresh: string) => {
		const payload = decodeJwt(access)
		const hexId = payload.user_id || ''
		const userRole = payload.role || ''
		localStorage.setItem('userToken', hexId)
		localStorage.setItem('accessToken', access)
		localStorage.setItem('refreshToken', refresh)
		localStorage.setItem('userRole', userRole)
		set({ token: hexId, accessToken: access, refreshToken: refresh, userRole })
	},
	setBalance: (balance: string) => {
		localStorage.setItem('userBalance', balance)
		set({ balance })
	},
	setUserRole: (userRole: string) => {
		if (!userRole || userRole === 'undefined' || userRole === 'null') return
		localStorage.setItem('userRole', userRole)
		set({ userRole })
	},
	resetToken: () => {
		localStorage.removeItem('userToken')
		localStorage.removeItem('accessToken')
		localStorage.removeItem('refreshToken')
		localStorage.removeItem('userRole')
		set({ token: '', accessToken: '', refreshToken: '', userRole: '' })
	},
	resetBalance: () => {
		localStorage.removeItem('userBalance')
		set({ balance: '' })
	},
}))
