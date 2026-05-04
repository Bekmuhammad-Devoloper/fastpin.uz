import { Box, CircularProgress, useTheme } from '@mui/material'

const LoadingProgress = () => {
	const theme = useTheme()
	return (
		<Box
			sx={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
				backgroundColor:
					theme.palette.mode === 'dark'
						? 'rgba(0, 0, 0, 0.5)'
						: 'rgba(255, 255, 255, 0.5)',
				backdropFilter: 'blur(4px)',
				WebkitBackdropFilter: 'blur(4px)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 9999,
			}}
		>
			<Box
				sx={{
					p: 3,
					borderRadius: 4,
					backgroundColor:
						theme.palette.mode === 'dark'
							? 'rgba(18, 24, 34, 0.9)'
							: 'rgba(255, 255, 255, 0.9)',
					boxShadow:
						theme.palette.mode === 'dark'
							? '0 8px 32px rgba(0, 0, 0, 0.4)'
							: '0 8px 32px rgba(0, 0, 0, 0.1)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<CircularProgress color='primary' size={48} thickness={4} />
			</Box>
		</Box>
	)
}

export default LoadingProgress
