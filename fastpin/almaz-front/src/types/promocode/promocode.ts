export interface IPromoCode {
	id: string
	code: string
	ExpiresAt: Date
	UsageLimit: number
	UsedCount: number
	UsagePerUser: number
	DiscountType: 'percent' | 'fixed'
	Discount: number
	MaxDiscount: number
	MinPrice: number
	IsActive: boolean
	CreatedAt: Date
}
