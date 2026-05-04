import Header from '../../components/Header/Header'
import { useTokenStore } from '../../store/token/useTokenStore'
import {
	Box,
	Button,
	IconButton,
	Typography,
	useMediaQuery,
} from '@mui/material'
import { useGamesStoreModal } from '../../store/modal/useGameModal'
import EditIcon from '@mui/icons-material/Edit'
import { useGameStore } from '../../store/game/useGameStore'
import { useTheme } from '@mui/material/styles'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { useOfferStoreModal } from '../../store/modal/useOfferModal'
import type { IOffer } from '../../types/games/games'
import { useQuery } from '@tanstack/react-query'
import { getOffer } from '../../api/games/offer'
import BottomNavigate from '../home/BottomNavigate'
import { useState } from 'react'
import Instructions from '../../components/game/Instructions'
import GameCard from '../../components/game/GameCard'
import GameCardSkeleton from './GameCardSkeleton'
import { useIsAdmin } from '../../hooks/useIsAdmin'
const GamePage = () => {
	const theme = useTheme()
	const [active, setActive] = useState<'buy' | 'instructions'>('buy')
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const isDesctop = useMediaQuery(theme.breakpoints.down('md'))
	const { t } = useTranslationStore()
	const { game } = useGameStore()
	const { token } = useTokenStore()
	const { isAdmin } = useIsAdmin()
	const apiUrl = import.meta.env.VITE_API_URL
	const { openModal } = useGamesStoreModal()
	const { openModal: offerCreate } = useOfferStoreModal()
	const { data, isLoading } = useQuery<IOffer[], Error>({
		queryKey: ['offer', token, game.id],
		queryFn: async () => {
			const result = await getOffer({ token, gameId: game.id })
			return result ?? []
		},
	})

	const glassCard = {
		backgroundColor:
			theme.palette.mode === 'dark'
				? 'rgba(18, 24, 34, 0.7)'
				: 'rgba(255, 255, 255, 0.7)',
		backdropFilter: 'blur(16px)',
		WebkitBackdropFilter: 'blur(16px)',
		border: `1px solid ${
			theme.palette.mode === 'dark'
				? 'rgba(255,255,255,0.06)'
				: 'rgba(0,0,0,0.04)'
		}`,
	}

	return (
		<Box
			sx={{
				minHeight: '100vh',
				background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
				overflowY: 'auto',
			}}
		>
			<Header />
			<Box sx={{ px: { xs: 1.5, sm: 2 } }}>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'start',
						gap: 2,
						p: 2,
						...glassCard,
						borderRadius: 4,
						mb: 2,
						boxShadow:
							theme.palette.mode === 'dark'
								? '0 4px 20px rgba(0, 0, 0, 0.3)'
								: '0 4px 20px rgba(0, 0, 0, 0.08)',
					}}
				>
					<img
						src={`${apiUrl}${game.image}`}
						alt='game name'
						style={{
							width: '60px',
							height: '60px',
							objectFit: 'contain',
							borderRadius: '14px',
						}}
					/>
					<Typography
						sx={{
							fontFamily:
								"-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
							fontWeight: 700,
						}}
						variant='h5'
					>
						{game.name}
					</Typography>
					{isAdmin && (
						<IconButton
							sx={{
								ml: 'auto',
								color: theme.palette.primary.main,
							}}
							onClick={e => {
								offerCreate()
								e.stopPropagation()
							}}
						>
							<AddCircleIcon />
						</IconButton>
					)}
					{isAdmin && (
						<IconButton
							sx={{ color: theme.palette.text.secondary }}
							onClick={e => {
								openModal(game)
								e.stopPropagation()
							}}
						>
							<EditIcon />
						</IconButton>
					)}
				</Box>
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						mb: 2,
						...glassCard,
						borderRadius: 3,
						overflow: 'hidden',
						p: 0.5,
					}}
				>
					<Button
						onClick={() => {
							setActive('buy')
						}}
						fullWidth
						variant={active == 'buy' ? 'contained' : 'text'}
						sx={{
							py: 1.2,
							borderRadius: 2.5,
							fontWeight: 600,
						}}
					>
						{t.buy}
					</Button>
					<Button
						onClick={() => {
							setActive('instructions')
						}}
						fullWidth
						variant={active == 'instructions' ? 'contained' : 'text'}
						sx={{
							py: 1.2,
							borderRadius: 2.5,
							fontWeight: 600,
						}}
					>
						{t.instructions}
					</Button>
				</Box>
				{isLoading ? (
					<>
						<GameCardSkeleton />
					</>
				) : (
					<>
						{active == 'buy' ? (
							<Box
								sx={{
									width: '100%',
									display: 'grid',
									gap: { xs: 1.5, sm: 2 },
									gridTemplateColumns: isMobile
										? '1fr 1fr'
										: isDesctop
											? '1fr 1fr 1fr'
											: '1fr 1fr 1fr 1fr',
									pb: 2,
								}}
							>
								{[...(data ?? [])].sort((a, b) => Number(a.price) - Number(b.price)).map((offer, index) => {
									return <GameCard key={index} offer={offer} />
								})}
							</Box>
						) : (
							<Instructions />
						)}
					</>
				)}
			</Box>
			<BottomNavigate />
		</Box>
	)
}

export default GamePage
