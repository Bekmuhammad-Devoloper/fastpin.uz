import { Box, useTheme } from '@mui/material'
import { useTokenStore } from '../../store/token/useTokenStore'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Header from '../../components/Header/Header'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import DataPicker from '../../components/data/DataPicker'
import LoadingProgress from '../../components/Loading/LoadingProgress'
import BottomNavigate from '../home/BottomNavigate'
import DonationStatistic from '../../components/Donation/DonationStatistic'
import type { ITransactions } from '../../types/transactions/transactions'
import { getTransactionsByPeriod } from '../../api/transactions/transactions'

const Donation = () => {
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
	const { data } = useQuery<ITransactions[], Error>({
		queryKey: ['getTransactionsByPeriod', token, start, end],
		queryFn: async () =>
			(
				await getTransactionsByPeriod({
					token,
					startDay: start.startDay,
					startMonth: start.startMonth,
					startYear: start.startYear,
					endDay: end.endDay,
					endMonth: end.endMonth,
					endYear: end.endYear,
				})
			).data ?? [],
		enabled: !!token,
	})

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
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<DataPicker
						start={start}
						setStart={setStart}
						setEnd={setEnd}
						end={end}
					/>
				</LocalizationProvider>
				<BottomNavigate />
				{data ? <DonationStatistic data={data} /> : <LoadingProgress />}
			</Box>
		</>
	)
}

export default Donation
