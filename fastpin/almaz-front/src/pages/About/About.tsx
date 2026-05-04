import {
	Typography,
	Box,
	Link,
	useMediaQuery,
	useTheme,
	Card,
	CardMedia,
	CardContent,
} from '@mui/material'
import Header from '../../components/Header/Header'
import telegram from '../../images/telegram.png'
import instagram from '../../images/instagram.webp'
import admin from '../../images/admin.jpeg'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import BottomNavigate from '../home/BottomNavigate'
const About = () => {
	const { t } = useTranslationStore()
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const contacts = [
		{
			title: 'Telegram канал',
			subtitle: '@mlbb_donater',
			image: telegram,
			link: 'https://t.me/mlbb_donater',
		},
		{
			title: 'Instagram',
			subtitle: '@Fastpin.uz',
			image: instagram,
			link: 'https://www.instagram.com/fastpin.uz?igsh=MWpvNjNyODNveWg1OQ==',
		},
		{
			title: 'Администратор',
			subtitle: '@Usmonov_admini',
			image: admin,
			link: 'https://t.me/Usmonov_admini',
		},
	]

	return (
		<Box
			sx={{
				minHeight: '100vh',
				background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
				overflowY: 'auto',
			}}
		>
			<Header />
			<Box sx={{ px: { xs: 1.5, sm: 3, md: 4 }, pb: 2 }}>
				<Typography
					sx={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", mb: 0.5 }}
					variant='h4'
					textAlign='center'
					fontWeight='bold'
				>
					{t.contact_us}
				</Typography>
				<Typography
					variant='body2'
					textAlign='center'
					color='text.secondary'
					mb={3}
				>
					{t.contact_message}
				</Typography>

				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
						gap: 2,
					}}
				>
					{contacts.map((item, index) => (
						<Link
							key={index}
							href={item.link}
							target='_blank'
							rel='noopener noreferrer'
							underline='none'
						>
							<Card
								sx={{
									borderRadius: 4,
									overflow: 'hidden',
									transition: 'all 0.3s ease',
									boxShadow:
										theme.palette.mode === 'dark'
											? '0 4px 20px rgba(0, 0, 0, 0.4)'
											: '0 4px 20px rgba(0, 0, 0, 0.1)',
									'&:hover': {
										transform: 'translateY(-4px)',
										boxShadow:
											theme.palette.mode === 'dark'
												? '0 12px 30px rgba(0, 0, 0, 0.5)'
												: '0 12px 30px rgba(0, 0, 0, 0.15)',
									},
								}}
							>
								<CardMedia
									component='img'
									image={item.image}
									alt={item.title}
									sx={{ height: 280, objectFit: 'cover' }}
								/>
								<CardContent
									sx={{
										background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
									}}
								>
									<Typography
										sx={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
										variant='h6'
										fontWeight='bold'
									>
										{item.title}
									</Typography>
									<Typography
										variant='body2'
										sx={{ color: theme.palette.text.secondary }}
									>
										{item.subtitle}
									</Typography>
								</CardContent>
							</Card>
						</Link>
					))}
				</Box>
			</Box>
			<BottomNavigate />
		</Box>
	)
}

export default About
