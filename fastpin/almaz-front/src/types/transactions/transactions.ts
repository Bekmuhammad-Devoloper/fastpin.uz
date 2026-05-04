export interface ITransactions {
	id: string
	userId: string
	price: number
	year: number
	month: number
	day: number
	hour: number
	minute: number
	gameName: string
	donatName: string
	createdBy: string
	order: string
	status?: string
	playerId?: string
	serverId?: string
}

export interface ITransactionsPaginated {
	data: ITransactions[]
}

export interface ICalculate {
	gameName: string
	donatName: string
	count: string
	price: number
}
export function calculateTransactions(
	transactions: ITransactions[] | undefined,
): ICalculate[] {
	if (transactions == undefined) {
		return []
	}
	const map = new Map<string, ICalculate>()
	for (const tx of transactions) {
		const key = `${tx.gameName}__${tx.donatName}`
		if (!map.has(key)) {
			map.set(key, {
				gameName: tx.gameName,
				donatName: tx.donatName,
				count: '1',
				price: tx.price,
			})
		} else {
			const current = map.get(key)!
			map.set(key, {
				...current,
				count: String(Number(current.count) + 1),
				price: current.price + tx.price,
			})
		}
	}

	return Array.from(map.values())
}
