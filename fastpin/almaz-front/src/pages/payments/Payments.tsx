import { useQuery } from '@tanstack/react-query'
import Header from '../../components/Header/Header'
import { useTokenStore } from '../../store/token/useTokenStore'
import BottomNavigate from '../home/BottomNavigate'
import type { IPayment } from '../../types/payment/payment'
import {
	deletePayment,
	getPayment,
	updatePayment,
} from '../../api/payment/payment'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ClearIcon from '@mui/icons-material/Clear'
import {
	Box,
	Button,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	useTheme,
} from '@mui/material'

const Payments = () => {
	const theme = useTheme()
	const { t } = useTranslationStore()
	const { token } = useTokenStore()
	const { data, isLoading, refetch } = useQuery<IPayment[], Error>({
		queryKey: ['allPayments', token],
		queryFn: async () => (await getPayment(token)) ?? [],
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

	return (
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
					p: { xs: 1.5, sm: 2, md: 3 },
					mx: 'auto',
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
				}}
			>
				<Button
					fullWidth
					variant='contained'
					loading={isLoading}
					size='large'
					sx={{ py: 1.5 }}
					onClick={() => {
						refetch()
					}}
				>
					{t.update}
				</Button>
				<TableContainer
					component={Paper}
					sx={{
						...glassCard,
						borderRadius: 3,
						boxShadow:
							theme.palette.mode === 'dark'
								? '0 4px 20px rgba(0, 0, 0, 0.3)'
								: '0 4px 20px rgba(0, 0, 0, 0.08)',
					}}
				>
					<Table aria-label='simple table'>
						<TableHead>
							<TableRow>
								<TableCell>{t.price}</TableCell>
								<TableCell align='right'>{t.status}</TableCell>
								<TableCell align='center'>{t.accept}</TableCell>
								<TableCell align='center'>{t.decline}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data?.map((row, index) => (
								<TableRow
									key={index}
									sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
								>
									<TableCell
										component='th'
										scope='row'
										sx={{ fontWeight: 600 }}
									>
										{row.price} {t.som}
									</TableCell>
									<TableCell
										align='right'
										sx={{
											color: row.isWorking
												? theme.palette.warning.main
												: theme.palette.success.main,
											fontWeight: 600,
										}}
									>
										{row.isWorking ? t.pending : t.finished}
									</TableCell>
									<TableCell align='center'>
										<IconButton
											color='success'
											onClick={async () => {
												const result = confirm(`${t.confirm_accept}`)
												if (result) {
													await updatePayment({
														token,
														id: row.id,
														isWorking: false,
														userId: row.userId,
													})
													refetch()
												}
											}}
										>
											<CheckCircleIcon />
										</IconButton>
									</TableCell>
									<TableCell align='center'>
										<IconButton
											color='error'
											onClick={async () => {
												const result = confirm(`${t.confirm_delete}`)
												if (result) {
													await deletePayment({ token, id: row.id })
												}
											}}
										>
											<ClearIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>
			<BottomNavigate />
		</Box>
	)
}

export default Payments
