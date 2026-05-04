import { Box, useTheme } from '@mui/material'
import Header from '../../components/Header/Header'
import BottomNavigate from '../home/BottomNavigate'
import { useState } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useTokenStore } from '../../store/token/useTokenStore'
import { useQuery } from '@tanstack/react-query'
import type { ITransactionsPaginated } from '../../types/transactions/transactions'
import { getTransactionsByPeriod } from '../../api/transactions/transactions'
import LoadingProgress from '../../components/Loading/LoadingProgress'
import GameStatistics from '../../components/statistics/GameStatistics'
import DataPicker from '../../components/data/DataPicker'

const Statistics = () => {
	const { token } = useTokenStore()
	const theme = useTheme()
	const today = dayjs()
	const monthAgo = dayjs().subtract(1, 'week')
	const [start, setStart] = useState({
		startDay: monthAgo.date(),
		startMonth: monthAgo.month() + 1,
		startYear: monthAgo.year(),
	})
	const [end, setEnd] = useState({
		endDay: today.date(),
		endMonth: today.month() + 1,
		endYear: today.year(),
	})

	const { data } = useQuery<ITransactionsPaginated, Error>({
		queryKey: ['getTransactionsByPeriod', token, start, end],
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

	return (
		<Box
			sx={{
				height: '100vh',
				background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
				overflowY: 'auto',
			}}
		>
			<Header />
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<DataPicker
					start={start}
					setStart={setStart}
					setEnd={setEnd}
					end={end}
				/>
				{data ? <GameStatistics data={data.data} /> : <LoadingProgress />}
			</LocalizationProvider>

			<BottomNavigate />
		</Box>
	)
}

export default Statistics
