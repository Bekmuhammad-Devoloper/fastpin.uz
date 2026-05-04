import type { IAnnouncements } from '../../types/Announcements/Announcements'
import api from '../api'

export async function getAnnouncements() {
	try {
		const responce = await api.post('/announcements/getAnnouncements', {})
		const result = responce.data as IAnnouncements[]
		return result
	} catch (error) {
		throw new Error('games error')
	}
}
export async function createAnnouncements(formData: any) {
	try {
		const response = await api.post('/announcements/create', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return response
	} catch (error: any) {
		throw error
	}
}
export async function updateAnnouncements(formData: any) {
	try {
		const response = await api.post('/announcements/update', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return response
	} catch (error: any) {
		throw error
	}
}
export async function deleteAnnouncements({
	token,
	id,
}: {
	token: string
	id: string
}) {
	try {
		const result = await api.post('/announcements/delete', { token, id })
		return result.data
	} catch (error) {
		throw error
	}
}
