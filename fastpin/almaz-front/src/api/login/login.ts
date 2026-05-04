import type { IGetUser, IUser } from '../../types/user/user'
import api from '../api'

export async function login({
	login,
	password,
}: {
	login: string
	password: string
}) {
	try {
		const result = await api.post('/users/login', { login, password })
		return result.data as IUser
	} catch (error) {
		throw error
	}
}
export async function getUserById({ userId }: { userId: string }) {
	try {
		const result = await api.post('/users/getUserById', { userId })
		return result.data as IUser
	} catch (error) {
		throw error
	}
}
export async function deleteUser({
	token,
	userId,
}: {
	token: string
	userId: string
}) {
	try {
		const result = await api.post('/users/deleteUser', { token, userId })
		return result.data as IUser
	} catch (error) {
		throw error
	}
}

export async function getUsers({
	adminToken,
	page,
	count,
	login,
	Token,
	StartBalance,
	userRole,
}: {
	adminToken: string
	page: number
	count: number
	login: string | undefined
	Token: string | undefined
	StartBalance: number | undefined
	userRole: string | undefined
}) {
	try {
		const result = await api.post('/users/getUsers', {
			adminToken,
			page,
			count,
			login,
			Token,
			StartBalance,
			userRole,
		})
		return result.data as IGetUser
	} catch (error) {
		throw error
	}
}
export async function register({
	login,
	password,
}: {
	login: string
	password: string
}) {
	try {
		const result = await api.post('/users/register', { login, password })
		return result.data as IUser
	} catch (error) {
		throw error
	}
}
export async function changePassword({
	token,
	userId,
	oldPassword,
	newPassword,
}: {
	token: string
	userId: string
	oldPassword: string
	newPassword: string
}) {
	try {
		const result = await api.post('/users/changePassword', {
			token,
			userId,
			oldPassword,
			newPassword,
		})
		return result.data
	} catch (error) {
		throw error
	}
}

export async function updateUser({
	token,
	userId,
	userRole,
}: {
	token: string
	userId: string
	userRole: string
}) {
	try {
		const result = await api.post('/users/updateUser', {
			token,
			userId,
			userRole,
		})
		return result.data as IUser
	} catch (error) {
		throw error
	}
}
