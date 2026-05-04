import { create } from 'zustand'
import type { IOffer } from '../../types/games/games'

interface OfferState {
	offer: IOffer[]
	modalOpen: boolean
	selectedOffer: IOffer | null
	openModal: (offer?: IOffer) => void
	closeModal: () => void
	createOffer: (offer: IOffer) => void
	setOffer: (offer: IOffer[]) => void
}

export const useOfferStoreModal = create<OfferState>(set => ({
	offer: [],
	modalOpen: false,
	selectedOffer: null,
	openModal: offer => set({ modalOpen: true, selectedOffer: offer || null }),
	closeModal: () => set({ modalOpen: false, selectedOffer: null }),
	createOffer: offer =>
		set(state => ({
			offer: [...state.offer, offer],
			modalOpen: false,
			selectedOffer: null,
		})),
	setOffer: offer => set({ offer }),
}))
