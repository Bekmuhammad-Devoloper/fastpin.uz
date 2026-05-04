export interface IPayment {
	id: string
	year: number
	month: number
	day: number
	hour: number
	minute: number
	userId: string
	price: number
	isWorking: boolean
	sender?: string
}
