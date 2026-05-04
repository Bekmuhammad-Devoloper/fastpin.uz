import { useState, useEffect } from 'react'
import { Box, Skeleton, Typography, useTheme } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { getAnnouncements } from '../../api/Announcements/Announcements'
import type { IAnnouncements } from '../../types/Announcements/Announcements'

const HeaderAnnouncements = () => {
	const { lang } = useTranslationStore()
	const theme = useTheme()
	const navigate = useNavigate()
	const { data: slides = [], isLoading } = useQuery<IAnnouncements[], Error>({
		queryKey: ['slides'],
		queryFn: () => getAnnouncements().then(res => res ?? []),
	})
	const apiUrl = import.meta.env.VITE_API_URL
	const [activeIndex, setActiveIndex] = useState(0)
	useEffect(() => {
		if (slides.length <= 1) return
		const interval = setInterval(() => {
			setActiveIndex(prev => (prev + 1) % slides.length)
		}, 4500)
		return () => clearInterval(interval)
	}, [slides.length])
	if (isLoading) {
		return (
			<Skeleton
				variant='rectangular'
				animation='wave'
				width={'100%'}
				height={180}
				sx={{ my: 2, borderRadius: 3 }}
			/>
		)
	}
	if (slides.length === 0) return null
	const current = slides[activeIndex]
	return (
		<>
			<Box
				sx={{
					width: '100%',
					aspectRatio: { xs: '16/9', md: '21/9' },
					position: 'relative',
					overflow: 'hidden',
					borderRadius: 1,
					boxShadow:
						theme.palette.mode === 'dark'
							? '0 8px 30px rgba(0, 0, 0, 0.4)'
							: '0 8px 30px rgba(0, 0, 0, 0.12)',
					bgcolor: 'background.paper',
					my: 2,
					cursor: 'pointer',
				}}
			>
				<Box
					component='img'
					src={`${apiUrl}${current.image}`}
					alt={lang === 'ru' ? current.ru : current.uz}
					sx={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition: 'center',
						transition: 'opacity 0.8s ease',
						opacity: 1,
						position: 'absolute',
						inset: 0,
					}}
					onClick={() => {
						navigate(`/announcements/${current.id}`)
					}}
					onError={e => {
						console.error('Не загрузилась картинка:', e.currentTarget.src)
					}}
				/>
				<Box
					sx={{
						position: 'absolute',
						inset: 0,
						background:
							'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
						pointerEvents: 'none',
					}}
				/>
				<Box
					sx={{
						position: 'absolute',
						bottom: { xs: 16, sm: 24, md: 32 },
						left: { xs: 16, sm: 24, md: 32 },
						right: { xs: 16, sm: 24, md: 32 },
						color: 'white',
						zIndex: 2,
					}}
				>
					<Typography
						variant='h5'
						component='div'
						sx={{
							fontWeight: 700,
							textShadow: '0 2px 12px rgba(0,0,0,0.7)',
							lineHeight: 1.3,
							letterSpacing: '-0.01em',
							WebkitLineClamp: 3,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
							display: '-webkit-box',
							fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
						}}
					>
						{lang === 'ru' ? current.ru : current.uz}
					</Typography>
				</Box>
				{slides.length > 1 && (
					<Box
						sx={{
							position: 'absolute',
							bottom: 10,
							left: '50%',
							transform: 'translateX(-50%)',
							display: 'flex',
							gap: '8px',
							zIndex: 3,
						}}
					>
						{slides.map((_, idx) => (
							<Box
								key={idx}
								onClick={e => {
									e.stopPropagation()
									setActiveIndex(idx)
								}}
								sx={{
									width: idx === activeIndex ? 24 : 8,
									height: 8,
									borderRadius: '4px',
									bgcolor:
										idx === activeIndex ? 'white' : 'rgba(255,255,255,0.4)',
									cursor: 'pointer',
									transition: 'all 0.3s ease',
									'&:hover': {
										bgcolor: 'white',
									},
								}}
							/>
						))}
					</Box>
				)}
			</Box>
		</>
	)
}

export default HeaderAnnouncements
