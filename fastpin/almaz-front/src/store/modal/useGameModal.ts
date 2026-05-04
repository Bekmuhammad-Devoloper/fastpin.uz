import { create } from 'zustand'
import type { IGames } from '../../types/games/games'

interface GamesState {
	games: IGames[]
	modalOpen: boolean
	selectedGame: IGames | null
	openModal: (game?: IGames) => void
	closeModal: () => void
	createGame: (game: IGames) => void
	setGames: (games: IGames[]) => void
}

export const useGamesStoreModal = create<GamesState>(set => ({
	games: [],
	modalOpen: false,
	selectedGame: null,
	openModal: game => set({ modalOpen: true, selectedGame: game || null }),
	closeModal: () => set({ modalOpen: false, selectedGame: null }),
	createGame: game =>
		set(state => ({
			games: [...state.games, game],
			modalOpen: false,
			selectedGame: null,
		})),
	setGames: games => set({ games }),
}))
