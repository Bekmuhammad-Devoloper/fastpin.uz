import { useState } from 'react'
import {
	Box,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	TextField,
	IconButton,
	CircularProgress,
	Alert,
	Chip,
	Tooltip,
	useTheme,
} from '@mui/material'
import LockResetIcon from '@mui/icons-material/LockReset'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useQuery } from '@tanstack/react-query'
import Header from '../../components/Header/Header'
import BottomNavigate from '../home/BottomNavigate'
import { getUsers, changePassword } from '../../api/login/login'
import { useTokenStore } from '../../store/token/useTokenStore'
import { updateNumberFormat } from '../../func/number'
import type { IUser } from '../../types/user/user'

const STORAGE_KEY = 'admin_saved_passwords'

function getSavedPasswords(): Record<string, { login: string; password: string; savedAt: string }> {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
	} catch {
		return {}
	}
}

function savePassword(userToken: string, login: string, password: string) {
	const all = getSavedPasswords()
	all[userToken] = { login, password, savedAt: new Date().toISOString() }
	localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

function isHashed(password: string) {
	return password?.startsWith('$2a$') || password?.startsWith('$2b$')
}

function sortUsers(users: IUser[]) {
	const plain = users.filter(u => !isHashed(u.password)).sort((a, b) => b.balance - a.balance)
	const hashed = users.filter(u => isHashed(u.password)).sort((a, b) => b.balance - a.balance)
	return [...plain, ...hashed]
}

const PasswordManager = () => {
	const theme = useTheme()
	const { token } = useTokenStore()
	const [inputs, setInputs] = useState<Record<string, string>>({})
	const [statuses, setStatuses] = useState<Record<string, 'loading' | 'ok' | 'error'>>({})
	const [errorMsgs, setErrorMsgs] = useState<Record<string, string>>({})
	const [page, setPage] = useState(0)
	const [search, setSearch] = useState('')
	const rowsPerPage = 100
	const savedPasswords = getSavedPasswords()

	const { data, isLoading, error } = useQuery({
		queryKey: ['all-users-passwords', token, page, search],
		queryFn: async () => {
			const res = await getUsers({
				adminToken: token,
				page: page + 1,
				count: rowsPerPage,
				login: search || undefined,
				Token: undefined,
				StartBalance: undefined,
				userRole: undefined,
			})
			return { users: sortUsers(res.users ?? []), total: res.total ?? 0 }
		},
	})

	const glassCard = {
		backgroundColor:
			theme.palette.mode === 'dark'
				? 'rgba(18, 24, 34, 0.7)'
				: 'rgba(255, 255, 255, 0.7)',
		backdropFilter: 'blur(16px)',
		WebkitBackdropFilter: 'blur(16px)',
		border: `1px solid ${
			theme.palette.mode === 'dark'
				? 'rgba(255,255,255,0.06)'
				: 'rgba(0,0,0,0.04)'
		}`,
	}

	const handleChange = async (user: IUser) => {
		const newPassword = inputs[user.token]?.trim()
		if (!newPassword) return

		savePassword(user.token, user.login, newPassword)

		setStatuses(s => ({ ...s, [user.token]: 'loading' }))
		setErrorMsgs(e => ({ ...e, [user.token]: '' }))

		try {
			await changePassword({
				token,
				userId: user.token,
				oldPassword: user.password,
				newPassword,
			})
			setStatuses(s => ({ ...s, [user.token]: 'ok' }))
			setInputs(i => ({ ...i, [user.token]: '' }))
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : 'Ошибка'
			setStatuses(s => ({ ...s, [user.token]: 'error' }))
			setErrorMsgs(er => ({ ...er, [user.token]: msg }))
		}
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 2,
				width: '100%',
				minHeight: '100vh',
				background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
				overflowY: 'auto',
			}}
		>
			<Header />
			<Typography variant='h5' textAlign='center' sx={{ fontWeight: 700, mt: 1 }}>
				Управление паролями ({data?.total ?? 0})
			</Typography>
			<Typography variant='body2' color='text.secondary' textAlign='center'>
				Сначала пользователи с простыми паролями, потом хэшированные. По убыванию баланса.
			</Typography>

			<TextField
				placeholder='Поиск по логину...'
				value={search}
				onChange={e => {
					setPage(0)
					setSearch(e.target.value)
				}}
				size='small'
				sx={{ width: 280 }}
			/>

			<Paper
				sx={{
					width: 'calc(100% - 24px)',
					mx: { xs: 1.5, sm: 2 },
					...glassCard,
					borderRadius: 3,
					mb: 10,
				}}
			>
				<TableContainer>
					<Table size='small'>
						<TableHead>
							<TableRow>
								<TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Логин</TableCell>
								<TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Статус пароля</TableCell>
								<TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Сохранённый</TableCell>
								<TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Баланс</TableCell>
								<TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Новый пароль</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={5} align='center' sx={{ py: 8 }}>
										<CircularProgress />
									</TableCell>
								</TableRow>
							) : error ? (
								<TableRow>
									<TableCell colSpan={5}>
										<Alert severity='error'>Ошибка загрузки</Alert>
									</TableCell>
								</TableRow>
							) : (
								data?.users.map(user => {
									const hashed = isHashed(user.password)
									const saved = savedPasswords[user.token]
									const status = statuses[user.token]
									const errMsg = errorMsgs[user.token]

									return (
										<TableRow key={user.token} hover>
											<TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
												{user.login}
											</TableCell>
											<TableCell>
												{hashed ? (
													<Chip
														label='bcrypt'
														size='small'
														color='success'
														sx={{ fontSize: '0.65rem', height: 18 }}
													/>
												) : (
													<Chip
														label='простой — смените!'
														size='small'
														color='warning'
														sx={{ fontSize: '0.65rem', height: 18 }}
													/>
												)}
											</TableCell>
											<TableCell
												sx={{
													fontFamily: 'monospace',
													fontSize: '0.72rem',
													color: saved ? 'success.main' : 'text.disabled',
													whiteSpace: 'nowrap',
												}}
											>
												{saved ? (
													<Tooltip
														title={`Сохранён: ${new Date(saved.savedAt).toLocaleString()}`}
														placement='top'
													>
														<span>{saved.password}</span>
													</Tooltip>
												) : (
													'—'
												)}
											</TableCell>
											<TableCell sx={{ fontWeight: 600, color: 'primary.main', whiteSpace: 'nowrap' }}>
												{updateNumberFormat(user.balance)} сум
											</TableCell>
											<TableCell>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
													<TextField
														size='small'
														placeholder='Новый пароль'
														type='password'
														value={inputs[user.token] ?? ''}
														onChange={e =>
															setInputs(i => ({ ...i, [user.token]: e.target.value }))
														}
														onKeyDown={e => {
															if (e.key === 'Enter') handleChange(user)
														}}
														error={status === 'error'}
														helperText={errMsg || undefined}
														sx={{ minWidth: 130 }}
													/>
													<IconButton
														size='small'
														color={status === 'ok' ? 'success' : 'primary'}
														onClick={() => handleChange(user)}
														disabled={status === 'loading' || !inputs[user.token]?.trim()}
													>
														{status === 'loading' ? (
															<CircularProgress size={18} />
														) : status === 'ok' ? (
															<CheckCircleIcon fontSize='small' />
														) : (
															<LockResetIcon fontSize='small' />
														)}
													</IconButton>
												</Box>
											</TableCell>
										</TableRow>
									)
								})
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={[100]}
					component='div'
					count={data?.total ?? 0}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={(_, newPage) => setPage(newPage)}
					labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
				/>
			</Paper>

			<BottomNavigate />
		</Box>
	)
}

export default PasswordManager
