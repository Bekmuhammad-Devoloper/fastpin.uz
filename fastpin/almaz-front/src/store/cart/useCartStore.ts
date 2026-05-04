import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CartState = {
	items: Record<string, 1>
	getCount: (id: string) => number
	toggle: (id: string) => void
	reset: (id: string) => void
}

export const useSavedGamesStore = create<CartState>()(
	persist(
		(set, get) => ({
			items: {},

			getCount: id => {
				return get().items[id] ?? 0
			},

			toggle: id => {
				set(state => {
					if (state.items[id]) {
						const newItems = { ...state.items }
						delete newItems[id]
						return { items: newItems }
					}

					return {
						items: {
							...state.items,
							[id]: 1,
						},
					}
				})
			},

			reset: id => {
				set(state => {
					const newItems = { ...state.items }
					delete newItems[id]
					return { items: newItems }
				})
			},
		}),
		{
			name: 'saved-games',
		},
	),
)
