import type { IPromoCode } from '../../types/promocode/promocode'
import api from '../api'

export async function getPromocode(token: string) {
	try {
		const responce = await api.post('/promocode/getPromocode', {
			token,
		})
		const result = responce.data as IPromoCode[]
		return result
	} catch (error) {
		throw new Error('promocode error')
	}
}
export async function createPromocode({
	token,
	code,
	expiresAt,
	usageLimit,
	usagePerUser,
	discountType,
	discount,
	maxDiscount,
	minPrice,
}: {
	token: string
	code: string
	expiresAt: Date
	usageLimit: number
	usagePerUser: number
	discountType: 'percent' | 'fixed'
	discount: number
	maxDiscount: number
	minPrice: number
}) {
	try {
		const responce = await api.post('/promocode/create', {
			token,
			code,
			expiresAt,
			usageLimit,
			usagePerUser,
			discountType,
			discount,
			maxDiscount,
			minPrice,
		})
		const result = responce.data as IPromoCode[]
		return result
	} catch (error) {
		throw new Error('promocode error')
	}
}
