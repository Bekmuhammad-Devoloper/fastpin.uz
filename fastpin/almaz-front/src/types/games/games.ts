export interface IGames {
	id: string
	video: string
	name: string
	image: string
	howToUseUz: string
	howToUseRu: string
	helpImage: string
	place: 'top' | 'bot' | 'stop'
	description: 'one' | 'two'
}
export interface IOffer {
	id: string
	status: '-' | 'sale' | 'top' | 'vip'
	gameId: string
	image: string
	uzName: string
	ruName: string
	price: string
	superPrice: string
	ruDesc: string
	uzDesc: string
	botId: string
}
