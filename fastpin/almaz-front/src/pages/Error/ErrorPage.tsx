import { Box, Button, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied'
import HomeIcon from '@mui/icons-material/Home'

const ErrorPage = () => {
	const navigate = useNavigate()
	const { t } = useTranslationStore()
	const theme = useTheme()
	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
				p: 3,
			}}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					textAlign: 'center',
					maxWidth: 420,
					p: 4,
					borderRadius: 4,
					backgroundColor:
						theme.palette.mode === 'dark'
							? 'rgba(18, 24, 34, 0.7)'
							: 'rgba(255, 255, 255, 0.7)',
					backdropFilter: 'blur(16px)',
					WebkitBackdropFilter: 'blur(16px)',
					border: `1px solid ${
						theme.palette.mode === 'dark'
							? 'rgba(255,255,255,0.06)'
							: 'rgba(0,0,0,0.04)'
					}`,
					boxShadow:
						theme.palette.mode === 'dark'
							? '0 12px 40px rgba(0, 0, 0, 0.3)'
							: '0 12px 40px rgba(0, 0, 0, 0.1)',
				}}
			>
				<SentimentDissatisfiedIcon
					sx={{
						fontSize: 80,
						color: theme.palette.primary.main,
						mb: 2,
						opacity: 0.8,
					}}
				/>
				<Typography
					variant='h2'
					sx={{
						fontWeight: 800,
						color: theme.palette.primary.main,
						mb: 1,
					}}
				>
					404
				</Typography>
				<Typography
					variant='h5'
					sx={{
						fontWeight: 700,
						color: theme.palette.text.primary,
						mb: 1,
						fontFamily:
							"-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
					}}
				>
					{t.error404Title}
				</Typography>
				<Typography
					variant='body1'
					sx={{
						color: theme.palette.text.secondary,
						mb: 3,
						fontFamily:
							"-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
					}}
				>
					{t.error404Message}
				</Typography>
				<Button
					variant='contained'
					size='large'
					startIcon={<HomeIcon />}
					sx={{ py: 1.5, px: 4 }}
					onClick={() => {
						navigate('/')
					}}
				>
					{t.home_page}
				</Button>
			</Box>
		</Box>
	)
}

export default ErrorPage
