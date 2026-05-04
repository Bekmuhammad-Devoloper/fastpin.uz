import { create } from 'zustand'
export type VideoSource =
	| { type: 'backend'; url: string }
	| { type: 'local'; src: string }
interface VideoModalState {
	isOpen: boolean
	title?: string
	video?: VideoSource
	open: (payload: { title?: string; video: VideoSource }) => void
	close: () => void
}
export const useVideoModalStore = create<VideoModalState>(set => ({
	isOpen: false,
	title: undefined,
	video: undefined,
	open: payload =>
		set({
			isOpen: true,
			title: payload.title,
			video: payload.video,
		}),
	close: () =>
		set({
			isOpen: false,
			title: undefined,
			video: undefined,
		}),
}))
