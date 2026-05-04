import {
	Modal,
	Box,
	Typography,
	IconButton,
	useTheme,
	useMediaQuery,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useVideoModalStore } from '../../store/modal/useVideoModalStore'
export const VideoModal = () => {
	const { isOpen, title, video, close } = useVideoModalStore()
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))

	if (!isOpen || !video) return null
	const src = video.type === 'backend' ? video.url : video.src
	const isVideo = src.endsWith('.mp4') || src.endsWith('.webm')
	const isImage = src.endsWith('.webp')

	return (
		<Modal
			open={isOpen}
			onClose={close}
			closeAfterTransition
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				'& .MuiBackdrop-root': {
					backgroundColor: 'rgba(0, 0, 0, 0.9)',
				},
			}}
		>
			<Box
				sx={{
					position: 'relative',
					width: '100%',
					maxWidth: isMobile ? '94%' : isTablet ? 720 : 960,
					maxHeight: '94vh',
					bgcolor: 'background.paper',
					borderRadius: { xs: 2, sm: 3 },
					boxShadow: 24,
					overflow: 'hidden',
					outline: 'none',
					transition: 'all 0.3s ease-in-out',
				}}
			>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						px: { xs: 2, sm: 3 },
						py: 1.5,
						borderBottom: 1,
						borderColor: 'divider',
						bgcolor: 'background.default',
					}}
				>
					<Typography
						variant={isMobile ? 'subtitle1' : 'h6'}
						fontWeight={600}
						noWrap
						sx={{
							flex: 1,
							pr: 2,
							fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
						}}
					>
						{title || 'Видео'}
					</Typography>

					<IconButton
						onClick={close}
						size={isMobile ? 'medium' : 'large'}
						sx={{
							color: 'text.secondary',
							'&:hover': { bgcolor: 'action.hover' },
						}}
					>
						<CloseIcon />
					</IconButton>
				</Box>

				<Box
					sx={{
						position: 'relative',
						width: '100%',
						bgcolor: 'black',
						overflow: 'hidden',
					}}
				>
					{isVideo && (
						<video
							src={src}
							controls
							playsInline
							style={{
								width: '100%',
								maxHeight: '80vh',
								display: 'block',
								background: '#000',
							}}
						/>
					)}

					{isImage && (
						<img
							src={src}
							alt=''
							style={{
								width: '100%',
								maxHeight: '80vh',
								display: 'block',
								background: '#000',
							}}
						/>
					)}
				</Box>
			</Box>
		</Modal>
	)
}
