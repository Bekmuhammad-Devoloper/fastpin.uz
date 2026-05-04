import type { IGames } from '../../types/games/games'
import api from '../api'

export async function getGames() {
	try {
		const responce = await api.post('/games/getGames', {})
		const result = responce.data as IGames[]
		return result
	} catch (error) {
		throw new Error('games error')
	}
}
export async function getGameById({
	token,
	id,
}: {
	token: string
	id: string
}) {
	try {
		const responce = await api.post('/games/getGameById', {
			token,
			id,
		})
		const result = responce.data as IGames
		return result
	} catch (error) {
		throw new Error('games error')
	}
}
export async function createGame(formData: any) {
	try {
		const response = await api.post('/games/create', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return response
	} catch (error: any) {
		throw error
	}
}
export async function updateGame(formData: any) {
	try {
		const response = await api.post('/games/updateGame', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return response
	} catch (error: any) {
		throw error
	}
}
export async function deleteGame({ token, id }: { token: string; id: string }) {
	try {
		const result = await api.post('/games/deleteGame', { token, id })
		return result.data
	} catch (error) {
		throw error
	}
}
