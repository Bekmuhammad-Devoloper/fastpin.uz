import { Box, Typography } from '@mui/material'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
const NoData = () => {
	const { t } = useTranslationStore()
	return (
		<Box sx={{ p: 3, textAlign: 'center' }}>
			<VolunteerActivismIcon
				sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
			/>
			<Typography color='text.secondary'>{t.no_data}</Typography>
		</Box>
	)
}

export default NoData
