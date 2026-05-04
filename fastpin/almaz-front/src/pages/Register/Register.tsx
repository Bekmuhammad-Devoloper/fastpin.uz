import {
	Alert,
	Box,
	Button,
	IconButton,
	InputAdornment,
	TextField,
	Typography,
	useTheme,
	useMediaQuery,
	Divider,
} from '@mui/material'
import { useState } from 'react'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { login, register } from '../../api/login/login'
import { useTokenStore } from '../../store/token/useTokenStore'
import { useNavigate } from 'react-router-dom'
const Register = () => {
	const [isLoading, setIsLoading] = useState(false)
	const [isLogin, setIsLogin] = useState(true)
	const { setToken, setTokens, setUserRole, setBalance } = useTokenStore()
	const navigate = useNavigate()
	const { t } = useTranslationStore()
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const [isShow, setIsShow] = useState(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	const [isBlocked, setIsBlocked] = useState(false)
	const [form, setForm] = useState<{ login: string; password: string }>({
		login: '',
		password: '',
	})
	async function handleSubmit(form: { login: string; password: string }) {
		setIsLoading(true)
		setErrorMsg(null)
		try {
			const fn = isLogin ? login : register
			const result = await fn(form) as any
			if (result.access_token) {
				setTokens(result.access_token, result.refresh_token || '')
			} else if (result.token) {
				setToken(result.token)
			}
			const role =
				result.userRole ??
				(result.is_admin === true ? 'admin' : result.is_admin === false ? 'user' : '')
			if (role) setUserRole(role)
			setBalance(String(result.balance ?? result.userBalance ?? 0))
			setIsLoading(false)
			setIsBlocked(false)
			navigate('/')
		} catch (error: any) {
			setIsLoading(false)
			const status = error?.response?.status
			if (status === 429) {
				setIsBlocked(true)
				setErrorMsg(
					'Слишком много неверных попыток входа. Аккаунт временно заблокирован на 15 минут в целях безопасности. Попробуйте позже.',
				)
			} else {
				setIsBlocked(false)
				setErrorMsg(error?.response?.data || error.message || 'Unknown error')
			}
		}
	}
	const MIN_LOGIN = 5
	const MIN_PASSWORD = 6

	const isLoginError = form.login.length > 0 && form.login.length < MIN_LOGIN

	const isPasswordError =
		form.password.length > 0 && form.password.length < MIN_PASSWORD
	const isDisabled =
		isLoading ||
		!form.login ||
		!form.password ||
		isLoginError ||
		isPasswordError

	return (
		<Box
			sx={{
				width: '100vw',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				p: isMobile ? 2 : 0,
				minHeight: '100vh',
				background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
			}}
		>
			<Box
				sx={{
					width: '100%',
					maxWidth: '420px',
					p: { xs: 3, sm: 4, md: 5 },
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: { xs: 2.5, sm: 3 },
					borderRadius: 4,
					border: `1px solid ${
						theme.palette.mode === 'dark'
							? 'rgba(255,255,255,0.08)'
							: 'rgba(0,0,0,0.06)'
					}`,
					backgroundColor:
						theme.palette.mode === 'dark'
							? 'rgba(18, 24, 34, 0.9)'
							: 'rgba(255, 255, 255, 0.9)',
					backdropFilter: 'blur(20px)',
					WebkitBackdropFilter: 'blur(20px)',
					boxShadow:
						theme.palette.mode === 'dark'
							? '0 20px 60px rgba(0, 0, 0, 0.5)'
							: '0 20px 60px rgba(0, 0, 0, 0.1)',
				}}
			>
				<Typography
					variant={isMobile ? 'h5' : 'h4'}
					sx={{
						color: theme.palette.primary.main,
						textAlign: 'center',
						fontWeight: 700,
						fontFamily:
							"-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
						letterSpacing: '2px',
					}}
				>
					FASTPIN
				</Typography>

				<TextField
					fullWidth
					variant='outlined'
					placeholder='Login'
					value={form.login}
					error={isLoginError}
					helperText={isLoginError ? `${t.register}: min ${MIN_LOGIN}` : ''}
					inputProps={{ minLength: MIN_LOGIN }}
					onChange={e => setForm({ ...form, login: e.target.value })}
					onKeyDown={e => e.key === 'Enter' && handleSubmit(form)}
					size={isMobile ? 'small' : 'medium'}
				/>

				<TextField
					fullWidth
					variant='outlined'
					placeholder='Password'
					type={isShow ? 'text' : 'password'}
					value={form.password}
					error={isPasswordError}
					helperText={isPasswordError ? `Password: min ${MIN_PASSWORD}` : ''}
					onChange={e => setForm({ ...form, password: e.target.value })}
					onKeyDown={e => e.key === 'Enter' && handleSubmit(form)}
					size={isMobile ? 'small' : 'medium'}
					inputProps={{ minLength: MIN_PASSWORD }}
					InputProps={{
						endAdornment: (
							<InputAdornment position='end'>
								<IconButton
									onClick={() => setIsShow(prev => !prev)}
									edge='end'
									size={isMobile ? 'small' : 'medium'}
								>
									{isShow ? <VisibilityOffIcon /> : <RemoveRedEyeIcon />}
								</IconButton>
							</InputAdornment>
						),
					}}
				/>

				{errorMsg && (
					<Alert
						severity={isBlocked ? 'warning' : 'error'}
						sx={{ width: '100%', borderRadius: 2 }}
					>
						{errorMsg}
					</Alert>
				)}

				<Button
					variant='contained'
					size='large'
					fullWidth
					loading={isLoading}
					disabled={isDisabled || isBlocked}
					onClick={() => handleSubmit(form)}
					color='info'
					sx={{
						mt: 1,
						py: { xs: 1.2, sm: 1.5 },
						fontSize: { xs: '1rem', sm: '1.1rem' },
					}}
				>
					{isLogin ? t.system_login : t.create_account}
				</Button>
				<Divider
					sx={{
						width: '100%',
						'&::before, &::after': {
							borderColor: 'divider',
						},
					}}
				>
					<Typography variant='body2' sx={{ color: 'text.secondary', px: 1 }}>
						{t.or}
					</Typography>
				</Divider>
				<Button
					variant='outlined'
					size='large'
					fullWidth
					onClick={() => setIsLogin(prev => !prev)}
					sx={{
						py: { xs: 1, sm: 1.2 },
						fontSize: { xs: '1rem', sm: '1.1rem' },
					}}
				>
					{isLogin ? t.register : t.login}
				</Button>
			</Box>
		</Box>
	)
}

export default Register
