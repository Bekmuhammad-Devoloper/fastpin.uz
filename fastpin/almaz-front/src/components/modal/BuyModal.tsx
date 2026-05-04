import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Link,
	TextField,
	Typography,
	Zoom,
	useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useBuyModalStore } from '../../store/modal/useBuyModalStore'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { useEffect, useState } from 'react'
import { useGameStore } from '../../store/game/useGameStore'
import { useVideoModalStore } from '../../store/modal/useVideoModalStore'
import { useNavigate } from 'react-router-dom'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import { updateNumberFormat } from '../../func/number'
import { createBuy } from '../../api/buy/buy'
import { useTokenStore } from '../../store/token/useTokenStore'
import { useQuery } from '@tanstack/react-query'
import type { IUser } from '../../types/user/user'
import { getUserById } from '../../api/login/login'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import InfoIcon from '@mui/icons-material/Info'
import { useTextModalStore } from '../../store/modal/useTextModal'
const BuyModal = () => {
	const { openModal } = useTextModalStore()
	const { token } = useTokenStore()
	const apiUrl = import.meta.env.VITE_API_URL
	const { open, closeModal, offer } = useBuyModalStore()
	const navigate = useNavigate()
	const { lang, t } = useTranslationStore()
	const [playerId, setPlayerId] = useState('')
	const [serverId, setServerId] = useState('')
	const { game } = useGameStore()
	const { open: openVideo } = useVideoModalStore()
	const theme = useTheme()
	const isRu = lang === 'ru'
	const withOutServerId = game.description !== 'two'
	const isTelegram = game.name === 'Telegram'
	const [loading, setLoading] = useState(false)
	const [cooldown, setCooldown] = useState(0)

	useEffect(() => {
		if (open) {
			setPlayerId(isTelegram ? '@' : '')
			setServerId('')
		}
	}, [open])

	const telegramServerId = Number(offer?.botId) < 49 ? 'premium' : 'stars'
	const mapError = (msg: string): string => {
		const m = msg.toLowerCase()
		if (m.includes('недостаточно средств у провайдера'))
			return t.error_provider_balance
		if (m.includes('баланс провайдера ниже')) return t.error_provider_threshold
		if (m.includes('недостаточно средств') || m.includes('insufficient funds'))
			return t.error_insufficient_balance
		if (m.includes('пользователь не найден') || m.includes('user not found'))
			return t.error_user_not_found
		if (m.includes('offer не найдено')) return t.error_offer_not_found
		if (m.includes('игра не найдена')) return t.error_game_not_found
		if (m.includes('некорректная цена')) return t.error_invalid_price
		if (m.includes('не указан server id')) return t.error_no_server_id
		if (m.includes('ошибка базы данных')) return t.error_database
		if (m.includes('ошибка при получении игры')) return t.error_getting_game
		if (m.includes('некорректный bot id')) return t.error_invalid_bot_id
		if (m.includes('провайдер игры не поддерживается'))
			return t.error_provider_not_supported
		if (m.includes('invalid player id')) return t.error_invalid_player_id
		if (m.includes('bad request')) return t.error_bad_request
		return t.error_unknown
	}

	const { data: userInfo } = useQuery<IUser, Error>({
		queryKey: ['userInfo', token],
		queryFn: async () => {
			const result = await getUserById({ userId: token })
			return result
		},
		enabled: !!token,
	})
	return (
		<Dialog
			open={open}
			onClose={closeModal}
			maxWidth='xs'
			fullWidth
			TransitionComponent={Zoom}
			transitionDuration={400}
			sx={{
				'& .MuiDialog-paper': {
					borderRadius: '24px',
					overflow: 'hidden',
					background:
						theme.palette.mode === 'dark'
							? `linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)`
							: `linear-gradient(135deg, #f8fafc 0%, #e8ecf4 50%, #f0f4ff 100%)`,
					boxShadow:
						theme.palette.mode === 'dark'
							? '0 20px 60px rgba(0, 255, 135, 0.15)'
							: '0 20px 60px rgba(0, 0, 0, 0.15)',
					border: `1px solid ${
						theme.palette.mode === 'dark'
							? 'rgba(0, 255, 136, 0.2)'
							: 'rgba(0, 0, 0, 0.06)'
					}`,
				},
			}}
		>
			<DialogTitle
				sx={{
					p: 3,
					pb: 1,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					background:
						theme.palette.mode === 'dark'
							? 'rgba(0,0,0,0.3)'
							: 'rgba(0,0,0,0.03)',
				}}
			>
				<Typography
					variant='h5'
					component='span'
					fontWeight={800}
					sx={{
						fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
						background:
							theme.palette.mode === 'dark'
								? 'linear-gradient(90deg, #00ff88, #00d4ff)'
								: 'linear-gradient(90deg, #007BFF, #00B8D4)',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						letterSpacing: '-0.5px',
					}}
				>
					{isRu ? offer?.ruName : offer?.uzName}
				</Typography>

				<IconButton
					onClick={closeModal}
					size='small'
					sx={{ color: theme.palette.text.secondary }}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ px: { xs: 3, sm: 4 }, pb: 4, pt: 2 }}>
				<Box sx={{ textAlign: 'center', mb: 3 }}>
					<Box
						component='img'
						src={`${apiUrl}${offer?.image}`}
						alt='offer'
						sx={{
							width: 120,
							height: 120,
							objectFit: 'contain',
							borderRadius: '16px',
							boxShadow:
								theme.palette.mode === 'dark'
									? '0 12px 30px rgba(0, 255, 136, 0.2)'
									: '0 12px 30px rgba(0, 0, 0, 0.1)',
							border: `2px solid ${
								theme.palette.mode === 'dark'
									? 'rgba(0, 255, 136, 0.25)'
									: 'rgba(0, 123, 255, 0.2)'
							}`,
							transition: 'transform 0.3s ease',
							'&:hover': { transform: 'scale(1.05)' },
						}}
					/>
				</Box>

				<Typography
					variant='h4'
					fontWeight={900}
					align='center'
					sx={{
						color:
							theme.palette.mode === 'dark'
								? '#00ffaa'
								: theme.palette.primary.main,
						textShadow:
							theme.palette.mode === 'dark'
								? '0 0 20px rgba(0, 255, 170, 0.4)'
								: 'none',
						mb: 2,
					}}
				>
					{userInfo?.userRole === 'superUser'
						? updateNumberFormat(offer?.superPrice || '')
						: updateNumberFormat(offer?.price || '')}{' '}
					{t.som}
				</Typography>
				<Box
					sx={{
						mb: 2,
						p: 1.5,
						borderRadius: 3,
						background:
							theme.palette.mode === 'dark'
								? 'rgba(255, 0, 0, 0.1)'
								: 'rgba(255, 0, 0, 0.05)',
						border: `1px solid ${
							theme.palette.mode === 'dark'
								? 'rgba(255, 0, 0, 0.3)'
								: 'rgba(255, 0, 0, 0.15)'
						}`,
						cursor: 'pointer',
						transition: 'all 0.2s',
						width: '100%',
						'&:hover': {
							background:
								theme.palette.mode === 'dark'
									? 'rgba(255, 0, 0, 0.18)'
									: 'rgba(255, 0, 0, 0.08)',
						},
					}}
				>
					<Typography
						variant='body2'
						align='center'
						sx={{
							fontWeight: 600,
							color: theme.palette.error.main,
						}}
					>
						{t.support_notice}
					</Typography>
				</Box>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 2,
						width: '100%',
						mb: 2,
					}}
				>
					<IconButton
						color='success'
						onClick={() => {
							openVideo({
								title: isRu ? game.howToUseRu : game.howToUseUz,
								video: { url: `${apiUrl}${game.video}`, type: 'backend' },
							})
						}}
						sx={{
							bgcolor:
								theme.palette.mode === 'dark'
									? 'rgba(0, 255, 159, 0.1)'
									: 'rgba(0, 200, 83, 0.08)',
							'&:hover': {
								bgcolor:
									theme.palette.mode === 'dark'
										? 'rgba(0, 255, 159, 0.2)'
										: 'rgba(0, 200, 83, 0.15)',
							},
						}}
					>
						<PlayCircleOutlineIcon />
					</IconButton>
					<Link
						href='https://t.me/fastpin_support_bot'
						target='_blank'
						rel='noopener noreferrer'
						sx={{ display: 'flex', alignItems: 'center' }}
					>
						<IconButton
							sx={{
								bgcolor:
									theme.palette.mode === 'dark'
										? 'rgba(0, 212, 255, 0.1)'
										: 'rgba(0, 123, 255, 0.08)',
								color: theme.palette.primary.main,
								'&:hover': {
									bgcolor:
										theme.palette.mode === 'dark'
											? 'rgba(0, 212, 255, 0.2)'
											: 'rgba(0, 123, 255, 0.15)',
								},
							}}
						>
							<SupportAgentIcon />
						</IconButton>
					</Link>
					<IconButton
						color='warning'
						onClick={() => {
							openModal((isRu ? offer?.ruDesc : offer?.uzDesc) || '')
						}}
						sx={{
							bgcolor:
								theme.palette.mode === 'dark'
									? 'rgba(255, 215, 0, 0.1)'
									: 'rgba(255, 171, 0, 0.08)',
							'&:hover': {
								bgcolor:
									theme.palette.mode === 'dark'
										? 'rgba(255, 215, 0, 0.2)'
										: 'rgba(255, 171, 0, 0.15)',
							},
						}}
					>
						<InfoIcon />
					</IconButton>
				</Box>

				<TextField
					label={isTelegram ? t.username : t.player_id}
					fullWidth
					variant='outlined'
					value={playerId}
					onChange={e => {
						if (isTelegram) {
							const val = e.target.value
							setPlayerId(val.startsWith('@') ? val : '@')
						} else {
							setPlayerId(e.target.value)
						}
					}}
					sx={{ mb: 1.5 }}
				/>
				{!withOutServerId && (
					<TextField
						label={t.server_id}
						fullWidth
						variant='outlined'
						disabled={isTelegram}
						value={isTelegram ? telegramServerId : serverId}
						onChange={e => setServerId(e.target.value)}
						sx={{ mb: 2 }}
					/>
				)}

				<Button
					variant='contained'
					fullWidth
					size='large'
					onClick={async () => {
						if (loading || cooldown > 0) return
						const price =
							userInfo?.userRole === 'superUser'
								? Number(offer?.superPrice || offer?.price)
								: Number(offer?.price)
						if (userInfo && userInfo.balance < price) {
							openModal(t.error_insufficient_balance, 'error')
							return
						}
						try {
							setLoading(true)
							const result = await createBuy({
								token,
								gameId: game.id,
								playerId: isTelegram ? playerId.slice(1) : playerId,
								serverId: isTelegram ? telegramServerId : serverId,
								botId: offer?.botId!,
								offerId: offer?.id!,
							})
							navigate(`/status/${game.id}/${result.order}`)
							closeModal()
						} catch (error: any) {
							const translated = mapError(error.message || '')
							openModal(translated, 'error')
							setCooldown(15)
							const interval = setInterval(() => {
								setCooldown(prev => {
									if (prev <= 1) {
										clearInterval(interval)
										return 0
									}
									return prev - 1
								})
							}, 1000)
						} finally {
							setLoading(false)
						}
					}}
					disabled={
						loading ||
						cooldown > 0 ||
						(isTelegram
							? playerId.trim().length <= 1
							: withOutServerId
								? !playerId.trim()
								: !playerId.trim() || !serverId.trim())
					}
					sx={{
						py: 1.8,
						borderRadius: 3,
						fontSize: '1.1rem',
						fontWeight: 700,
						background:
							theme.palette.mode === 'dark'
								? 'linear-gradient(90deg, #00c853, #00e676)'
								: 'linear-gradient(90deg, #007BFF, #00B8D4)',
						boxShadow:
							theme.palette.mode === 'dark'
								? '0 8px 25px rgba(0, 230, 118, 0.3)'
								: '0 8px 25px rgba(0, 123, 255, 0.3)',
						textTransform: 'none',
						'&:hover': {
							background:
								theme.palette.mode === 'dark'
									? 'linear-gradient(90deg, #00e676, #69f0ae)'
									: 'linear-gradient(90deg, #0056B3, #007BFF)',
							transform: 'translateY(-1px)',
							boxShadow:
								theme.palette.mode === 'dark'
									? '0 12px 30px rgba(0, 230, 118, 0.4)'
									: '0 12px 30px rgba(0, 123, 255, 0.4)',
						},
						'&:disabled': {
							background: 'rgba(100,100,100,0.3)',
							boxShadow: 'none',
						},
					}}
				>
					{loading
						? '...'
						: cooldown > 0
							? `${t.error_wait} (${cooldown}s)`
							: t.buy}
				</Button>
			</DialogContent>
		</Dialog>
	)
}

export default BuyModal
