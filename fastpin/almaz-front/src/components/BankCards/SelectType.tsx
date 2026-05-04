import { Box, useTheme } from '@mui/material'
import humo from '../../images/cards/humo.png'
import uzcard from '../../images/cards/uzcard.png'
import { useSelectCardStore } from '../../store/cart/useSelectCardStore'
const SelectType = () => {
	const { card, setCard } = useSelectCardStore()
	const theme = useTheme()
	return (
		<Box
			sx={{
				width: '100%',
				display: 'flex',
				gap: 2,
			}}
		>
			<Box
				onClick={() => {
					setCard('humo')
				}}
				sx={{
					flex: 1,
					height: 140,
					borderRadius: 3,
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					bgcolor: 'white',
					border:
						card === 'humo'
							? `3px solid ${theme.palette.primary.main}`
							: `2px solid transparent`,
					boxShadow:
						card === 'humo'
							? theme.palette.mode === 'dark'
								? '0 4px 20px rgba(0, 212, 255, 0.25)'
								: '0 4px 20px rgba(0, 123, 255, 0.2)'
							: theme.palette.mode === 'dark'
								? '0 4px 12px rgba(0, 0, 0, 0.4)'
								: '0 4px 12px rgba(0, 0, 0, 0.08)',
					transition: 'all 0.25s ease',
					overflow: 'hidden',
					'&:hover': {
						transform: 'translateY(-2px)',
						boxShadow:
							theme.palette.mode === 'dark'
								? '0 8px 24px rgba(0, 0, 0, 0.5)'
								: '0 8px 24px rgba(0, 0, 0, 0.12)',
					},
				}}
			>
				<img
					src={humo}
					alt='Humo'
					style={{
						width: '80%',
						height: '80%',
						objectFit: 'contain',
					}}
				/>
			</Box>
			<Box
				onClick={() => {
					setCard('uzcard')
				}}
				sx={{
					flex: 1,
					height: 140,
					borderRadius: 3,
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					bgcolor: 'white',
					border:
						card === 'uzcard'
							? `3px solid ${theme.palette.primary.main}`
							: `2px solid transparent`,
					boxShadow:
						card === 'uzcard'
							? theme.palette.mode === 'dark'
								? '0 4px 20px rgba(0, 212, 255, 0.25)'
								: '0 4px 20px rgba(0, 123, 255, 0.2)'
							: theme.palette.mode === 'dark'
								? '0 4px 12px rgba(0, 0, 0, 0.4)'
								: '0 4px 12px rgba(0, 0, 0, 0.08)',
					transition: 'all 0.25s ease',
					overflow: 'hidden',
					'&:hover': {
						transform: 'translateY(-2px)',
						boxShadow:
							theme.palette.mode === 'dark'
								? '0 8px 24px rgba(0, 0, 0, 0.5)'
								: '0 8px 24px rgba(0, 0, 0, 0.12)',
					},
				}}
			>
				<img
					src={uzcard}
					alt='Uzcard'
					style={{
						width: '80%',
						height: '80%',
						objectFit: 'contain',
					}}
				/>
			</Box>
		</Box>
	)
}

export default SelectType
