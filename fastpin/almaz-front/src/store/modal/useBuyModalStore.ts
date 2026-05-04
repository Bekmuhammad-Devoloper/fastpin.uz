import { create } from 'zustand'
import type { IOffer } from '../../types/games/games'

interface OfferModalStore {
	open: boolean
	offer: IOffer | null
	openModal: (offer: IOffer) => void
	closeModal: () => void
	clear: () => void
}

export const useBuyModalStore = create<OfferModalStore>(set => ({
	open: false,
	offer: null,
	openModal: offer =>
		set({
			open: true,
			offer,
		}),
	closeModal: () =>
		set({
			open: false,
		}),
	clear: () =>
		set({
			open: false,
			offer: null,
		}),
}))
