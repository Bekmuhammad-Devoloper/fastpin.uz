import {
	BottomNavigation,
	BottomNavigationAction,
	Box,
	Paper,
	useTheme,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useLocation, useNavigate } from 'react-router-dom'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
const BottomNavigate = () => {
	const theme = useTheme()
	const location = useLocation()
	const navigate = useNavigate()
	return (
		<>
			<Box sx={{ height: 56 }} />
			<Paper
				sx={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 99,
					borderRadius: '300px',
					backgroundColor:
						theme.palette.mode === 'dark'
							? 'rgba(0, 0, 0, 0.2)'
							: 'rgba(0, 0, 0, 0.1)',
					backdropFilter: 'blur(8px)',
					WebkitBackdropFilter: 'blur(8px)',
					boxShadow: 'none',
				}}
				elevation={0}
			>
				<BottomNavigation
					sx={{
						backgroundColor: 'transparent',
					}}
					value={location.pathname}
					onChange={(_, newValue) => navigate(newValue)}
				>
					<BottomNavigationAction value='/' icon={<HomeIcon />} />
					<BottomNavigationAction
						value='/wallet'
						icon={<AccountBalanceWalletIcon />}
					/>
					<BottomNavigationAction value='/cart' icon={<ShoppingCartIcon />} />
					<BottomNavigationAction value='/history' icon={<ScheduleIcon />} />
				</BottomNavigation>
			</Paper>
		</>
	)
}

export default BottomNavigate
