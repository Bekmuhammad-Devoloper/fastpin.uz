import { useMemo, useState } from 'react'
import {
	Box,
	Typography,
	Card,
	CardContent,
	Divider,
	Chip,
	Stack,
	alpha,
	ToggleButton,
	ToggleButtonGroup,
	LinearProgress,
	Button,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PaymentIcon from '@mui/icons-material/Payment'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PeopleIcon from '@mui/icons-material/People'
import { useNavigate } from 'react-router-dom'

import type { ITransactions } from '../../types/transactions/transactions'
import { useTranslationStore } from '../../store/language/useTranslationStore'

interface IStatsItem {
	total: number
	count: number
}

interface IAdminUserItem {
	userId: string
	total: number
	count: number
}

type TabValue = 'overview' | 'purchases' | 'topups'

function formatCurrency(num: number): string {
	return Math.abs(num).toLocaleString('ru-RU') + ' сум'
}

function getProgressColor(
	percent: number,
): 'success' | 'info' | 'warning' | 'error' {
	if (percent >= 30) return 'error'
	if (percent >= 20) return 'warning'
	if (percent >= 10) return 'info'
	return 'success'
}

const SummaryCard = ({
	icon,
	label,
	amount,
	count,
	gradient,
	subLabel,
}: {
	icon: React.ReactNode
	label: string
	amount: number
	count: number
	gradient: string
	subLabel?: string
}) => (
	<Card
		elevation={3}
		sx={{
			flex: 1,
			minWidth: 140,
			borderRadius: 3,
			background: gradient,
			color: 'white',
		}}
	>
		<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
			<Stack direction='row' alignItems='center' spacing={1} mb={1}>
				{icon}
				<Typography variant='caption' fontWeight={600} sx={{ opacity: 0.9 }}>
					{label}
				</Typography>
			</Stack>
			<Typography variant='h6' fontWeight={700} lineHeight={1.2}>
				{formatCurrency(amount)}
			</Typography>
			<Typography variant='caption' sx={{ opacity: 0.8 }}>
				{count} operatsiya {subLabel ? ` • ${subLabel}` : ''}
			</Typography>
		</CardContent>
	</Card>
)

const StatsRow = ({
	name,
	stats,
	totalForPercent,
	color,
}: {
	name: string
	stats: IStatsItem
	totalForPercent: number
	color: string
}) => {
	const percent =
		totalForPercent > 0 ? (Math.abs(stats.total) / totalForPercent) * 100 : 0
	return (
		<Box sx={{ mb: 1.5 }}>
			<Stack
				direction='row'
				justifyContent='space-between'
				alignItems='center'
				mb={0.3}
			>
				<Typography variant='body2' fontWeight={500} noWrap sx={{ flex: 1 }}>
					{name}
				</Typography>
				<Typography variant='body2' fontWeight={700} color={color} ml={1}>
					{formatCurrency(stats.total)}
				</Typography>
			</Stack>
			<Stack direction='row' alignItems='center' spacing={1}>
				<LinearProgress
					variant='determinate'
					value={Math.min(percent, 100)}
					color={getProgressColor(percent)}
					sx={{
						flex: 1,
						height: 6,
						borderRadius: 3,
						bgcolor: alpha('#000', 0.06),
					}}
				/>
				<Typography
					variant='caption'
					color='text.secondary'
					sx={{ minWidth: 60, textAlign: 'right' }}
				>
					{stats.count} ta · {percent.toFixed(1)}%
				</Typography>
			</Stack>
		</Box>
	)
}

const SHOW_LIMIT = 10

const GameStatistics = ({ data }: { data: ITransactions[] | undefined }) => {
	const navigate = useNavigate()
	const [tab, setTab] = useState<TabValue>('overview')
	const [showAllDonats, setShowAllDonats] = useState(false)
	const [showAllGames, setShowAllGames] = useState(false)
	const [showAdminUsers, setShowAdminUsers] = useState(false)

	const stats = useMemo(() => {
		const purchases: ITransactions[] = []
		const adminTopups: ITransactions[] = []
		const paymentTopups: ITransactions[] = []

		;(data ?? []).forEach(tx => {
			if (tx.price < 0) {
				purchases.push(tx)
			} else if (tx.price > 0) {
				if (tx.createdBy === 'admin') {
					adminTopups.push(tx)
				} else {
					paymentTopups.push(tx)
				}
			}
		})

		let purchaseTotal = 0
		const gameStats: Record<string, IStatsItem> = {}
		const donatStats: Record<string, IStatsItem> = {}

		purchases.forEach(tx => {
			const absPrice = Math.abs(tx.price)
			purchaseTotal += absPrice

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
		})

		let adminTotal = 0
		const adminUserMap: Record<string, IAdminUserItem> = {}
		adminTopups.forEach(tx => {
			adminTotal += tx.price
			if (!adminUserMap[tx.userId])
				adminUserMap[tx.userId] = { userId: tx.userId, total: 0, count: 0 }
			adminUserMap[tx.userId].total += tx.price
			adminUserMap[tx.userId].count += 1
		})
		const adminUserStats = Object.values(adminUserMap).sort(
			(a, b) => b.total - a.total,
		)

		let paymentTotal = 0
		const paymentSources: Record<string, IStatsItem> = {}
		paymentTopups.forEach(tx => {
			paymentTotal += tx.price
			const source = tx.createdBy || 'Неизвестно'
			if (!paymentSources[source])
				paymentSources[source] = { total: 0, count: 0 }
			paymentSources[source].total += tx.price
			paymentSources[source].count += 1
		})

		const uniqueBuyers = new Set(purchases.map(tx => tx.userId)).size
		const uniqueTopupUsers = new Set(
			[...adminTopups, ...paymentTopups].map(tx => tx.userId),
		).size

		const sortEntries = (obj: Record<string, IStatsItem>) =>
			Object.entries(obj).sort((a, b) => b[1].total - a[1].total)

		return {
			purchases,
			adminTopups,
			paymentTopups,
			purchaseTotal,
			adminTotal,
			paymentTotal,
			topupTotal: adminTotal + paymentTotal,
			gameStats: sortEntries(gameStats),
			donatStats: sortEntries(donatStats),
			paymentSources: sortEntries(paymentSources),
			adminUserStats,
			uniqueBuyers,
			uniqueTopupUsers,
		}
	}, [data])

	const netBalance = stats.topupTotal - stats.purchaseTotal
	const { t } = useTranslationStore()
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
			<Card
				elevation={0}
				sx={{
					borderRadius: 3,
					border: '1px solid',
					bgcolor: alpha(netBalance >= 0 ? '#2ecc71' : '#f39c12', 0.06),
				}}
			>
				<CardContent
					sx={{
						py: 1.5,
						px: 2,
						'&:last-child': { pb: 1.5 },
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Typography variant='body2' color='text.secondary'>
						{t.net_profit}
					</Typography>
					<Typography variant='h6' fontWeight={700}>
						{netBalance >= 0 ? '+' : '−'}
						{formatCurrency(netBalance)}
					</Typography>
				</CardContent>
			</Card>
			<Stack
				sx={{
					overflowX: 'auto',
					pb: 1,
					display: 'flex',
					flexDirection: { xs: 'column', sm: 'row' },
					gap: 1.5,
				}}
			>
				<SummaryCard
					icon={<ShoppingCartIcon sx={{ fontSize: 20 }} />}
					label={t.purchases}
					amount={stats.purchaseTotal}
					count={stats.purchases.length}
					gradient='linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
					subLabel={`${stats.uniqueBuyers} ${t.clients}`}
				/>
				<SummaryCard
					icon={<AccountBalanceWalletIcon sx={{ fontSize: 20 }} />}
					label={t.deposits}
					amount={stats.topupTotal}
					count={stats.adminTopups.length + stats.paymentTopups.length}
					gradient='linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
					subLabel={`${stats.uniqueTopupUsers} ${t.clients}`}
				/>
			</Stack>

			<ToggleButtonGroup
				value={tab}
				exclusive
				onChange={(_, v) => v && setTab(v)}
				size='small'
				fullWidth
				sx={{
					'& .MuiToggleButton-root': {
						textTransform: 'none',
						fontWeight: 600,
						borderRadius: '12px !important',
						border: 'none',
						mx: 0.5,
						'&.Mui-selected': {
							bgcolor: 'primary.main',
							color: 'white',
							'&:hover': { bgcolor: 'primary.dark' },
						},
					},
				}}
			>
				<ToggleButton value='overview'>{t.overview}</ToggleButton>
				<ToggleButton value='purchases'>
					{t.purchases} ({stats.purchases.length})
				</ToggleButton>
				<ToggleButton value='topups'>
					{t.deposits} ({stats.adminTopups.length + stats.paymentTopups.length})
				</ToggleButton>
			</ToggleButtonGroup>

			{tab === 'overview' && (
				<>
					<Stack
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
							gap: 1,
						}}
					>
						<Chip
							icon={<ReceiptLongIcon />}
							label={`${t.total}: ${data?.length ?? 0} ${t.operations}`}
							variant='outlined'
							size='small'
						/>
						<Chip
							icon={<PeopleIcon />}
							label={`${stats.uniqueBuyers} ${t.buyers}`}
							variant='outlined'
							size='small'
							color='error'
						/>
						<Chip
							icon={<AdminPanelSettingsIcon />}
							label={`ADMIN: ${stats.adminTopups.length}`}
							variant='outlined'
							size='small'
							color='warning'
						/>
						<Chip
							icon={<PaymentIcon />}
							label={`${t.payments}: ${stats.paymentTopups.length}`}
							variant='outlined'
							size='small'
							color='primary'
						/>
					</Stack>

					<Card elevation={1} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
							<Stack direction='row' alignItems='center' spacing={1} mb={2}>
								<SportsEsportsIcon color='primary' sx={{ fontSize: 24 }} />
								<Typography variant='subtitle1' fontWeight={600}>
									{t.top_selling_games}
								</Typography>
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
								stats.gameStats
									.slice(0, 5)
									.map(([game, s]) => (
										<StatsRow
											key={game}
											name={game}
											stats={s}
											totalForPercent={stats.purchaseTotal}
											color='error.main'
										/>
									))
							)}
						</CardContent>
					</Card>

					<Card elevation={1} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
							<Stack direction='row' alignItems='center' spacing={1} mb={2}>
								<CardGiftcardIcon color='secondary' sx={{ fontSize: 24 }} />
								<Typography variant='subtitle1' fontWeight={600}>
									{t.top_selling_donations}
								</Typography>
							</Stack>
							{stats.donatStats.length === 0 ? (
								<Typography
									color='text.secondary'
									align='center'
									py={2}
									variant='body2'
								>
									Нет данных
								</Typography>
							) : (
								stats.donatStats
									.slice(0, 5)
									.map(([donat, s]) => (
										<StatsRow
											key={donat}
											name={donat}
											stats={s}
											totalForPercent={stats.purchaseTotal}
											color='secondary.main'
										/>
									))
							)}
						</CardContent>
					</Card>
				</>
			)}

			{tab === 'purchases' && (
				<>
					<Card elevation={1} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
							<Stack direction='row' alignItems='center' spacing={1} mb={2}>
								<SportsEsportsIcon color='primary' sx={{ fontSize: 24 }} />
								<Typography variant='subtitle1' fontWeight={600}>
									{t.by_games}
								</Typography>
								<Chip
									label={`${stats.gameStats.length}`}
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
									Нет покупок
								</Typography>
							) : (
								<>
									{(showAllGames
										? stats.gameStats
										: stats.gameStats.slice(0, SHOW_LIMIT)
									).map(([game, s]) => (
										<StatsRow
											key={game}
											name={game}
											stats={s}
											totalForPercent={stats.purchaseTotal}
											color='error.main'
										/>
									))}
									{stats.gameStats.length > SHOW_LIMIT && (
										<Button
											size='small'
											fullWidth
											onClick={() => setShowAllGames(v => !v)}
											endIcon={
												showAllGames ? <ExpandLessIcon /> : <ExpandMoreIcon />
											}
											sx={{ mt: 0.5, textTransform: 'none' }}
										>
											{showAllGames
												? t.show_less
												: `${t.show_all} (${stats.gameStats.length - SHOW_LIMIT})`}
										</Button>
									)}
								</>
							)}
							<Divider sx={{ my: 1 }} />
							<Stack
								direction='row'
								justifyContent='space-between'
								alignItems='center'
							>
								<Typography
									variant='body2'
									fontWeight={600}
									color='text.secondary'
								>
									{t.total_purchases}:
								</Typography>
								<Typography variant='body2' fontWeight={700} color='error.main'>
									{formatCurrency(stats.purchaseTotal)}
								</Typography>
							</Stack>
						</CardContent>
					</Card>

					<Card elevation={1} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
							<Stack direction='row' alignItems='center' spacing={1} mb={2}>
								<CardGiftcardIcon color='secondary' sx={{ fontSize: 24 }} />
								<Typography variant='subtitle1' fontWeight={600}>
									{t.by_donations}
								</Typography>
								<Chip
									label={`${stats.donatStats.length}`}
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
									Нет покупок
								</Typography>
							) : (
								<>
									{(showAllDonats
										? stats.donatStats
										: stats.donatStats.slice(0, SHOW_LIMIT)
									).map(([donat, s]) => (
										<StatsRow
											key={donat}
											name={donat}
											stats={s}
											totalForPercent={stats.purchaseTotal}
											color='secondary.main'
										/>
									))}
									{stats.donatStats.length > SHOW_LIMIT && (
										<Button
											size='small'
											fullWidth
											onClick={() => setShowAllDonats(v => !v)}
											endIcon={
												showAllDonats ? <ExpandLessIcon /> : <ExpandMoreIcon />
											}
											sx={{ mt: 0.5, textTransform: 'none' }}
										>
											{showAllDonats
												? t.show_less
												: `${t.show_all} (${stats.donatStats.length - SHOW_LIMIT})`}
										</Button>
									)}
								</>
							)}
							<Divider sx={{ my: 1 }} />
							<Stack
								direction='row'
								justifyContent='space-between'
								alignItems='center'
							>
								<Typography
									variant='body2'
									fontWeight={600}
									color='text.secondary'
								>
									{t.total_purchases}:
								</Typography>
								<Typography variant='body2' fontWeight={700} color='error.main'>
									{formatCurrency(stats.purchaseTotal)}
								</Typography>
							</Stack>
						</CardContent>
					</Card>
				</>
			)}

			{tab === 'topups' && (
				<>
					<Card elevation={1} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
							<Stack direction='row' alignItems='center' spacing={1} mb={2}>
								<AdminPanelSettingsIcon color='info' sx={{ fontSize: 24 }} />
								<Typography variant='subtitle1' fontWeight={600}>
									{t.admin_deposits}
								</Typography>
								<Chip
									label={formatCurrency(stats.adminTotal)}
									size='small'
									color='info'
								/>
							</Stack>
							<Stack
								direction='row'
								justifyContent='space-between'
								alignItems='center'
							>
								<Typography variant='body2' color='text.secondary'>
									{t.operations_count}
								</Typography>
								<Typography variant='body2' fontWeight={600}>
									{stats.adminTopups.length}
								</Typography>
							</Stack>
							{stats.adminTopups.length > 0 && (
								<>
									<Divider sx={{ my: 1 }} />
									<Stack
										direction='row'
										justifyContent='space-between'
										alignItems='center'
									>
										<Typography variant='body2' color='text.secondary'>
											{t.average_amount}
										</Typography>
										<Typography variant='body2' fontWeight={600}>
											{formatCurrency(
												stats.adminTotal / stats.adminTopups.length,
											)}
										</Typography>
									</Stack>
									<Divider sx={{ my: 1 }} />
									{(showAdminUsers
										? stats.adminUserStats
										: stats.adminUserStats.slice(0, SHOW_LIMIT)
									).map(item => (
										<Box
											key={item.userId}
											onClick={() => navigate(`/users/${item.userId}`)}
											sx={{
												cursor: 'pointer',
												borderRadius: 1,
												'&:hover': { bgcolor: alpha('#000', 0.04) },
											}}
										>
											<StatsRow
												name={item.userId}
												stats={{ total: item.total, count: item.count }}
												totalForPercent={stats.adminTotal}
												color='info.main'
											/>
										</Box>
									))}
									{stats.adminUserStats.length > SHOW_LIMIT && (
										<Button
											size='small'
											fullWidth
											onClick={() => setShowAdminUsers(v => !v)}
											endIcon={
												showAdminUsers ? <ExpandLessIcon /> : <ExpandMoreIcon />
											}
											sx={{ mt: 0.5, textTransform: 'none' }}
										>
											{showAdminUsers
												? t.show_less
												: `${t.show_all} (${stats.adminUserStats.length - SHOW_LIMIT})`}
										</Button>
									)}
								</>
							)}
						</CardContent>
					</Card>

					<Card elevation={1} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
							<Stack direction='row' alignItems='center' spacing={1} mb={2}>
								<PaymentIcon color='success' sx={{ fontSize: 24 }} />
								<Typography variant='subtitle1' fontWeight={600}>
									{t.payment_system_deposits}
								</Typography>
								<Chip
									label={formatCurrency(stats.paymentTotal)}
									size='small'
									color='success'
								/>
							</Stack>
							{stats.paymentSources.length === 0 ? (
								<Typography
									color='text.secondary'
									align='center'
									py={2}
									variant='body2'
								>
									{t.no_deposits}
								</Typography>
							) : (
								stats.paymentSources.map(([source, s]) => (
									<StatsRow
										key={source}
										name={source}
										stats={s}
										totalForPercent={stats.paymentTotal}
										color='success.main'
									/>
								))
							)}
							{stats.paymentSources.length > 0 && (
								<>
									<Divider sx={{ my: 1 }} />
									<Stack
										direction='row'
										justifyContent='space-between'
										alignItems='center'
									>
										<Typography variant='body2' color='text.secondary'>
											{t.average_amount}
										</Typography>
										<Typography
											variant='body2'
											fontWeight={600}
											color='success.main'
										>
											{formatCurrency(
												stats.paymentTotal / stats.paymentTopups.length,
											)}
										</Typography>
									</Stack>
								</>
							)}
						</CardContent>
					</Card>

					<Card
						elevation={0}
						sx={{
							borderRadius: 3,
							bgcolor: alpha('#000', 0.06),
						}}
					>
						<CardContent
							sx={{
								py: 1.5,
								px: 2,
								'&:last-child': { pb: 1.5 },
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<Typography variant='body2' fontWeight={600}>
								{t.total_deposits}:
							</Typography>
							<Typography variant='h6' fontWeight={700}>
								{formatCurrency(stats.topupTotal)}
							</Typography>
						</CardContent>
					</Card>
				</>
			)}
		</Box>
	)
}

export default GameStatistics
