import { useEffect, useState } from 'react'
import Header from '../../components/Header/Header'
import { useSavedGamesStore } from '../../store/cart/useCartStore'
import BottomNavigate from '../home/BottomNavigate'
import type { IGames, IOffer } from '../../types/games/games'
import { getOfferById } from '../../api/games/offer'
import { useTokenStore } from '../../store/token/useTokenStore'
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import GameCard from '../../components/game/GameCard'
import GameCardSkeleton from '../games/GameCardSkeleton'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { useQuery } from '@tanstack/react-query'
import { getGames } from '../../api/games/games'
const Cart = () => {
	const { token } = useTokenStore()
	const { items } = useSavedGamesStore()
	const { t } = useTranslationStore()
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const isDesctop = useMediaQuery(theme.breakpoints.down('md'))
	const [offers, setOffers] = useState<IOffer[]>([])
	const entries = Object.entries(items)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const fetchGames = async () => {
			setLoading(true)
			try {
				const results = []
				for (const [id] of entries) {
					const offer = await getOfferById({ token, id })
					if (offer) results.push(offer)
				}
				setOffers(results)
			} finally {
				setLoading(false)
			}
		}
		fetchGames()
	}, [token])
	const { data } = useQuery<IGames[], Error>({
		queryKey: ['games'],
		queryFn: async () => {
			const result = await getGames()
			return result ?? []
		},
	})
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
				{loading && (
					<>
						<GameCardSkeleton />
					</>
				)}
				{!loading && offers.length == 0 && (
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							py: 8,
							gap: 2,
						}}
					>
						<FavoriteBorderIcon
							sx={{
								fontSize: 64,
								color: theme.palette.text.secondary,
								opacity: 0.5,
							}}
						/>
						<Typography
							sx={{
								fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
								color: theme.palette.text.secondary,
							}}
							textAlign={'center'}
							variant='h6'
						>
							{t.no_saved_purchases}
						</Typography>
					</Box>
				)}
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
					{offers
						?.filter(offer => {
							const game = data?.find(g => g.id === offer.gameId)
							return game?.place !== 'stop'
						})
						.map((offer, index) => {
							return <GameCard key={index} offer={offer} />
						})}
				</Box>
			</Box>
			<BottomNavigate />
		</Box>
	)
}

export default Cart
