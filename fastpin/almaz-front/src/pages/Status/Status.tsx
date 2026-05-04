import {
	Box,
	Button,
	CircularProgress,
	Typography,
	useTheme,
} from '@mui/material'
import Header from '../../components/Header/Header'
import BottomNavigate from '../home/BottomNavigate'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderStatus } from '../../api/buy/buy'
import type { IStatus } from '../../types/buy/buy'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { getGames } from '../../api/games/games'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import RefreshIcon from '@mui/icons-material/Refresh'

const Status = () => {
	const { gameId, order } = useParams()
	const { t } = useTranslationStore()
	const theme = useTheme()
	const { data, refetch, isLoading } = useQuery<IStatus>({
		queryKey: ['order', gameId, order],
		queryFn: async () => {
			const games = await getGames()
			const game = games.find(g => g.id === gameId || g.name === gameId)
			if (!game) {
				throw new Error('Game not found')
			}
			const result = await orderStatus({
				order: order!,
				gameId: game.id,
			})
			return result ?? []
		},
		enabled: !!order,
	})

	const getStatusConfig = (status?: string) => {
		if (!status)
			return {
				icon: <HourglassEmptyIcon sx={{ fontSize: 64 }} />,
				color: theme.palette.warning.main,
				label: '...',
			}
		const lower = status.toLowerCase()
		if (
			lower.includes('success') ||
			lower.includes('done') ||
			lower.includes('Completed')
		) {
			return {
				icon: <CheckCircleOutlineIcon sx={{ fontSize: 64 }} />,
				color: theme.palette.success.main,
				label: status,
			}
		}
		if (lower.includes('error') || lower.includes('fail')) {
			return {
				icon: <ErrorOutlineIcon sx={{ fontSize: 64 }} />,
				color: theme.palette.error.main,
				label: status,
			}
		}
		return {
			icon: <HourglassEmptyIcon sx={{ fontSize: 64 }} />,
			color: theme.palette.warning.main,
			label: status,
		}
	}

	const statusConfig = getStatusConfig(data?.status)
	return (
		<>
			<Box
				sx={{
					minHeight: '100vh',
					background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
					overflowY: 'auto',
				}}
			>
				<Header />
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						px: { xs: 2, sm: 3 },
						py: 4,
						gap: 3,
					}}
				>
					<Box
						sx={{
							p: 4,
							borderRadius: 4,
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
							boxShadow:
								theme.palette.mode === 'dark'
									? '0 8px 32px rgba(0, 0, 0, 0.3)'
									: '0 8px 32px rgba(0, 0, 0, 0.08)',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 2,
							width: '100%',
							maxWidth: 400,
						}}
					>
						{isLoading ? (
							<CircularProgress size={64} />
						) : (
							<Box sx={{ color: statusConfig.color }}>{statusConfig.icon}</Box>
						)}
						<Typography variant='h5' fontWeight={700} align='center'>
							{t.status}
						</Typography>
						<Typography
							variant='h6'
							align='center'
							sx={{
								color: statusConfig.color,
								fontWeight: 600,
								px: 2,
								py: 1,
								borderRadius: 2,
								bgcolor:
									theme.palette.mode === 'dark'
										? 'rgba(255,255,255,0.05)'
										: 'rgba(0,0,0,0.03)',
								width: '100%',
								textAlign: 'center',
							}}
						>
							{statusConfig.label == 'Completed'
								? t.Completed
								: statusConfig.label == 'Pending'
									? t.pending
									: statusConfig.label == 'In progress'
										? t.in_progress
										: statusConfig.label == 'partial'
											? t.partial
											: statusConfig.label == 'canceled'
												? t.canceled
												: statusConfig.label == 'Refunded'
													? t.Refunded
													: statusConfig.label}
						</Typography>
						<Button
							fullWidth
							variant='contained'
							size='large'
							startIcon={<RefreshIcon />}
							sx={{ mt: 1, py: 1.5 }}
							onClick={() => {
								refetch()
							}}
						>
							{t.update}
						</Button>
					</Box>
				</Box>
				<BottomNavigate />
			</Box>
		</>
	)
}

export default Status
