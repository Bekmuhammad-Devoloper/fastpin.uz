import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CardStore = {
	card: 'humo' | 'uzcard'
	setCard: (value: 'humo' | 'uzcard') => void
}

export const useSelectCardStore = create<CardStore>()(
	persist(
		set => ({
			card: 'humo',
			setCard: value => set({ card: value }),
		}),
		{
			name: 'card-storage',
		},
	),
)
