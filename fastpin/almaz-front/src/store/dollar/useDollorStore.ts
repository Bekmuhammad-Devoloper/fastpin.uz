import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DollarState {
	dollor: string
	setDollor: (value: string) => void
}

export const useDollarStore = create<DollarState>()(
	persist(
		set => ({
			dollor: '',
			setDollor: value => set({ dollor: value }),
		}),
		{
			name: 'dollor-storage', 
		},
	),
)
