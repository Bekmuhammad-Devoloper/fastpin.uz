import { create } from 'zustand'

interface ModalState {
	open: boolean
	message: string
	severity: 'info' | 'error'
	openModal: (message: string, severity?: 'info' | 'error') => void
	closeModal: () => void
}

export const useTextModalStore = create<ModalState>(set => ({
	open: false,
	message: '',
	severity: 'info',
	openModal: (message, severity = 'info') =>
		set({
			open: true,
			message,
			severity,
		}),
	closeModal: () =>
		set({
			open: false,
			message: '',
			severity: 'info',
		}),
}))
