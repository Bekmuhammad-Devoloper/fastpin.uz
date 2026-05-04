import { useQuery } from '@tanstack/react-query'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import DeleteIcon from '@mui/icons-material/Delete'
import type { ICards } from '../../types/cards/cards'
import { useTokenStore } from '../../store/token/useTokenStore'
import { deleteAdmincart, getAdmincart } from '../../api/cards/cards'
import {
	Box,
	Card,
	CardContent,
	IconButton,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import LoadingProgress from '../Loading/LoadingProgress'

const BankCards = ({ cardType }: { cardType: string }) => {
	const { token } = useTokenStore()
	const isAdmin = import.meta.env.VITE_ADMINTOKEN === token
	const { t } = useTranslationStore()
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const {
		data: cards = [],
		isLoading,
		refetch,
	} = useQuery<ICards[], Error>({
		queryKey: ['admin-cards', token, cardType],
		queryFn: async () => {
			const allCards = await getAdmincart(token)
			if (cardType === 'all') return allCards
			return allCards.filter(pay => pay.type === cardType)
		},
		enabled: !!token,
	})

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text.replace(/\s/g, ''))
	}

	return (
		<Box sx={{ width: '100%' }}>
			{isLoading ? (
				<LoadingProgress />
			) : cards.length === 0 ? (
				<Typography
					sx={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
					color='text.secondary'
					textAlign='center'
					py={6}
				>
					{t.no_cards_added}
				</Typography>
			) : (
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						gap: 2,
						overflowX: 'auto',
						scrollbarWidth: 'none',
						'&::-webkit-scrollbar': { display: 'none' },
						scrollSnapType: 'x mandatory',
						pb: 1,
					}}
				>
					{cards.map((card, index) => (
						<Card
							key={index}
							elevation={0}
							sx={{
								borderRadius: 2,
								background:
									theme.palette.mode === 'dark'
										? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
										: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
								color: 'white',
								position: 'relative',
								overflow: 'hidden',
								minHeight: '160px',
								scrollSnapAlign: 'start',
								minWidth: isMobile ? 300 : 380,
								boxShadow:
									theme.palette.mode === 'dark'
										? '0 8px 30px rgba(102, 126, 234, 0.3)'
										: '0 8px 30px rgba(79, 172, 254, 0.3)',
							}}
						>
							<CardContent
								sx={{
									position: 'relative',
									zIndex: 1,
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
									height: '100%',
									width: '100%',
									p: 2.5,
									'&:last-child': { pb: 2.5 },
								}}
							>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 1,
										mb: 2,
									}}
								>
									<CreditCardIcon fontSize='large' sx={{ opacity: 0.9 }} />
									<Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600}>
										{card.name}
									</Typography>
									{isAdmin && (
										<IconButton
											size='small'
											sx={{
												ml: 'auto',
												color: 'white',
												bgcolor: 'rgba(255,255,255,0.15)',
												'&:hover': { bgcolor: 'rgba(255,0,0,0.5)' },
											}}
											onClick={async () => {
												if (!confirm(t.confirm_delete)) return
												await deleteAdmincart({ token, id: card.id })
												refetch()
											}}
										>
											<DeleteIcon fontSize='small' />
										</IconButton>
									)}
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Typography
										variant={isMobile ? 'h6' : 'h5'}
										sx={{
											userSelect: 'all',
											fontWeight: 500,
											letterSpacing: '1px',
										}}
										noWrap
									>
										{card.number}
									</Typography>
									<Tooltip title={t.copy_number} arrow>
										<IconButton
											size='small'
											sx={{
												color: 'white',
												bgcolor: 'rgba(255,255,255,0.2)',
												ml: 'auto',
												'&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
											}}
											onClick={() => copyToClipboard(card.number)}
										>
											<ContentCopyIcon fontSize='small' />
										</IconButton>
									</Tooltip>
								</Box>
							</CardContent>
						</Card>
					))}
				</Box>
			)}
		</Box>
	)
}

export default BankCards
