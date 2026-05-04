import { Box } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

const DataPicker = ({
	setStart,
	start,
	setEnd,
	end,
}: {
	end: {
		endDay: number
		endMonth: number
		endYear: number
	}
	start: {
		startDay: number
		startMonth: number
		startYear: number
	}
	setEnd: React.Dispatch<
		React.SetStateAction<{
			endDay: number
			endMonth: number
			endYear: number
		}>
	>
	setStart: React.Dispatch<
		React.SetStateAction<{
			startDay: number
			startMonth: number
			startYear: number
		}>
	>
}) => {
	const { t } = useTranslationStore()
	const handleStartChange = (value: Dayjs | null) => {
		if (!value) return
		setStart({
			startDay: value.date(),
			startMonth: value.month() + 1,
			startYear: value.year(),
		})
	}
	const handleEndChange = (value: Dayjs | null) => {
		if (!value) return
		setEnd({
			endDay: value.date(),
			endMonth: value.month() + 1,
			endYear: value.year(),
		})
	}
	return (
		<>
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', sm: 'row' },
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 2,
					p: 2,
				}}
			>
				<DatePicker
					label={t.start_date}
					format='DD.MM.YYYY'
					value={dayjs(
						`${start.startYear}-${start.startMonth}-${start.startDay}`,
					)}
					onChange={handleStartChange}
					slotProps={{
						textField: { fullWidth: true },
					}}
				/>
				<DatePicker
					label={t.end_date}
					format='DD.MM.YYYY'
					value={dayjs(`${end.endYear}-${end.endMonth}-${end.endDay}`)}
					onChange={handleEndChange}
					slotProps={{
						textField: { fullWidth: true },
					}}
				/>

			</Box>
		</>
	)
}

export default DataPicker
