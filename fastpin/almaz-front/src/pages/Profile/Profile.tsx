import { useQuery } from '@tanstack/react-query'
import Header from '../../components/Header/Header'
import { useTokenStore } from '../../store/token/useTokenStore'
import type { IUser } from '../../types/user/user'
import BottomNavigate from '../home/BottomNavigate'
import { getUserById } from '../../api/login/login'
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	useTheme,
} from '@mui/material'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import {
	calculateTransactions,
	type ITransactions,
} from '../../types/transactions/transactions'
import { getTransactionsByUser } from '../../api/transactions/transactions'
import { updateNumberFormat } from '../../func/number'
import LoadingProgress from '../../components/Loading/LoadingProgress'

const Profile = () => {
	const theme = useTheme()
	const { t } = useTranslationStore()
	const { token, setBalance } = useTokenStore()
	const { data: userInfo } = useQuery<IUser, Error>({
		queryKey: ['userInfo', token],
		queryFn: async () => {
			const result = await getUserById({ userId: token })
			setBalance(result.balance.toString())
			return result
		},
		enabled: !!token,
	})
	const { data, isLoading } = useQuery<ITransactions[], Error>({
		queryKey: ['userPayments', token],
		queryFn: async () => (await getTransactionsByUser(token)).data ?? [],
		enabled: !!token,
	})
	const information = calculateTransactions(data)
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'start',
				gap: 2,
				width: '100%',
				minHeight: '100vh',
				background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
				overflowY: 'auto',
			}}
		>
			{isLoading && (
				<>
					<LoadingProgress />
				</>
			)}
			<Header />
			<Box
				sx={{
					mx: { xs: 1.5, sm: 2 },
					p: 1,
					borderRadius: 2,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 1,
					width: 'calc(100% - 24px)',
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
				}}
			>
				<Typography
					sx={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", fontWeight: 700 }}
					variant='h4'
					textAlign={'center'}
				>
					{userInfo?.login}
				</Typography>
				<Typography
					variant='h6'
					align='center'
					sx={{
						color: theme.palette.primary.main,
						fontWeight: 700,
					}}
				>
					{updateNumberFormat(userInfo?.balance || '')} {t.som}
				</Typography>
			</Box>
			<TableContainer
				component={Paper}
				sx={{
					mx: { xs: 1.5, sm: 2 },
					borderRadius: 1,
					backgroundColor:
						theme.palette.mode === 'dark'
							? 'rgba(18, 24, 34, 0.7)'
							: 'rgba(255, 255, 255, 0.7)',
					backdropFilter: 'blur(16px)',
					WebkitBackdropFilter: 'blur(16px)',
					boxShadow:
						theme.palette.mode === 'dark'
							? '0 4px 20px rgba(0, 0, 0, 0.3)'
							: '0 4px 20px rgba(0, 0, 0, 0.08)',
					border: `1px solid ${
						theme.palette.mode === 'dark'
							? 'rgba(255,255,255,0.06)'
							: 'rgba(0,0,0,0.04)'
					}`,
				}}
			>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell align='center'>{t.donation_name}</TableCell>
							<TableCell align='center'>{t.count}</TableCell>
							<TableCell align='center'>{t.price}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{information.map((info, index) => {
							return (
								<TableRow
									key={index}
									sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
								>
									<TableCell align='center' component='th' scope='row'>
										{info.donatName}
									</TableCell>
									<TableCell align='center'>{info.count}</TableCell>
									<TableCell
										sx={{
											fontSize: '1.1rem',
											fontWeight: 600,
											color: theme.palette.primary.main,
										}}
										align='center'
									>
										{updateNumberFormat(info.price)}
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</TableContainer>
			<BottomNavigate />
		</Box>
	)
}

export default Profile
