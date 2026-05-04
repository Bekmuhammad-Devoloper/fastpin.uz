import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircle from '@mui/icons-material/AccountCircle'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import CampaignIcon from '@mui/icons-material/Campaign'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import LanguageIcon from '@mui/icons-material/Language'
import LogoutIcon from '@mui/icons-material/Logout'
import InfoIcon from '@mui/icons-material/Info'
import HomeIcon from '@mui/icons-material/Home'
import AddCardIcon from '@mui/icons-material/AddCard'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout'
import GroupIcon from '@mui/icons-material/Group'
import LockResetIcon from '@mui/icons-material/LockReset'
import StarIcon from '@mui/icons-material/Star'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ViewListIcon from '@mui/icons-material/ViewList'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
import {
	Divider,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	useTheme,
} from '@mui/material'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { useThemeStore } from '../../store/theme/theme'
import { useTokenStore } from '../../store/token/useTokenStore'
import { useGamesStoreModal } from '../../store/modal/useGameModal'
import { useQuery } from '@tanstack/react-query'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { getBalance } from '../../api/buy/buy'
import { updateNumberFormat } from '../../func/number'
import { useIsAdmin } from '../../hooks/useIsAdmin'
export default function Header() {
	const { t, lang, setLang } = useTranslationStore()
	const { openModal } = useGamesStoreModal()
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)
	const { setTheme, theme: themename } = useThemeStore()
	const theme = useTheme()
	const { resetToken, token, resetBalance } = useTokenStore()
	const { isAdmin } = useIsAdmin()
	const { data } = useQuery<number, Error>({
		queryKey: ['adminBalance', token, open],
		queryFn: async () => {
			const result = await getBalance({ token })
			const sum = Number(result.b2bulk) + Number(result.istar) * 1.24
			return sum
		},
		enabled: !!token && isAdmin && open,
	})

	return (
		<>
			<Box
				sx={{
					flexGrow: 1,
					width: '100%',
					position: 'fixed',
					zIndex: 99,
					top: 0,
					left: 0,
					right: 0,
					borderRadius: '0 0 12px 12px',
				}}
			>
				<AppBar
					position='static'
					sx={{
						height: '64px',
						borderRadius: '0 0 30px 30px',
						backgroundColor:
							theme.palette.mode === 'dark'
								? 'rgba(0, 0, 0, 0.2)'
								: 'rgba(0, 0, 0, 0.1)',
						backdropFilter: 'blur(8px)',
						WebkitBackdropFilter: 'blur(8px)',
						borderBottom: `1px solid ${theme.palette.divider}`,
						boxShadow: 'none',
					}}
				>
					<Toolbar>
						<IconButton
							size='large'
							edge='start'
							color='inherit'
							aria-label='open drawer'
							sx={{ mr: 2, color: theme.palette.text.primary }}
							onClick={() => {
								setOpen(true)
							}}
						>
							<MenuIcon />
						</IconButton>
						<Typography
							variant='h6'
							noWrap
							component='div'
							sx={{
								cursor: 'pointer',
								color: theme.palette.text.primary,
								fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
							}}
							onClick={() => {
								navigate('/')
							}}
						>
							FASTPIN
						</Typography>

						<Box sx={{ flexGrow: 1 }} />
						{token && (
							<Box sx={{ display: 'flex' }}>
								<IconButton
									onClick={() => {
										navigate('/profile')
									}}
									size='large'
									edge='end'
									aria-haspopup='true'
									sx={{ color: theme.palette.text.primary }}
								>
									<AccountCircle />
								</IconButton>
							</Box>
						)}
					</Toolbar>
				</AppBar>
				<Drawer
					open={open}
					onClose={() => {
						setOpen(false)
					}}
				>
					<Box
						sx={{
							width: 250,
							background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
							display: 'flex',
							flexDirection: 'column',
							overflowY: 'auto',
							height: '100%',
						}}
						role='presentation'
						onClick={() => {
							setOpen(false)
						}}
					>
						<List>
							<ListItem disablePadding>
								<ListItemButton
									onClick={() => {
										navigate('/')
									}}
								>
									<ListItemIcon>
										<HomeIcon />
									</ListItemIcon>
									<ListItemText primary={t.home_page} />
								</ListItemButton>
							</ListItem>
							<ListItem disablePadding>
								<ListItemButton
									onClick={() => {
										navigate('/announcements')
									}}
								>
									<ListItemIcon>
										<CampaignIcon />
									</ListItemIcon>
									<ListItemText primary={t.announcements} />
								</ListItemButton>
							</ListItem>
						</List>
						<Divider />
						<List>
							<ListItem disablePadding>
								<ListItemButton
									onClick={() => {
										navigate('/about')
									}}
								>
									<ListItemIcon>
										<InfoIcon />
									</ListItemIcon>
									<ListItemText primary={t.about} />
								</ListItemButton>
							</ListItem>
						</List>
						<Divider />
						<List>
							<ListItem disablePadding>
								<ListItemButton
									onClick={() => {
										themename === 'dark' ? setTheme('light') : setTheme('dark')
									}}
								>
									<ListItemIcon>
										{themename == 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
									</ListItemIcon>
									<ListItemText
										primary={themename == 'dark' ? t.light_mode : t.dark_theme}
									/>
								</ListItemButton>
							</ListItem>
							<ListItem disablePadding>
								<ListItemButton
									onClick={() => {
										lang == 'ru' ? setLang('uz') : setLang('ru')
									}}
								>
									<ListItemIcon>
										<LanguageIcon />
									</ListItemIcon>
									<ListItemText primary={lang == 'ru' ? t.uzbek : t.russian} />
								</ListItemButton>
							</ListItem>
							{isAdmin && <Divider />}
							{isAdmin && (
								<ListItem disablePadding>
									<ListItemButton
										onClick={() => {
											navigate('/balance')
										}}
									>
										<ListItemIcon>
											<AttachMoneyIcon />
										</ListItemIcon>
										<ListItemText primary={data ? `${updateNumberFormat(data)} $` : '0 $'} />
									</ListItemButton>
								</ListItem>
							)}
							{isAdmin && <Divider />}
							{isAdmin && (
								<ListItem disablePadding>
									<ListItemButton
										onClick={() => {
											navigate('/transactions-log')
										}}
									>
										<ListItemIcon>
											<ViewListIcon />
										</ListItemIcon>
										<ListItemText primary={t.transactions_log} />
									</ListItemButton>
								</ListItem>
							)}
							{isAdmin && (
								<ListItem disablePadding>
									<ListItemButton
										onClick={() => {
											navigate('/statistics')
										}}
									>
										<ListItemIcon>
											<TrendingUpIcon />
										</ListItemIcon>
										<ListItemText primary={t.statistics} />
									</ListItemButton>
								</ListItem>
							)}
							{isAdmin && (
								<ListItem disablePadding>
									<ListItemButton
										onClick={() => {
											navigate('/donation')
										}}
									>
										<ListItemIcon>
											<VolunteerActivismIcon />
										</ListItemIcon>
										<ListItemText primary={t.donation} />
									</ListItemButton>
								</ListItem>
							)}
							{isAdmin && (
								<ListItem disablePadding>
									<ListItemButton
										onClick={() => {
											navigate('/users')
										}}
									>
										<ListItemIcon>
											<GroupIcon />
										</ListItemIcon>
										<ListItemText primary={t.users} />
									</ListItemButton>
								</ListItem>
							)}
							{isAdmin && (
								<ListItem disablePadding>
									<ListItemButton onClick={() => navigate('/password-manager')}>
										<ListItemIcon>
											<LockResetIcon />
										</ListItemIcon>
										<ListItemText primary='Пароли' />
									</ListItemButton>
								</ListItem>
							)}
							{isAdmin && (
								<ListItem disablePadding>
									<ListItemButton
										onClick={() => {
											openModal()
										}}
									>
										<ListItemIcon>
											<SportsEsportsIcon />
										</ListItemIcon>
										<ListItemText primary={t.add_game} />
									</ListItemButton>
								</ListItem>
							)}
							{isAdmin && (
								<ListItem disablePadding>
									<ListItemButton
										onClick={() => {
											navigate('/payments')
										}}
									>
										<ListItemIcon>
											<ShoppingCartCheckoutIcon />
										</ListItemIcon>
										<ListItemText primary={t.payments} />
									</ListItemButton>
								</ListItem>
							)}
							{isAdmin && (
								<ListItem disablePadding>
									<ListItemButton
										onClick={() => {
											navigate('/booking')
										}}
									>
										<ListItemIcon>
											<ViewListIcon />
										</ListItemIcon>
										<ListItemText primary={t.book_now} />
									</ListItemButton>
								</ListItem>
							)}
							{isAdmin && (
								<ListItem disablePadding>
									<ListItemButton
										onClick={() => {
											navigate('/add-card')
										}}
									>
										<ListItemIcon>
											<AddCardIcon />
										</ListItemIcon>
										<ListItemText primary={t.add_card} />
									</ListItemButton>
								</ListItem>
							)}
							{isAdmin && (
								<ListItem disablePadding>
									<ListItemButton
										onClick={() => {
											navigate('/superusers')
										}}
									>
										<ListItemIcon>
											<StarIcon />
										</ListItemIcon>
										<ListItemText primary={t.super_users} />
									</ListItemButton>
								</ListItem>
							)}
						</List>
						<Divider />
						<ListItem disablePadding sx={{ mt: 'auto' }}>
							<ListItemButton
								onClick={() => {
									if (token) {
										resetToken()
										resetBalance()
										navigate('/register')
									} else {
										navigate('/register')
									}
								}}
							>
								<ListItemIcon>
									<LogoutIcon color={token ? 'error' : 'info'} />
								</ListItemIcon>
								<ListItemText
									primary={token ? t.logout_of_system : t.register}
									sx={{ color: token ? 'red' : '#1976D2' }}
								/>
							</ListItemButton>
						</ListItem>
					</Box>
				</Drawer>
			</Box>
			<Box sx={{ height: { xs: '80px' } }}></Box>
		</>
	)
}
