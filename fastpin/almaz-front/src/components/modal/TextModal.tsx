import { Modal, Box, Typography, IconButton, useTheme } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useTextModalStore } from '../../store/modal/useTextModal'

export default function TextModal() {
	const { open, message, severity, closeModal } = useTextModalStore()
	const theme = useTheme()
	const isError = severity === 'error'

	return (
		<Modal
			open={open}
			onClose={closeModal}
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				p: 2,
			}}
		>
			<Box
				sx={{
					position: 'relative',
					maxWidth: 480,
					width: '100%',
					bgcolor: theme.palette.background.paper,
					borderRadius: 4,
					boxShadow:
						theme.palette.mode === 'dark'
							? isError
								? '0 20px 60px rgba(255, 60, 60, 0.25)'
								: '0 20px 60px rgba(0, 0, 0, 0.5)'
							: isError
								? '0 20px 60px rgba(211, 47, 47, 0.15)'
								: '0 20px 60px rgba(0, 0, 0, 0.15)',
					border: `1px solid ${
						isError
							? theme.palette.mode === 'dark'
								? 'rgba(255, 80, 80, 0.35)'
								: 'rgba(211, 47, 47, 0.25)'
							: theme.palette.mode === 'dark'
								? 'rgba(255,255,255,0.08)'
								: 'rgba(0,0,0,0.04)'
					}`,
					overflow: 'hidden',
					outline: 'none',
				}}
			>
				{isError && (
					<Box
						sx={{
							px: { xs: 3, sm: 4 },
							pt: 3,
							pb: 2,
							display: 'flex',
							alignItems: 'center',
							gap: 1.5,
							background:
								theme.palette.mode === 'dark'
									? 'linear-gradient(135deg, rgba(183, 28, 28, 0.4) 0%, rgba(211, 47, 47, 0.2) 100%)'
									: 'linear-gradient(135deg, rgba(255, 235, 235, 1) 0%, rgba(255, 220, 220, 1) 100%)',
							borderBottom: `1px solid ${
								theme.palette.mode === 'dark'
									? 'rgba(255, 80, 80, 0.2)'
									: 'rgba(211, 47, 47, 0.15)'
							}`,
						}}
					>
						<ErrorOutlineIcon
							sx={{
								color: theme.palette.error.main,
								fontSize: 28,
								flexShrink: 0,
							}}
						/>
						<Typography
							variant='h6'
							fontWeight={700}
							sx={{ color: theme.palette.error.main, lineHeight: 1.2 }}
						>
							Ошибка
						</Typography>
					</Box>
				)}

				<Box sx={{ p: { xs: 3, sm: 4 }, pt: isError ? 2.5 : { xs: 3, sm: 4 } }}>
					<IconButton
						onClick={closeModal}
						sx={{
							position: 'absolute',
							top: 12,
							right: 12,
							color: theme.palette.text.secondary,
						}}
						size='small'
					>
						<CloseIcon fontSize='small' />
					</IconButton>

					<Typography
						sx={{
							lineHeight: 1.7,
							color: isError
								? theme.palette.error.main
								: theme.palette.text.primary,
							pr: 3,
							whiteSpace: 'pre-line',
							fontWeight: isError ? 500 : 400,
						}}
					>
						{message}
					</Typography>
				</Box>
			</Box>
		</Modal>
	)
}
