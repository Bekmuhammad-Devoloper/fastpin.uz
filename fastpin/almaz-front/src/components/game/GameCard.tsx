import {
	Button,
	Card,
	CardActions,
	CardContent,
	CardMedia,
	IconButton,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import type { IOffer } from '../../types/games/games'
import { useSavedGamesStore } from '../../store/cart/useCartStore'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { useOfferStoreModal } from '../../store/modal/useOfferModal'
import { useTokenStore } from '../../store/token/useTokenStore'
import { useIsAdmin } from '../../hooks/useIsAdmin'
import EditIcon from '@mui/icons-material/Edit'
import { updateNumberFormat } from '../../func/number'
import GameStatus from './GameStatus'
import { useBuyModalStore } from '../../store/modal/useBuyModalStore'
import { useGameStore } from '../../store/game/useGameStore'
import { getGameById } from '../../api/games/games'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
const GameCard = ({ offer }: { offer: IOffer }) => {
	const theme = useTheme()
	const navigate = useNavigate()
	const { setGame } = useGameStore()
	const { token, userRole } = useTokenStore()
	const { isAdmin } = useIsAdmin()
	const isSuperUser = userRole === 'superUser'
	const { t, lang } = useTranslationStore()
	const apiUrl = import.meta.env.VITE_API_URL
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const { getCount, toggle, reset } = useSavedGamesStore()
	const selected = getCount(offer.id)
	const { openModal: openModalToBuy } = useBuyModalStore()
	const { openModal } = useOfferStoreModal()
	const [loading, setLoading] = useState(false)
	return (
		<>
			<Card
				sx={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					position: 'relative',
					border: '3px solid transparent',
					background:
						offer.status === 'top'
							? theme.palette.mode === 'dark'
								? `linear-gradient(135deg, #0d2818, #0a2520) padding-box, conic-gradient(from var(--angle), #1eb603, #00f2ff, #39ff14, #00f2ff, #1eb603) border-box`
								: `linear-gradient(135deg, #f0fdf4, #ecfdf5) padding-box, conic-gradient(from var(--angle), #22c55e, #06b6d4, #4ade80, #06b6d4, #22c55e) border-box`
							: offer.status === 'sale'
								? theme.palette.mode === 'dark'
									? `linear-gradient(135deg, #1a0a12, #200d18) padding-box, conic-gradient(from var(--angle), #ff1744, #ffffff, #ff69b4, #ff1744, #ffffff) border-box`
									: `linear-gradient(135deg, #fff5f7, #fff0f3) padding-box, conic-gradient(from var(--angle), #e11d48, #ffffff, #f472b6, #e11d48, #ffffff) border-box`
								: offer.status === 'vip'
									? theme.palette.mode === 'dark'
										? `linear-gradient(135deg, #130d1e, #1a1028) padding-box, conic-gradient(from var(--angle), #a855f7, #f0abfc, #7c3aed, #d946ef, #a855f7) border-box`
										: `linear-gradient(135deg, #faf5ff, #f5f0ff) padding-box, conic-gradient(from var(--angle), #8b5cf6, #e879f9, #6d28d9, #c084fc, #8b5cf6) border-box`
									: theme.palette.mode === 'dark'
										? `linear-gradient(145deg, ${theme.palette.background.paper}, #151c2e) padding-box, conic-gradient(from var(--angle), #1e3a6e, #4a6fa5, #1e3a6e, #4a6fa5) border-box`
										: `linear-gradient(145deg, #ffffff, #f1f5f9) padding-box, conic-gradient(from var(--angle), #6b7db3, #a9bdd2, #6b7db3, #a9bdd2) border-box`,
					borderRadius: '18px',
					animation: 'rotateBorder 2s linear infinite',
					boxShadow:
						offer.status === 'top'
							? theme.palette.mode === 'dark'
								? '0 8px 32px rgba(30, 182, 3, 0.3), 0 4px 16px rgba(28, 191, 199, 0.2)'
								: '0 8px 32px rgba(34, 197, 94, 0.25), 0 4px 16px rgba(6, 182, 212, 0.2)'
							: offer.status === 'sale'
								? theme.palette.mode === 'dark'
									? '0 8px 32px rgba(255, 23, 68, 0.35), 0 4px 16px rgba(255, 105, 180, 0.25)'
									: '0 8px 32px rgba(225, 29, 72, 0.2), 0 4px 16px rgba(244, 114, 182, 0.15)'
								: offer.status === 'vip'
									? theme.palette.mode === 'dark'
										? '0 8px 40px rgba(168, 85, 247, 0.35), 0 6px 20px rgba(217, 70, 239, 0.25)'
										: '0 8px 40px rgba(139, 92, 246, 0.25), 0 6px 20px rgba(192, 132, 252, 0.2)'
									: theme.palette.mode === 'dark'
										? '0 6px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(30, 58, 110, 0.2)'
										: '0 6px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(107, 125, 179, 0.1)',
					overflow: 'hidden',
					transition:
						'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, filter 0.3s ease',
					'&:hover': {
						filter: 'brightness(1.06)',
						transform: 'translateY(-6px) scale(1.02)',
						boxShadow:
							offer.status === 'top'
								? theme.palette.mode === 'dark'
									? '0 20px 60px rgba(30, 182, 3, 0.5), 0 12px 40px rgba(28, 191, 199, 0.4)'
									: '0 20px 60px rgba(34, 197, 94, 0.4), 0 12px 40px rgba(6, 182, 212, 0.35)'
								: offer.status === 'sale'
									? theme.palette.mode === 'dark'
										? '0 20px 60px rgba(255, 23, 68, 0.55), 0 12px 40px rgba(255, 105, 180, 0.45)'
										: '0 20px 60px rgba(225, 29, 72, 0.35), 0 12px 40px rgba(244, 114, 182, 0.3)'
									: offer.status === 'vip'
										? theme.palette.mode === 'dark'
											? '0 24px 70px rgba(168, 85, 247, 0.55), 0 16px 50px rgba(217, 70, 239, 0.45)'
											: '0 24px 70px rgba(139, 92, 246, 0.4), 0 16px 50px rgba(192, 132, 252, 0.35)'
										: theme.palette.mode === 'dark'
											? '0 16px 50px rgba(0, 0, 0, 0.55), 0 8px 30px rgba(30, 58, 110, 0.3)'
											: '0 16px 50px rgba(0, 0, 0, 0.12), 0 8px 30px rgba(107, 125, 179, 0.15)',
					},
				}}
			>
				<GameStatus status={offer.status} />
				<IconButton
					sx={{
						position: 'absolute',
						top: 8,
						right: 8,
						zIndex: 3,
						backgroundColor: selected
							? 'rgba(255, 255, 255, 0.9)'
							: theme.palette.mode === 'dark'
								? 'rgba(0, 0, 0, 0.5)'
								: 'rgba(255, 255, 255, 0.8)',
						backdropFilter: 'blur(8px)',
						WebkitBackdropFilter: 'blur(8px)',
						width: 36,
						height: 36,
						boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
						transition: 'all 0.2s ease',
						'&:hover': {
							transform: 'scale(1.1)',
							backgroundColor: selected
								? 'rgba(255, 255, 255, 1)'
								: theme.palette.mode === 'dark'
									? 'rgba(0, 0, 0, 0.6)'
									: 'rgba(255, 255, 255, 0.95)',
						},
					}}
					onClick={e => {
						e.stopPropagation()
						if (selected > 0) {
							reset(offer.id)
						} else {
							toggle(offer.id)
						}
					}}
				>
					<FavoriteIcon
						sx={{ fontSize: 18 }}
						color={selected ? 'error' : 'action'}
					/>
				</IconButton>
				<CardMedia
					component='img'
					image={`${apiUrl}${offer.image}`}
					alt={offer.ruName}
					sx={{
						aspectRatio: '1 / 1',
						width: '100%',
						objectFit: 'cover',
						objectPosition: 'center',
					}}
				/>
				<CardContent
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'end',
						height: '100%',
						px: { xs: 1, sm: 2 },
						py: 1.5,
						'&:last-child': { pb: 1.5 },
					}}
				>
					<Typography
						sx={{
							fontFamily: 'Playwrite',
							color: theme.palette.text.primary,
							lineHeight: 1.3,
						}}
						align='center'
						variant={isMobile ? 'body2' : 'body1'}
					>
						{lang == 'ru' ? offer.ruName : offer.uzName}
					</Typography>
					<Typography
						sx={{
							fontFamily: 'Roboto',
							color: theme.palette.primary.main,
							fontWeight: 800,
							mt: 0.5,
						}}
						variant={isMobile ? 'body1' : 'h6'}
						align='center'
					>
						{isSuperUser
						? updateNumberFormat(offer.superPrice || offer.price)
						: updateNumberFormat(offer.price)}{' '}
					{t.som}
					</Typography>
				</CardContent>
				<CardActions
					disableSpacing
					sx={{
						display: 'flex',
						flexDirection: isMobile ? 'column' : 'row',
						px: { xs: 1, sm: 1.5 },
						pb: { xs: 1, sm: 1.5 },
						pt: 0,
						gap: 0.5,
					}}
				>
					<Button
						fullWidth
						loading={loading}
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 0.5,
							py: { xs: 0.8, sm: 1 },
							fontSize: { xs: '0.8rem', sm: '0.875rem' },
						}}
						onClick={async e => {
							setLoading(true)
							e.stopPropagation()
							if (token) {
								const result = await getGameById({ token, id: offer.gameId })
								setGame(result)
								openModalToBuy(offer)
							} else {
								navigate('/register')
							}
							setLoading(false)
						}}
						color={offer.status !== '-' ? 'warning' : 'info'}
						variant='contained'
					>
						{token && <ShoppingCartIcon sx={{ fontSize: 18 }} />}
						{token ? t.buy : t.register}
					</Button>
					{isAdmin && (
						<IconButton
							size='small'
							sx={{
								color: theme.palette.text.secondary,
								'&:hover': { color: theme.palette.primary.main },
							}}
							onClick={e => {
								e.stopPropagation()
								openModal(offer)
							}}
						>
							<EditIcon sx={{ fontSize: 18 }} />
						</IconButton>
					)}
				</CardActions>
			</Card>
		</>
	)
}

export default GameCard
