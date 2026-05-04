import type { IOffer } from '../../types/games/games'
import api from '../api'

export async function getOffer({
	token,
	gameId,
}: {
	token: string
	gameId: string
}) {
	try {
		const responce = await api.post('/offers/getOffers', {
			token,
			gameId,
		})
		const result = responce.data as IOffer[]
		return result
	} catch (error) {
		throw new Error('games error')
	}
}
export async function getOfferById({
	token,
	id,
}: {
	token: string
	id: string
}) {
	try {
		const response = await api.post('/offers/getOffersById', {
			token,
			id,
		})
		return response.data as IOffer
	} catch (error: any) {
		if (error?.response?.status === 404) {
			return null 
		}

		throw error 
	}
}

export async function createOffer(formData: any) {
	try {
		const response = await api.post('/offers/create', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return response
	} catch (error: any) {
		throw error
	}
}
export async function updateOffer(formData: any) {
	try {
		const response = await api.post('/offers/updateOffer', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return response
	} catch (error: any) {
		throw error
	}
}
export async function deleteOffer({
	token,
	id,
}: {
	token: string
	id: string
}) {
	try {
		const result = await api.post('/offers/deleteOffer', { token, id })
		return result.data
	} catch (error) {
		throw error
	}
}
