import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IGames } from '../../types/games/games'

interface GameState {
	game: IGames
	setGame: (game: IGames) => void
	updateGame: (game: Partial<IGames>) => void
	clearGame: () => void
}

export const useGameStore = create<GameState>()(
	persist(
		set => ({
			game: {
				id: '',
				helpImage: '',
				image: '',
				howToUseUz: '',
				howToUseRu: '',
				name: '',
				place: 'bot',
				video: '',
				description: 'two',
			},
			setGame: game => set({ game }),
			updateGame: game =>
				set(state => ({
					game: state.game
						? { ...state.game, ...game }
						: {
								id: '',
								helpImage: '',
								image: '',
								howToUseUz: '',
								howToUseRu: '',
								name: '',
								place: 'bot',
								video: '',
								description: 'two',
							},
				})),
			clearGame: () =>
				set({
					game: {
						id: '',
						helpImage: '',
						image: '',
						howToUseUz: '',
						howToUseRu: '',
						name: '',
						place: 'bot',
						video: '',
						description: 'two',
					},
				}),
		}),
		{
			name: 'game-storage',
		},
	),
)
