import { useEffect, useMemo, useState } from 'react'
import {
	Box,
	Typography,
	Card,
	CardContent,
	Divider,
	Chip,
	Stack,
	alpha,
	LinearProgress,
	IconButton,
	CircularProgress,
	Tooltip,
	ButtonGroup,
	Button,
} from '@mui/material'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
import PeopleIcon from '@mui/icons-material/People'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import CancelIcon from '@mui/icons-material/Cancel'
import ReplayIcon from '@mui/icons-material/Replay'
import PieChartIcon from '@mui/icons-material/PieChart'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import RefreshIcon from '@mui/icons-material/Refresh'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import BarChartIcon from '@mui/icons-material/BarChart'
import type { ITransactions } from '../../types/transactions/transactions'
import type { IStatus } from '../../types/buy/buy'
import type { IGames } from '../../types/games/games'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { getGames } from '../../api/games/games'
import { ordersStatus } from '../../api/buy/buy'
import { useNavigate } from 'react-router-dom'
import SummaryCard from './SummaryCard'
import {
	formatCurrency,
	getStatusColor,
	getStatusLabel,
	type IStatsItem,
} from './func'
import StatusBar from './StatusBar'
import GameStatsRow from './GameStatsRow'
import NoData from './NoData'

function getStatusIcon(status: string) {
	switch (status) {
		case 'Completed':
			return <CheckCircleIcon sx={{ fontSize: 16, color: '#2ecc71' }} />
		case 'In progress':
			return <HourglassTopIcon sx={{ fontSize: 16, color: '#3498db' }} />
		case 'Pending':
			return <HourglassTopIcon sx={{ fontSize: 16, color: '#f39c12' }} />
		case 'Partial':
			return <PieChartIcon sx={{ fontSize: 16, color: '#9b59b6' }} />
		case 'Canceled':
			return <CancelIcon sx={{ fontSize: 16, color: '#e74c3c' }} />
		case 'Refunded':
			return <ReplayIcon sx={{ fontSize: 16, color: '#e67e22' }} />
		default:
			return <HourglassTopIcon sx={{ fontSize: 16, color: '#95a5a6' }} />
	}
}

const DonationStatistic = ({ data }: { data: ITransactions[] | undefined }) => {
	const { t } = useTranslationStore()
	const navigate = useNavigate()
	const [games, setGames] = useState<IGames[]>([])
	const [statuses, setStatuses] = useState<
		Record<string, IStatus['status'] | 'loading' | 'error'>
	>({})
	const [showAllDonations, setShowAllDonations] = useState(false)
	const [showAllDonatStats, setShowAllDonatStats] = useState(false)
	const [statusesLoaded, setStatusesLoaded] = useState(false)
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const donations = useMemo(() => {
		if (!Array.isArray(data)) {
			return []
		}
		return data.filter(tx => tx.order && tx.order !== '-' && tx.price < 0)
	}, [data])
	useEffect(() => {
		getGames()
			.then(g => setGames(g))
			.catch(() => {})
	}, [])
	const findGameId = (gameName: string): string | null => {
		const game = games.find(g => g.name === gameName)
		return game ? game.id : null
	}
	useEffect(() => {
		if (games.length === 0 || donations.length === 0 || statusesLoaded) return
		const fetchStatuses = async () => {
			const newStatuses: Record<
				string,
				IStatus['status'] | 'loading' | 'error'
			> = {}
			for (const tx of donations) {
				newStatuses[tx.id] = 'loading'
			}
			setStatuses({ ...newStatuses })

			const grouped: Record<string, { gameId: string; txs: typeof donations }> =
				{}
			for (const tx of donations) {
				const gameId = findGameId(tx.gameName)
				if (!gameId) {
					newStatuses[tx.id] = 'error'
					continue
				}
				if (!grouped[gameId]) grouped[gameId] = { gameId, txs: [] }
				grouped[gameId].txs.push(tx)
			}

			const promises = Object.values(grouped).map(async ({ gameId, txs }) => {
				const orders = txs.map(tx => tx.order)
				try {
					const result = await ordersStatus({ orders, gameId })
					for (const tx of txs) {
						const orderData = result[tx.order]
						newStatuses[tx.id] = orderData ? orderData.status : 'error'
					}
				} catch {
					for (const tx of txs) {
						newStatuses[tx.id] = 'error'
					}
				}
			})

			await Promise.all(promises)
			setStatuses({ ...newStatuses })
			setStatusesLoaded(true)
		}

		fetchStatuses()
	}, [games, donations, statusesLoaded])
	const handleRefreshStatuses = () => {
		setStatusesLoaded(false)
		setStatuses({})
	}

	const stats = useMemo(() => {
		let totalAmount = 0
		const gameStats: Record<string, IStatsItem> = {}
		const donatStats: Record<string, IStatsItem> = {}
		const donorStats: Record<string, IStatsItem> = {}
		donations.forEach(tx => {
			const absPrice = Math.abs(tx.price)
			totalAmount += absPrice
			if (tx.gameName && tx.gameName !== '-') {
				if (!gameStats[tx.gameName])
					gameStats[tx.gameName] = { total: 0, count: 0 }
				gameStats[tx.gameName].total += absPrice
				gameStats[tx.gameName].count += 1
			}
			if (tx.donatName && tx.donatName !== '-') {
				if (!donatStats[tx.donatName])
					donatStats[tx.donatName] = { total: 0, count: 0 }
				donatStats[tx.donatName].total += absPrice
				donatStats[tx.donatName].count += 1
			}
			if (!donorStats[tx.userId]) donorStats[tx.userId] = { total: 0, count: 0 }
			donorStats[tx.userId].total += absPrice
			donorStats[tx.userId].count += 1
		})
		const uniqueDonors = new Set(donations.map(tx => tx.userId)).size
		const avgDonation =
			donations.length > 0 ? totalAmount / donations.length : 0

		const sortEntries = (obj: Record<string, IStatsItem>) =>
			Object.entries(obj).sort((a, b) => b[1].total - a[1].total)
		return {
			totalAmount,
			uniqueDonors,
			avgDonation,
			gameStats: sortEntries(gameStats),
			donatStats: sortEntries(donatStats),
			donorStats: sortEntries(donorStats),
		}
	}, [donations])

	const statusCounts = useMemo(() => {
		const counts: Record<string, number> = {
			Completed: 0,
			'In progress': 0,
			Pending: 0,
			Partial: 0,
			Canceled: 0,
			Refunded: 0,
		}
		let loaded = 0

		Object.values(statuses).forEach(s => {
			if (s !== 'loading' && s !== 'error' && counts[s] !== undefined) {
				counts[s]++
				loaded++
			} else if (s === 'error') {
				loaded++
			}
		})

		const total = loaded
		const successRate = total > 0 ? (counts.Completed / total) * 100 : 0

		return {
			counts,
			total,
			successRate,
			loading: Object.values(statuses).some(s => s === 'loading'),
		}
	}, [statuses])

	const sortedDonations = useMemo(() => {
		return [...donations].sort((a, b) => {
			const dateA = new Date(
				a.year,
				a.month - 1,
				a.day,
				a.hour,
				a.minute,
			).getTime()
			const dateB = new Date(
				b.year,
				b.month - 1,
				b.day,
				b.hour,
				b.minute,
			).getTime()
			return dateB - dateA
		})
	}, [donations])
	const filteredDonations = useMemo(() => {
		if (statusFilter === 'all') return sortedDonations
		return sortedDonations.filter(tx => statuses[tx.id] === statusFilter)
	}, [sortedDonations, statuses, statusFilter])
	const visibleDonations = showAllDonations
		? filteredDonations
		: filteredDonations.slice(0, 10)

	if (donations.length === 0) {
		return <NoData />
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
			<Stack
				sx={{
					display: 'grid',
					gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
					gap: 1.5,
				}}
			>
				<SummaryCard
					icon={<VolunteerActivismIcon sx={{ fontSize: 20 }} />}
					label={t.total_donations}
					value={String(donations.length)}
					subLabel={formatCurrency(stats.totalAmount)}
					gradient='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
				/>
				<SummaryCard
					icon={<PeopleIcon sx={{ fontSize: 20 }} />}
					label={t.unique_donors}
					value={String(stats.uniqueDonors)}
					gradient='linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
				/>
				<SummaryCard
					icon={<TrendingUpIcon sx={{ fontSize: 20 }} />}
					label={t.avg_donation}
					value={formatCurrency(stats.avgDonation)}
					gradient='linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
				/>
				<SummaryCard
					icon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
					label={t.success_rate}
					value={
						statusCounts.loading
							? '...'
							: `${statusCounts.successRate.toFixed(0)}%`
					}
					subLabel={
						statusCounts.loading
							? t.status_loading
							: `${statusCounts.counts.Completed}/${statusCounts.total}`
					}
					gradient='linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
				/>
			</Stack>
			<Card elevation={1} sx={{ borderRadius: 3 }}>
				<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
					<Stack
						direction='row'
						alignItems='center'
						justifyContent='space-between'
						mb={2}
					>
						<Stack direction='row' alignItems='center' spacing={1}>
							<BarChartIcon color='primary' sx={{ fontSize: 24 }} />
							<Typography variant='subtitle1' fontWeight={600}>
								{t.order_statuses}
							</Typography>
						</Stack>
						<Tooltip title={t.check_status}>
							<IconButton
								size='small'
								onClick={handleRefreshStatuses}
								disabled={statusCounts.loading}
							>
								{statusCounts.loading ? (
									<CircularProgress size={18} />
								) : (
									<RefreshIcon sx={{ fontSize: 20 }} />
								)}
							</IconButton>
						</Tooltip>
					</Stack>

					{statusCounts.loading && (
						<LinearProgress sx={{ mb: 2, borderRadius: 2 }} />
					)}

					<StatusBar
						label={t.Completed}
						count={statusCounts.counts.Completed}
						total={statusCounts.total}
						color='#2ecc71'
						icon={<CheckCircleIcon sx={{ fontSize: 16, color: '#2ecc71' }} />}
					/>
					<StatusBar
						label={t.in_progress}
						count={statusCounts.counts['In progress']}
						total={statusCounts.total}
						color='#3498db'
						icon={<HourglassTopIcon sx={{ fontSize: 16, color: '#3498db' }} />}
					/>
					<StatusBar
						label={t.pending}
						count={statusCounts.counts.Pending}
						total={statusCounts.total}
						color='#f39c12'
						icon={<HourglassTopIcon sx={{ fontSize: 16, color: '#f39c12' }} />}
					/>
					<StatusBar
						label={t.partial}
						count={statusCounts.counts.Partial}
						total={statusCounts.total}
						color='#9b59b6'
						icon={<PieChartIcon sx={{ fontSize: 16, color: '#9b59b6' }} />}
					/>
					<StatusBar
						label={t.canceled}
						count={statusCounts.counts.Canceled}
						total={statusCounts.total}
						color='#e74c3c'
						icon={<CancelIcon sx={{ fontSize: 16, color: '#e74c3c' }} />}
					/>
					<StatusBar
						label={t.Refunded}
						count={statusCounts.counts.Refunded}
						total={statusCounts.total}
						color='#e67e22'
						icon={<ReplayIcon sx={{ fontSize: 16, color: '#e67e22' }} />}
					/>
				</CardContent>
			</Card>
			<Card elevation={1} sx={{ borderRadius: 3 }}>
				<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
					<Stack direction='row' alignItems='center' spacing={1} mb={2}>
						<SportsEsportsIcon color='primary' sx={{ fontSize: 24 }} />
						<Typography variant='subtitle1' fontWeight={600}>
							{t.donations_by_game}
						</Typography>
						<Chip
							label={stats.gameStats.length}
							size='small'
							color='primary'
							variant='outlined'
						/>
					</Stack>
					{stats.gameStats.length === 0 ? (
						<Typography
							color='text.secondary'
							align='center'
							py={2}
							variant='body2'
						>
							{t.no_data}
						</Typography>
					) : (
						stats.gameStats.map(([game, s]) => (
							<GameStatsRow
								key={game}
								name={game}
								stats={s}
								totalForPercent={stats.totalAmount}
								color='primary.main'
							/>
						))
					)}
					<Divider sx={{ my: 1 }} />
					<Stack
						direction='row'
						justifyContent='space-between'
						alignItems='center'
					>
						<Typography variant='body2' fontWeight={600} color='text.secondary'>
							{t.donation_amount}:
						</Typography>
						<Typography variant='body2' fontWeight={700} color='primary.main'>
							{formatCurrency(stats.totalAmount)}
						</Typography>
					</Stack>
				</CardContent>
			</Card>
			<Card elevation={1} sx={{ borderRadius: 3 }}>
				<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
					<Stack direction='row' alignItems='center' spacing={1} mb={2}>
						<CardGiftcardIcon color='secondary' sx={{ fontSize: 24 }} />
						<Typography variant='subtitle1' fontWeight={600}>
							{t.donations_by_product}
						</Typography>
						<Chip
							label={stats.donatStats.length}
							size='small'
							color='secondary'
							variant='outlined'
						/>
					</Stack>
					{stats.donatStats.length === 0 ? (
						<Typography
							color='text.secondary'
							align='center'
							py={2}
							variant='body2'
						>
							{t.no_data}
						</Typography>
					) : (
						<>
							{(showAllDonatStats
								? stats.donatStats
								: stats.donatStats.slice(0, 10)
							).map(([donat, s]) => (
								<GameStatsRow
									key={donat}
									name={donat}
									stats={s}
									totalForPercent={stats.totalAmount}
									color='secondary.main'
								/>
							))}
							{stats.donatStats.length > 10 && (
								<Button
									size='small'
									fullWidth
									onClick={() => setShowAllDonatStats(v => !v)}
									endIcon={showAllDonatStats ? <ExpandLessIcon /> : <ExpandMoreIcon />}
									sx={{ mt: 0.5, textTransform: 'none' }}
								>
									{showAllDonatStats
										? t.show_less
										: `${t.show_all} (${stats.donatStats.length - 10})`}
								</Button>
							)}
						</>
					)}
				</CardContent>
			</Card>
			<Card elevation={1} sx={{ borderRadius: 3 }}>
				<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
					<Stack direction='row' alignItems='center' spacing={1} mb={2}>
						<EmojiEventsIcon sx={{ fontSize: 24, color: '#f39c12' }} />
						<Typography variant='subtitle1' fontWeight={600}>
							{t.top_donors}
						</Typography>
						<Chip
							label={stats.donorStats.length}
							size='small'
							color='warning'
							variant='outlined'
						/>
					</Stack>
					{stats.donorStats.slice(0, 10).map(([userId, s], index) => (
						<Box
							key={userId}
							sx={{
								mb: 1.5,
								cursor: 'pointer',
							}}
							onClick={() => navigate(`/users/${userId}`)}
						>
							<Stack
								direction='row'
								justifyContent='space-between'
								alignItems='center'
								mb={0.3}
							>
								<Stack direction='row' alignItems='center' spacing={1}>
									<Chip
										label={`#${index + 1}`}
										size='small'
										sx={{
											fontWeight: 700,
											fontSize: 11,
											height: 22,
											bgcolor:
												index === 0
													? '#f39c12'
													: index === 1
														? '#bdc3c7'
														: index === 2
															? '#cd7f32'
															: alpha('#000', 0.06),
											color: index < 3 ? 'white' : 'text.primary',
										}}
									/>
									<Typography
										variant='body2'
										fontWeight={500}
										noWrap
										sx={{ maxWidth: 140 }}
									>
										{userId.slice(0, 8)}...
									</Typography>
								</Stack>
								<Stack direction='row' alignItems='center' spacing={1}>
									<Chip
										label={`${s.count} ${t.units}`}
										size='small'
										variant='outlined'
										sx={{ height: 22 }}
									/>
									<Typography
										variant='body2'
										fontWeight={700}
										color='warning.main'
									>
										{formatCurrency(s.total)}
									</Typography>
								</Stack>
							</Stack>
							<LinearProgress
								variant='determinate'
								value={Math.min((s.total / stats.totalAmount) * 100, 100)}
								color='warning'
								sx={{
									height: 4,
									borderRadius: 2,
									bgcolor: alpha('#000', 0.06),
								}}
							/>
						</Box>
					))}
				</CardContent>
			</Card>
			<Card elevation={1} sx={{ borderRadius: 3 }}>
				<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
					<Stack
						direction='row'
						alignItems='center'
						justifyContent='space-between'
						mb={2}
						flexWrap='wrap'
						gap={1}
					>
						<Stack direction='row' alignItems='center' spacing={1}>
							<ReceiptLongIcon color='info' sx={{ fontSize: 24 }} />
							<Typography variant='subtitle1' fontWeight={600}>
								{t.recent_donations}
							</Typography>
							<Chip
								label={filteredDonations.length}
								size='small'
								color='info'
								variant='outlined'
							/>
						</Stack>

						<ButtonGroup
							variant='outlined'
							size='small'
							aria-label='status filter'
						>
							<Button
								color={statusFilter === 'all' ? 'primary' : 'inherit'}
								onClick={() => setStatusFilter('all')}
								sx={{ textTransform: 'none' }}
							>
								{t.all_statuses}
							</Button>
							<Button
								color={statusFilter === 'Completed' ? 'success' : 'inherit'}
								onClick={() => setStatusFilter('Completed')}
							>
								{t.finished}
							</Button>
							<Button
								color={statusFilter === 'Refunded' ? 'success' : 'inherit'}
								onClick={() => setStatusFilter('Refunded')}
							>
								{t.Refunded}
							</Button>

							<Button
								color={statusFilter === 'In progress' ? 'primary' : 'inherit'}
								onClick={() => setStatusFilter('In progress')}
							>
								{t.in_progress}
							</Button>
							<Button
								color={statusFilter === 'Pending' ? 'warning' : 'inherit'}
								onClick={() => setStatusFilter('Pending')}
							>
								{t.pending}
							</Button>
							<Button
								color={statusFilter === 'Canceled' ? 'error' : 'inherit'}
								onClick={() => setStatusFilter('Canceled')}
							>
								{t.canceled}
							</Button>
						</ButtonGroup>
					</Stack>

					{visibleDonations.map((tx, i) => {
						const txStatus = statuses[tx.id]
						return (
							<Box key={tx.id}>
								{i > 0 && <Divider sx={{ my: 1 }} />}
								<Stack
									direction='row'
									justifyContent='space-between'
									alignItems='flex-start'
									sx={{
										cursor: 'pointer',
									}}
									onClick={() => navigate(`/users/${tx.userId}`)}
								>
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Stack
											direction='row'
											alignItems='center'
											spacing={0.5}
											mb={0.3}
										>
											<Typography variant='body2' fontWeight={600} noWrap>
												{tx.gameName}
											</Typography>
											<Typography variant='caption' color='text.secondary'>
												·
											</Typography>
											<Typography
												variant='caption'
												color='text.secondary'
												noWrap
											>
												{tx.donatName}
											</Typography>
										</Stack>
										<Stack direction='row' alignItems='center' spacing={0.5}>
											<Typography variant='caption' color='text.secondary'>
												{String(tx.day).padStart(2, '0')}.
												{String(tx.month).padStart(2, '0')}.{tx.year}{' '}
												{String(tx.hour).padStart(2, '0')}:
												{String(tx.minute).padStart(2, '0')}
											</Typography>
											<Typography variant='caption' color='text.secondary'>
												· {tx.order.slice(0, 10)}...
											</Typography>
										</Stack>
									</Box>

									<Stack alignItems='flex-end' spacing={0.3}>
										<Typography
											variant='body2'
											fontWeight={700}
											color='error.main'
										>
											{formatCurrency(tx.price)}
										</Typography>

										{txStatus === 'loading' ? (
											<CircularProgress size={14} />
										) : txStatus === 'error' ? (
											<Chip
												label={t.status_error}
												size='small'
												sx={{
													height: 20,
													fontSize: 10,
													bgcolor: alpha('#e74c3c', 0.1),
													color: '#e74c3c',
												}}
											/>
										) : txStatus ? (
											<Chip
												icon={getStatusIcon(txStatus)}
												label={getStatusLabel(txStatus, t)}
												size='small'
												sx={{
													height: 22,
													fontSize: 11,
													bgcolor: alpha(getStatusColor(txStatus), 0.12),
													color: getStatusColor(txStatus),
													fontWeight: 600,
													'& .MuiChip-icon': { ml: '4px' },
												}}
											/>
										) : null}
									</Stack>
								</Stack>
							</Box>
						)
					})}

					{filteredDonations.length > 10 && (
						<Box
							sx={{ textAlign: 'center', mt: 1.5, cursor: 'pointer' }}
							onClick={() => setShowAllDonations(!showAllDonations)}
						>
							<Stack
								direction='row'
								alignItems='center'
								justifyContent='center'
								spacing={0.5}
							>
								<Typography variant='body2' color='primary' fontWeight={600}>
									{showAllDonations
										? t.overview
										: `${t.more} (${filteredDonations.length - 10})`}
								</Typography>
								{showAllDonations ? (
									<ExpandLessIcon color='primary' fontSize='small' />
								) : (
									<ExpandMoreIcon color='primary' fontSize='small' />
								)}
							</Stack>
						</Box>
					)}

					{filteredDonations.length === 0 && statusFilter !== 'all' && (
						<Typography color='text.secondary' align='center' py={3}>
							Нет донатов со статусом «{getStatusLabel(statusFilter, t)}»
						</Typography>
					)}
				</CardContent>
			</Card>
			<Stack
				sx={{
					display: 'grid',
					gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
					gap: 1,
					mb: 2,
				}}
			>
				<Chip
					icon={<ReceiptLongIcon />}
					label={`${t.total}: ${donations.length}`}
					variant='outlined'
					size='small'
				/>
				<Chip
					icon={<PeopleIcon />}
					label={`${stats.uniqueDonors} ${t.clients}`}
					variant='outlined'
					size='small'
					color='secondary'
				/>
				<Chip
					icon={<SportsEsportsIcon />}
					label={`${stats.gameStats.length} ${t.by_games}`}
					variant='outlined'
					size='small'
					color='primary'
				/>
			</Stack>
		</Box>
	)
}

export default DonationStatistic
