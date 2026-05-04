import type { IPayment } from '../../types/payment/payment'
import api from '../api'

export async function getPaymentByPeriod({
	token,
	startDay,
	startMonth,
	startYear,
	endDay,
	endMonth,
	endYear,
}: {
	token: string
	startDay: number
	startMonth: number
	startYear: number
	endDay: number
	endMonth: number
	endYear: number
}) {
	try {
		const responce = await api.post('/payment/getPaymentByPeriod', {
			token,
			startDay,
			startMonth,
			startYear,
			endDay,
			endMonth,
			endYear,
		})
		const result = responce.data as IPayment[]
		return result
	} catch (error) {
		throw new Error('payment error')
	}
}
export async function getPayment(token: string) {
	try {
		const responce = await api.post('/payment/getPayment', {
			token,
		})
		const result = responce.data as IPayment[]
		return result
	} catch (error) {
		throw new Error('payment error')
	}
}
export async function getPaymentByUser({
	token,
	userId,
}: {
	token: string
	userId: string
}) {
	try {
		const responce = await api.post('/payment/getPaymentByUser', {
			token,
			id: userId,
		})
		const result = responce.data as IPayment[]
		return result
	} catch (error) {
		throw new Error('payment error')
	}
}
export async function createPayment({
	userId,
	price,
}: {
	userId: string
	price: number
}) {
	try {
		const response = await api.post('/payment/createPayment', {
			userId,
			price,
			isWorking: true,
		})
		return response.data as IPayment
	} catch (error: any) {
		return error.response.data as IPayment
	}
}
export async function deletePayment({
	token,
	id,
}: {
	token: string
	id: string
}) {
	try {
		const response = await api.post('/payment/deletePayment', { token, id })
		return response
	} catch (error: any) {
		throw error
	}
}
export async function updatePayment({
	token,
	id,
	isWorking,
	userId,
}: {
	token: string
	id: string
	isWorking: boolean
	userId: string
}) {
	try {
		const response = await api.post('/payment/updatePayment', {
			token,
			id,
			isWorking,
			userId,
		})
		return response
	} catch (error: any) {
		throw error
	}
}
