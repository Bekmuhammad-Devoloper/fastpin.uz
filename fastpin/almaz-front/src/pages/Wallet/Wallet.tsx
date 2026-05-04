import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
	useTheme,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Header from '../../components/Header/Header'
import BottomNavigate from '../home/BottomNavigate'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTokenStore } from '../../store/token/useTokenStore'
import {
	createPayment,
	getPayment,
	getPaymentByUser,
} from '../../api/payment/payment'

import { getUserById } from '../../api/login/login'
import type { IUser } from '../../types/user/user'
import SelectType from '../../components/BankCards/SelectType'
import { useSelectCardStore } from '../../store/cart/useSelectCardStore'
import BankCards from '../../components/BankCards/BankCards'
import { useVideoModalStore } from '../../store/modal/useVideoModalStore'
import infoVideo from '../../images/video/infoVideo.mp4'
import type { IPayment } from '../../types/payment/payment'
import { updateNumberFormat } from '../../func/number'
import { useNavigate } from 'react-router-dom'
const Wallet = () => {
	const navigate = useNavigate()
	const theme = useTheme()
	const [cardType, setCardType] = useState<undefined | string>(undefined)
	const [loading, setIsLoading] = useState(false)
	const { card } = useSelectCardStore()
	const { t } = useTranslationStore()
	const { token, setBalance } = useTokenStore()
	const [amount, setAmount] = useState('')
	const { open } = useVideoModalStore()
	const [cost, setCost] = useState<number | undefined>(undefined)
	useEffect(() => {
		if (!token) {
			return
		}
		const fetchPayments = async () => {
			try {
				const result = (await getPayment(token)) ?? []
				const hasOrder = result.find(
					pay => pay.userId === token && pay.isWorking,
				)
				if (hasOrder) {
					setCost(hasOrder.price)
					setCardType(card)
				}
			} catch (error) {
				console.error(error)
			}
		}
		fetchPayments()
	}, [token])

	const { data: userInfo } = useQuery<IUser, Error>({
		queryKey: ['userInfo', token],
		queryFn: async () => {
			const result = await getUserById({ userId: token })
			setBalance(result.balance.toString())
			return result
		},
		enabled: !!token,
	})
	const { data, isLoading, refetch } = useQuery<IPayment[], Error>({
		queryKey: ['userPayments', token],
		queryFn: async () =>
			(await getPaymentByUser({ token, userId: token })) ?? [],
		enabled: !!token,
	})

	return (
		<Box
			sx={{
				height: '100vh',
				background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
				overflowY: 'auto',
			}}
		>
			<Header />
			{token ? (
				<Box
					sx={{
						p: { xs: 2, sm: 3 },
						mx: 'auto',
						display: 'flex',
						flexDirection: 'column',
						gap: 2,
					}}
				>
					{cost ? (
						<Typography align='center' variant='h4'>
							{t.selected_amount}: {cost} {t.som}
						</Typography>
					) : (
						<Typography align='center' variant='h4'>
							{t.balance}: {updateNumberFormat(userInfo?.balance || '')} {t.som}
						</Typography>
					)}
					<Accordion
						sx={{
							background: `linear-gradient(0deg, ${theme.palette.custom.gradientEnd} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
							boxShadow: '0 0px 24px rgba(0,0,0,0.9)',
						}}
					>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
							aria-controls='panel1-content'
							id='panel1-header'
						>
							<Typography sx={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }} component='span'>
								{t.how_to_pay}
							</Typography>
						</AccordionSummary>
						<AccordionDetails sx={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
							<ol style={{ paddingLeft: '1.2rem', margin: 0 }}>
								<li>{t.payment_instruction}</li>
								<li>{t.payment_booking}</li>
								<li>{t.payment_timeout}</li>
								<li>{t.payment_error_rules}</li>
								<li>{t.remember}</li>
							</ol>
						</AccordionDetails>
						<Button
							fullWidth
							variant='contained'
							sx={{ bgcolor: theme.palette.error.main }}
							onClick={() => {
								open({
									title: t.how_to_pay,
									video: {
										type: 'local',
										src: infoVideo,
									},
								})
							}}
						>
							{t.watch_video}
						</Button>
					</Accordion>
					{!cardType ? (
						<>
							<SelectType />
							<TextField
								label={t.payment_amount}
								value={amount}
								onChange={e => setAmount(e.target.value)}
								type='number'
								fullWidth
								variant='outlined'
								onWheel={e => (e.target as HTMLElement).blur()}
								sx={{ mt: 2 }}
							/>
							<Button
								fullWidth
								variant='contained'
								sx={{ mt: 2, boxShadow: '0 4px 12px rgba(0,0,0,1)' }}
								loading={loading}
								disabled={Number(amount) < 1000}
								onClick={async () => {
									setIsLoading(true)
									const result = (await getPayment(token)) ?? []
									const hasBusy = result.some(
										pay => pay.price === Number(amount),
									)
									const hasOrder = result.some(
										pay => pay.userId === token && pay.isWorking,
									)
									if (hasOrder) {
										alert(t.you_already_have_an_order)
										setIsLoading(false)
										return
									}
									if (hasBusy) {
										alert(t.payment_is_busy)
										setIsLoading(false)
										return
									}
									await createPayment({
										userId: token,
										price: Number(amount),
									})
									setCost(Number(amount))
									setCardType(card)
									setIsLoading(false)
								}}
							>
								{t.book_now}
							</Button>
						</>
					) : (
						<>
							<BankCards cardType={cardType} />
							<Button
								fullWidth
								variant='contained'
								loading={isLoading}
								onClick={async () => {
									await refetch()
								}}
							>
								{t.update}
							</Button>
							<TableContainer
								component={Paper}
								sx={{
									background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
									boxShadow: '0 0px 24px rgba(0,0,0,0.9)',
								}}
							>
								<Table aria-label='simple table'>
									<TableHead>
										<TableRow>
											<TableCell>{t.price}</TableCell>
											<TableCell align='right'>{t.status}</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{data?.map((row, index) => (
											<TableRow
												key={index}
												sx={{
													'&:last-child td, &:last-child th': { border: 0 },
												}}
											>
												<TableCell component='th' scope='row'>
													{row.price} {t.som}
												</TableCell>
												<TableCell
													align='right'
													sx={{ color: row.isWorking ? 'red' : 'green' }}
												>
													{row.isWorking ? t.pending : t.finished}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</>
					)}
				</Box>
			) : (
				<>
					<Typography
						sx={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
						align='center'
						variant='h4'
					>
						{t.must_register}
					</Typography>
					<Button
						fullWidth
						variant='contained'
						onClick={() => {
							navigate('/register')
						}}
					>
						{t.register}
					</Button>
				</>
			)}
			<BottomNavigate />
		</Box>
	)
}

export default Wallet
