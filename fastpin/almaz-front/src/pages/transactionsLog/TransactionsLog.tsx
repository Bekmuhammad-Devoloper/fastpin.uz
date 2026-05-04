import { useState, useMemo } from 'react'
import {
	Box,
	Typography,
	TextField,
	Stack,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Button,
	useTheme,
	Paper,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import Header from '../../components/Header/Header'
import BottomNavigate from '../home/BottomNavigate'
import LoadingProgress from '../../components/Loading/LoadingProgress'
import { useQuery } from '@tanstack/react-query'
import { useTokenStore } from '../../store/token/useTokenStore'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { getTransactionsByPeriod } from '../../api/transactions/transactions'
import type { ITransactions, ITransactionsPaginated } from '../../types/transactions/transactions'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import DataPicker from '../../components/data/DataPicker'
import { updateNumberFormat } from '../../func/number'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridCellParams } from '@mui/x-data-grid'

interface FilterState {
	userId: string
	price: string
	status: string
	game: string
}

const EMPTY_FILTER: FilterState = {
	userId: '',
	price: '',
	status: 'all',
	game: 'all',
}

const TransactionsLog = () => {
	const { token } = useTokenStore()
	const { t } = useTranslationStore()
	const theme = useTheme()
	const navigate = useNavigate()

	const today = dayjs()

	const [start, setStart] = useState({
		startDay: today.date(),
		startMonth: today.month() + 1,
		startYear: today.year(),
	})
	const [end, setEnd] = useState({
		endDay: today.date(),
		endMonth: today.month() + 1,
		endYear: today.year(),
	})

	const [draft, setDraft] = useState<FilterState>(EMPTY_FILTER)
	const [applied, setApplied] = useState<FilterState>(EMPTY_FILTER)

	const { data, isLoading } = useQuery<ITransactionsPaginated, Error>({
		queryKey: ['transactionsLog', token, start, end],
		queryFn: async () =>
			(await getTransactionsByPeriod({
				token,
				startDay: start.startDay,
				startMonth: start.startMonth,
				startYear: start.startYear,
				endDay: end.endDay,
				endMonth: end.endMonth,
				endYear: end.endYear,
			})) ?? { data: [] },
		enabled: !!token,
	})

	const allTx: ITransactions[] = useMemo(() => data?.data ?? [], [data])

	const uniqueGames = useMemo(() => {
		const games = new Set(allTx.map(tx => tx.gameName).filter(g => g && g !== '-'))
		return Array.from(games).sort()
	}, [allTx])

	const filtered = useMemo(() => {
		const { userId, price, status, game } = applied
		let result = allTx
		if (status !== 'all') result = result.filter(tx => tx.status === status)
		if (game !== 'all') result = result.filter(tx => tx.gameName === game)
		if (userId) result = result.filter(tx => tx.userId?.toLowerCase().includes(userId.toLowerCase()))
		if (price) {
			const priceNum = Math.abs(Number(price))
			if (!isNaN(priceNum) && priceNum > 0) {
				result = result.filter(tx => Math.abs(tx.price) === priceNum)
			}
		}
		return [...result].sort((a, b) => {
			if (a.year !== b.year) return b.year - a.year
			if (a.month !== b.month) return b.month - a.month
			if (a.day !== b.day) return b.day - a.day
			if (a.hour !== b.hour) return b.hour - a.hour
			return b.minute - a.minute
		})
	}, [allTx, applied])

	const tableRows = useMemo(() =>
		filtered.map(tx => ({
			...tx,
			_date: `${String(tx.day).padStart(2, '0')}.${String(tx.month).padStart(2, '0')}.${tx.year}`,
			_time: `${String(tx.hour).padStart(2, '0')}:${String(tx.minute).padStart(2, '0')}`,
		})),
	[filtered])

	const applySearch = () => setApplied({ ...draft })
	const resetSearch = () => {
		setDraft(EMPTY_FILTER)
		setApplied(EMPTY_FILTER)
	}

	const isFiltered =
		applied.userId || applied.price ||
		applied.status !== 'all' || applied.game !== 'all'

	const glassCard = {
		backgroundColor:
			theme.palette.mode === 'dark'
				? 'rgba(18, 24, 34, 0.7)'
				: 'rgba(255, 255, 255, 0.85)',
		backdropFilter: 'blur(16px)',
		WebkitBackdropFilter: 'blur(16px)',
		border: `1px solid ${
			theme.palette.mode === 'dark'
				? 'rgba(255,255,255,0.06)'
				: 'rgba(0,0,0,0.04)'
		}`,
	}

	const columns: GridColDef[] = [
		{
			field: '_date',
			headerName: 'Дата',
			width: 110,
		},
		{
			field: '_time',
			headerName: 'Время',
			width: 72,
		},
		{
			field: 'userId',
			headerName: 'User ID',
			flex: 1,
			minWidth: 120,
		},
		{
			field: 'price',
			headerName: 'Сумма',
			width: 110,
			renderCell: (params) => (
				<Typography
					variant='body2'
					fontWeight={700}
					color={params.value > 0 ? 'success.main' : 'error.main'}
				>
					{params.value > 0 ? '+' : ''}{updateNumberFormat(params.value)}
				</Typography>
			),
		},
		{ field: 'gameName', headerName: 'Игра', width: 120 },
		{ field: 'donatName', headerName: 'Донат', flex: 1, minWidth: 100 },
		{ field: 'createdBy', headerName: 'От', width: 90 },
		{
			field: 'status',
			headerName: 'Статус',
			width: 100,
			renderCell: (params) =>
				params.value ? (
					<Typography
						variant='caption'
						fontWeight={600}
						color={
							params.value === 'completed' ? 'success.main' :
							params.value === 'failed' ? 'error.main' : 'warning.main'
						}
					>
						{params.value}
					</Typography>
				) : null,
		},
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

			<Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
				<Box sx={{ ...glassCard, borderRadius: 3, p: 2, textAlign: 'center' }}>
					<Typography variant='h5' fontWeight={700} color='primary'>
						{t.transactions_log}
					</Typography>
					<Typography variant='body2' color='text.secondary'>
						{isFiltered ? `${filtered.length} / ${allTx.length}` : allTx.length}
					</Typography>
				</Box>

				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<DataPicker
						start={start}
						setStart={setStart}
						setEnd={setEnd}
						end={end}
					/>
				</LocalizationProvider>

				<Box sx={{ ...glassCard, borderRadius: 3, p: 2 }}>
					<Stack spacing={1.5}>
						<Stack direction='row' spacing={1}>
							<FormControl size='small' sx={{ flex: 1 }}>
								<InputLabel>{t.status}</InputLabel>
								<Select
									value={draft.status}
									label={t.status}
									onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}
								>
									<MenuItem value='all'>{t.all_statuses}</MenuItem>
									<MenuItem value='completed'>{t.Completed}</MenuItem>
									<MenuItem value='pending'>{t.pending}</MenuItem>
									<MenuItem value='failed'>{t.canceled}</MenuItem>
								</Select>
							</FormControl>
							<FormControl size='small' sx={{ flex: 1 }}>
								<InputLabel>{t.game_name}</InputLabel>
								<Select
									value={draft.game}
									label={t.game_name}
									onChange={e => setDraft(d => ({ ...d, game: e.target.value }))}
								>
									<MenuItem value='all'>—</MenuItem>
									{uniqueGames.map(g => (
										<MenuItem key={g} value={g}>{g}</MenuItem>
									))}
								</Select>
							</FormControl>
						</Stack>

						<Stack direction='row' spacing={1}>
							<TextField
								size='small'
								label='User ID'
								value={draft.userId}
								onChange={e => setDraft(d => ({ ...d, userId: e.target.value }))}
								sx={{ flex: 1 }}
								inputProps={{ style: { fontFamily: 'monospace', fontSize: 12 } }}
							/>
							<TextField
								size='small'
								label='Сумма'
								type='number'
								value={draft.price}
								onChange={e => setDraft(d => ({ ...d, price: e.target.value }))}
								sx={{ flex: 1 }}
								inputProps={{ style: { fontFamily: 'monospace', fontSize: 12 } }}
							/>
						</Stack>

						<Stack direction='row' spacing={1}>
							<Button
								variant='contained'
								fullWidth
								startIcon={<SearchIcon />}
								onClick={applySearch}
							>
								{t.show_all.split(' ')[0]}
							</Button>
							{isFiltered && (
								<Button
									variant='outlined'
									color='inherit'
									onClick={resetSearch}
									sx={{ whiteSpace: 'nowrap' }}
								>
									{t.reset_filters}
								</Button>
							)}
						</Stack>
					</Stack>
				</Box>

				<Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
					<DataGrid
						rows={tableRows}
						columns={columns}
						initialState={{ pagination: { paginationModel: { page: 0, pageSize: 25 } } }}
						pageSizeOptions={[25, 50, 100]}
						sx={{
							border: 0,
							'& .MuiDataGrid-cell[data-field="userId"]': {
								cursor: 'pointer',
								fontFamily: 'monospace',
								fontSize: 12,
							},
						}}
						onCellDoubleClick={(params: GridCellParams) => {
							if (params.field === 'userId') {
								navigate(`/users/${params.value}`)
							}
						}}
						density='compact'
					/>
				</Paper>
			</Box>
			<BottomNavigate />
		</Box>
	)
}

export default TransactionsLog
