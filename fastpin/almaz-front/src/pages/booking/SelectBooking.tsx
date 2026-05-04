import { Box, useTheme } from '@mui/material'
import Header from '../../components/Header/Header'
import BottomNavigate from '../home/BottomNavigate'
import { useTokenStore } from '../../store/token/useTokenStore'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPaymentByPeriod } from '../../api/payment/payment'
import type { IPayment } from '../../types/payment/payment'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import DataPicker from '../../components/data/DataPicker'
import LoadingProgress from '../../components/Loading/LoadingProgress'
import SelectBooking from '../../components/selectBook/SelectBook'
const Booking = () => {
	const { token } = useTokenStore()
	const theme = useTheme()
	const today = dayjs()
	const monthAgo = dayjs().subtract(1, 'month')
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
	const { data, isLoading } = useQuery<IPayment[], Error>({
		queryKey: ['getTransactionsByPeriod', token, start, end],
		queryFn: async () =>
			(await getPaymentByPeriod({
				token,
				startDay: start.startDay,
				startMonth: start.startMonth,
				startYear: start.startYear,
				endDay: end.endDay,
				endMonth: end.endMonth,
				endYear: end.endYear,
			})) ?? [],
		enabled: !!token,
	})

	return (
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
			{data && <SelectBooking data={data} />}
			{isLoading ? <LoadingProgress /> : <></>}
			<BottomNavigate />
		</Box>
	)
}

export default Booking
