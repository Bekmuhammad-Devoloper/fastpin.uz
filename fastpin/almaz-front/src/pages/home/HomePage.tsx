import { Box, useTheme } from '@mui/material'
import HeaderAnnouncements from '../../components/announcements/HeaderAnnouncements'
import Header from '../../components/Header/Header'
import GamesPage from '../games/Games'
import BottomNavigate from './BottomNavigate'
const HomePage = () => {
	const theme = useTheme()
	return (
		<Box
			sx={{
				minHeight: '100vh',
				background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
				overflowY: 'auto',
			}}
		>
			<Header />
			<HeaderAnnouncements />
			<GamesPage />
			<BottomNavigate />
		</Box>
	)
}

export default HomePage
