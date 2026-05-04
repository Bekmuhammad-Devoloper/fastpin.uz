import Header from '../../components/Header/Header'
import BottomNavigate from '../home/BottomNavigate'
import { Box, Paper, Typography, useTheme } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useTokenStore } from '../../store/token/useTokenStore'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { getBalance } from '../../api/buy/buy'
import type { IBalance } from '../../types/api/apiBalance'
import { updateNumberFormat } from '../../func/number'
import LoadingProgress from '../../components/Loading/LoadingProgress'

const Balance = () => {
	const { token } = useTokenStore()
	const { t } = useTranslationStore()
	const theme = useTheme()

	const { data, isLoading } = useQuery<IBalance, Error>({
		queryKey: ['adminBalance', token],
		queryFn: async () => getBalance({ token }),
		enabled: !!token,
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

	const total = data ? Number(data.b2bulk) + Number(data.istar) * 1.24 : 0

	const providers = [
		{ label: 'B2Bulk', value: data?.b2bulk ?? '0' },
		{ label: 'istar', value: String(Number(data?.istar) * 1.24) ?? '0' },
	]

	return (
		<Box
			sx={{
				minHeight: '100vh',
				background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
				overflowY: 'auto',
			}}
		>
			<Header />
			{isLoading && <LoadingProgress />}
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 2,
					px: { xs: 1.5, sm: 2 },
				}}
			>
				<Box
					sx={{
						...glassCard,
						borderRadius: 3,
						p: 2.5,
						width: '100%',
						textAlign: 'center',
						boxShadow:
							theme.palette.mode === 'dark'
								? '0 8px 32px rgba(0, 0, 0, 0.3)'
								: '0 8px 32px rgba(0, 0, 0, 0.08)',
					}}
				>
					<Typography
						variant='h5'
						sx={{ fontWeight: 700, color: theme.palette.primary.main }}
					>
						{t.provider_balances}
					</Typography>
					<Typography variant='h6' sx={{ mt: 0.5 }}>
						{t.total}: {updateNumberFormat(total.toString())} $
					</Typography>
				</Box>

				<Box
					component={Paper}
					sx={{
						...glassCard,
						borderRadius: 3,
						width: '100%',
						overflow: 'hidden',
						boxShadow:
							theme.palette.mode === 'dark'
								? '0 4px 20px rgba(0, 0, 0, 0.3)'
								: '0 4px 20px rgba(0, 0, 0, 0.08)',
					}}
				>
					{providers.map((provider, index) => (
						<Box
							key={provider.label}
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								px: 3,
								py: 2.5,
								borderBottom:
									index < providers.length - 1
										? `1px solid ${
												theme.palette.mode === 'dark'
													? 'rgba(255,255,255,0.06)'
													: 'rgba(0,0,0,0.06)'
											}`
										: 'none',
							}}
						>
							<Typography variant='body1' fontWeight={600}>
								{provider.label}
							</Typography>
							<Typography
								variant='body1'
								fontWeight={700}
								sx={{
									color:
										Number(provider.value) > 50
											? theme.palette.success.main
											: theme.palette.warning.main,
								}}
							>
								{updateNumberFormat(provider.value)} $
							</Typography>
						</Box>
					))}
				</Box>
			</Box>
			<BottomNavigate />
		</Box>
	)
}

export default Balance
