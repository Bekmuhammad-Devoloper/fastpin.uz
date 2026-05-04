import type { ITransactions } from '../../types/transactions/transactions'
import api from '../api'
export async function getTransactionsByUser(
	userId: string,
	limit = 100,
	offset = 0,
) {
	try {
		const responce = await api.post('/transactions/transactionsGet', {
			userId,
			limit,
			offset,
		})
		return { data: responce.data as ITransactions[] }
	} catch (error) {
		throw new Error('getTransactions error')
	}
}
export async function createTransactions({
	token,
	userId,
	price,
	gameName,
	donatName,
	createdBy,
}: {
	token: string
	userId: string
	price: number
	gameName: string
	donatName: string
	createdBy: string
}) {
	try {
		const response = await api.post('/transactions/transactionsCreate', {
			token,
			userId,
			price,
			gameName,
			donatName,
			createdBy,
		})
		return response.data as ITransactions
	} catch (error: any) {
		return error.response.data as ITransactions
	}
}
export async function deleteTransactions({
	token,
	id,
}: {
	token: string
	id: string
}) {
	try {
		const response = await api.post('/transactions/transactionsDelete', {
			token,
			id,
		})
		return response
	} catch (error: any) {
		throw error
	}
}
export async function getTransactionsByPeriod({
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
		const responce = await api.post('/transactions/getTransactionsByPeriod', {
			token,
			startDay,
			startMonth,
			startYear,
			endDay,
			endMonth,
			endYear,
		})
		return { data: responce.data as ITransactions[] }
	} catch (error) {
		throw new Error('getTransactions error')
	}
}
