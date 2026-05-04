import type { ICards } from '../../types/cards/cards'
import api from '../api'

export async function getAdmincart(token: string) {
	try {
		const responce = await api.post('/admincart/getAdmincart', {
			token,
		})
		const result = responce.data as ICards[]
		return result
	} catch (error) {
		throw new Error('cards error')
	}
}
export async function createAdmincart({
	token,
	name,
	number,
	type,
}: {
	token: string
	name: string
	number: string
	type: string
}) {
	try {
		const response = await api.post('/admincart/create', {
			token,
			name,
			number,
			type,
		})
		return response
	} catch (error: any) {
		throw error
	}
}
export async function deleteAdmincart({
	token,
	id,
}: {
	token: string
	id: string
}) {
	try {
		const response = await api.post('/admincart/delete', { token, id })
		return response
	} catch (error: any) {
		throw error
	}
}
