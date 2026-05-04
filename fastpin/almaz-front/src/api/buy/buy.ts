import axios from 'axios'
import type { IStatus } from '../../types/buy/buy'
import api from '../api'
import type { IBalance } from '../../types/api/apiBalance'

export async function createBuy({
	token,
	gameId,
	playerId,
	serverId,
	botId,
	offerId,
}: {
	token: string
	gameId: string
	playerId: string
	serverId: string
	botId: string
	offerId: string
}) {
	try {
		const responce = await api.post('/buy/create', {
			token,
			gameId,
			playerId,
			serverId,
			botId,
			offerId,
		})
		const result = responce.data as any
		return result
	} catch (error: any) {
		if (axios.isAxiosError(error)) {
			const data = error.response?.data
			const msg =
				typeof data === 'string'
					? data
					: data?.message || data?.error || JSON.stringify(data) || 'Server error'
			throw new Error(msg)
		}

		throw new Error('Unknown error')
	}
}
export async function orderStatus({
	order,
	gameId,
}: {
	order: string
	gameId: string
}) {
	try {
		const responce = await api.post('/buy/orderStatus', {
			order: order.toString(),
			gameId,
		})
		const result = responce.data as IStatus
		return result
	} catch (error) {
		throw new Error('games error')
	}
}
export async function ordersStatus({
	orders,
	gameId,
}: {
	orders: string[]
	gameId: string
}) {
	try {
		const responce = await api.post('/buy/ordersStatus', {
			orders: orders,
			gameId,
		})
		const result = responce.data as Record<
			string,
			{
				charge: string
				start_count: string
				status: IStatus['status']
				remains: string
				currency: string
			}
		>
		return result
	} catch (error) {
		throw new Error('games error')
	}
}
export async function getBalance({ token }: { token: string }) {
	try {
		const responce = await api.post('/buy/getBalance', {
			token,
		})
		const result = responce.data as IBalance
		return result
	} catch (error: any) {
		if (axios.isAxiosError(error)) {
			throw new Error(error.response?.data || 'Server error')
		}

		throw new Error('Unknown error')
	}
}
