import { Box, Button, Typography, useTheme } from '@mui/material'
import { useGameStore } from '../../store/game/useGameStore'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { useVideoModalStore } from '../../store/modal/useVideoModalStore'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
const Instructions = () => {
	const { game } = useGameStore()
	const { open } = useVideoModalStore()
	const { lang, t } = useTranslationStore()
	const theme = useTheme()
	const apiUrl = import.meta.env.VITE_API_URL
	return (
		<Box sx={{ pb: 2 }}>
			<Typography
				sx={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", mb: 2 }}
				align='center'
				variant='h4'
			>
				{t.instructions}
			</Typography>
			<Typography
				variant='body1'
				sx={{
					my: 2,
					fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
					lineHeight: 1.8,
					whiteSpace: 'pre-line',
				}}
			>
				{lang == 'ru' ? game.howToUseRu : game.howToUseUz}
			</Typography>
			<Button
				variant='contained'
				fullWidth
				color='error'
				size='large'
				startIcon={<PlayCircleOutlineIcon />}
				sx={{ my: 2, py: 1.5 }}
				onClick={() => {
					open({ video: { type: 'backend', url: `${apiUrl}${game.video}` } })
				}}
			>
				{t.watch_video}
			</Button>
			<Box
				sx={{
					borderRadius: 3,
					overflow: 'hidden',
					boxShadow:
						theme.palette.mode === 'dark'
							? '0 4px 20px rgba(0, 0, 0, 0.4)'
							: '0 4px 20px rgba(0, 0, 0, 0.1)',
				}}
			>
				<img
					src={`${apiUrl}${game.helpImage}`}
					alt='image'
					style={{
						width: '100%',
						height: 'auto',
						objectFit: 'contain',
						display: 'block',
					}}
				/>
			</Box>
		</Box>
	)
}

export default Instructions
