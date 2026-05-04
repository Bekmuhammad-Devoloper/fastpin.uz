import {
	Box,
	Button,
	FormControl,
	Input,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	useTheme,
	type SelectChangeEvent,
} from '@mui/material'
import BottomNavigate from '../home/BottomNavigate'
import Header from '../../components/Header/Header'
import { useQuery } from '@tanstack/react-query'
import type { IGames, IOffer } from '../../types/games/games'
import { getGames } from '../../api/games/games'
import { useState, useEffect } from 'react'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { useGamesStoreModal } from '../../store/modal/useGameModal'
import { getOffer, updateOffer } from '../../api/games/offer'
import { useTokenStore } from '../../store/token/useTokenStore'
import { useDollarStore } from '../../store/dollar/useDollorStore'

interface LocalOffer extends IOffer {
	superPriceDollar: string
}

const formatDollar = (value: number): string => {
	return String(Math.round(value * 100) / 100)
}

const SuperUsers = () => {
	const theme = useTheme()
	const { token } = useTokenStore()
	const { openModal } = useGamesStoreModal()
	const { t, lang } = useTranslationStore()
	const [game, setGame] = useState('')
	const { dollor, setDollor } = useDollarStore()
	const [localOffers, setLocalOffers] = useState<LocalOffer[]>([])
	const { data: games } = useQuery<IGames[], Error>({
		queryKey: ['games'],
		queryFn: async () => {
			const result = await getGames()
			return result ?? []
		},
	})

	const { data: offers } = useQuery<IOffer[], Error>({
		queryKey: ['offer', token, game],
		queryFn: async () => {
			const result = await getOffer({ token, gameId: game })
			return result ?? []
		},
		enabled: !!game,
	})

	useEffect(() => {
		if (offers) {
			const rate = Number(dollor)
			setLocalOffers(
				offers.map(o => ({
					...o,
					superPriceDollar:
						rate > 0 && o.superPrice
							? formatDollar(Number(o.superPrice) / rate)
							: '',
				})),
			)
		}
	}, [offers])

	const handleSumChange = (index: number, value: string) => {
		if (value !== '' && !/^\d+$/.test(value)) return
		const rate = Number(dollor)
		setLocalOffers(prev =>
			prev.map((o, i) =>
				i === index
					? {
							...o,
							superPrice: value,
							superPriceDollar:
								rate > 0 && value !== ''
									? formatDollar(Number(value) / rate)
									: '',
						}
					: o,
			),
		)
	}

	const handleDollarChange = (index: number, value: string) => {
		if (value !== '' && !/^\d*\.?\d{0,2}$/.test(value)) return
		const rate = Number(dollor)
		setLocalOffers(prev =>
			prev.map((o, i) =>
				i === index
					? {
							...o,
							superPriceDollar: value,
							superPrice:
								rate > 0 && value !== ''
									? String(Math.round(Number(value) * rate))
									: '',
						}
					: o,
			),
		)
	}

	const handleGameChange = (event: SelectChangeEvent) => {
		setGame(event.target.value as string)
	}

	const handleSave = async () => {
		if (!offers) return
		const changed = localOffers.filter(local => {
			const original = offers.find(o => o.id === local.id)
			return original && original.superPrice !== local.superPrice
		})
		if (changed.length === 0) return
		for (const offer of changed) {
			const data = new FormData()
			data.append('token', token)
			data.append('id', offer.id)
			data.append('superPrice', offer.superPrice)
			await updateOffer(data)
		}
	}

	return (
		<Box
			sx={{
				height: '100vh',
				background: `linear-gradient(135deg, ${theme.palette.custom.gradientStart} 0%, ${theme.palette.custom.neonGreen} 50%, ${theme.palette.custom.gradientEnd} 100%)`,
				overflowY: 'auto',
			}}
		>
			<Header />

			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 2,
					p: 2,
				}}
			>
				<FormControl fullWidth>
					<InputLabel>{t.select_game}</InputLabel>
					<Select
						value={game}
						label={t.select_game}
						onChange={handleGameChange}
					>
						{games?.map(g => (
							<MenuItem key={g.id} value={g.id}>
								{g.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<Button
					variant='contained'
					sx={{ whiteSpace: 'nowrap' }}
					onClick={() => openModal(games?.find(g => g.id === game))}
					disabled={!game}
				>
					{t.update_game}
				</Button>
			</Box>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 2,
					p: 2,
				}}
			>
				<FormControl fullWidth variant='standard'>
					<InputLabel htmlFor='dollar-rate'>{t.dollar_rate}</InputLabel>
					<Input
						id='dollar-rate'
						type='number'
						value={dollor}
						onChange={e => setDollor(e.target.value)}
						startAdornment={<InputAdornment position='start'>$</InputAdornment>}
					/>
				</FormControl>

				<Button
					variant='contained'
					sx={{ whiteSpace: 'nowrap' }}
					onClick={handleSave}
				>
					{t.save}
				</Button>
			</Box>
			<TableContainer component={Paper} sx={{ mx: 2, mb: 8 }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell align='center'>{t.donation_name}</TableCell>
							<TableCell align='center'>{t.bot_id}</TableCell>
							<TableCell align='center'>{t.price_for_all}</TableCell>
							<TableCell align='center'>
								{t.superuser_price} ({t.som})
							</TableCell>
							<TableCell align='center'>{t.superuser_price_dollar}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{localOffers.map((row, index) => {
							return (
								<TableRow key={index}>
									<TableCell align='center' component='th' scope='row'>
										{lang === 'ru' ? row.ruName : row.uzName}
									</TableCell>
									<TableCell align='center'>{row.botId}</TableCell>
									<TableCell align='center'>{row.price}</TableCell>
									<TableCell align='center'>
										<TextField
											variant='standard'
											value={row.superPrice}
											onChange={e => handleSumChange(index, e.target.value)}
											InputProps={{
												sx: { '& input': { textAlign: 'center' } },
											}}
											placeholder='0'
										/>
									</TableCell>
									<TableCell align='center'>
										<TextField
											variant='standard'
											value={row.superPriceDollar}
											onChange={e => handleDollarChange(index, e.target.value)}
											InputProps={{
												sx: { '& input': { textAlign: 'center' } },
											}}
											placeholder='0'
										/>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</TableContainer>

			<BottomNavigate />
		</Box>
	)
}

export default SuperUsers
