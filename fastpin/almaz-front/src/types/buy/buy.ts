export interface IBuy {
	id: string
	year: number
	month: number
	day: number
	hour: number
	minute: number
	userId: string
	price: number
	status: string
	gameId: string
	botId: string
	serverId: string
	playerId: string
}
export interface IStatus {
	status:
		| 'Completed'
		| 'In progress'
		| 'Pending'
		| 'Partial'
		| 'Canceled'
		| 'Refunded'
}