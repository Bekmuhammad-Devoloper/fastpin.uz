export interface IUser {
	login: string
	password: string
	token: string
	balance: number
	userBalance?: number
	userRole?: string
	is_admin?: boolean
}
export interface ITokenPair {
	access_token: string
	refresh_token: string
}
export interface IGetUser {
	count: number
	page: number
	pages: number
	total: number
	users: IUser[]
}
