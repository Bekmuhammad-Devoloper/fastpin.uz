import { useQuery } from '@tanstack/react-query'
import { getGames } from '../../api/games/games'
import type { IGames } from '../../types/games/games'
import { Box, Card, CardMedia, InputAdornment, TextField, useMediaQuery, useTheme } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../store/game/useGameStore'
import GameSkeleton from './GameSkeleton'
import { useState } from 'react'
const Games = () => {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const isDesctop = useMediaQuery(theme.breakpoints.down('md'))
	const { setGame } = useGameStore()
	const navigate = useNavigate()
	const apiUrl = import.meta.env.VITE_API_URL
	const [search, setSearch] = useState('')

	const { data, isLoading } = useQuery<IGames[], Error>({
		queryKey: ['games'],
		queryFn: async () => {
			const result = await getGames()
			return result ?? []
		},
	})

	const query = search.trim().toLowerCase()
	const searchResults = query
		? (data ?? []).filter(g => g.name.toLowerCase().includes(query))
		: null

	const gridColumns = isMobile ? '1fr 1fr' : isDesctop ? '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr'

	return (
		<>
			{isLoading ? (
				<>
					<GameSkeleton />
				</>
			) : (
				<>
					<Box sx={{ width: '100%', px: 0.5, pt: 1, pb: 1.5 }}>
						<TextField
							fullWidth
							size='small'
							placeholder='Search games...'
							value={search}
							onChange={e => setSearch(e.target.value)}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position='start'>
											<SearchIcon
												sx={{
													color:
														theme.palette.mode === 'dark'
															? 'rgba(0, 212, 255, 0.7)'
															: 'rgba(0, 123, 255, 0.6)',
													fontSize: 20,
												}}
											/>
										</InputAdornment>
									),
								},
							}}
							sx={{
								'& .MuiOutlinedInput-root': {
									borderRadius: '12px',
									background:
										theme.palette.mode === 'dark'
											? 'rgba(255,255,255,0.06)'
											: 'rgba(255,255,255,0.7)',
									backdropFilter: 'blur(8px)',
									'& fieldset': {
										borderColor:
											theme.palette.mode === 'dark'
												? 'rgba(0, 212, 255, 0.25)'
												: 'rgba(0, 123, 255, 0.2)',
									},
									'&:hover fieldset': {
										borderColor: theme.palette.primary.main,
									},
									'&.Mui-focused fieldset': {
										borderColor: theme.palette.primary.main,
									},
								},
							}}
						/>
					</Box>

					{searchResults !== null ? (
						<Box
							sx={{
								width: '100%',
								display: 'grid',
								gap: { xs: 1.5, sm: 2 },
								gridTemplateColumns: gridColumns,
								pb: 2,
							}}
						>
							{searchResults.map((g, index) => (
								<Card
									sx={{
										borderRadius: '16px',
										boxShadow:
											theme.palette.mode === 'dark'
												? '0 4px 20px rgba(0, 0, 0, 0.5)'
												: '0 4px 20px rgba(0, 0, 0, 0.12)',
										overflow: 'hidden',
										cursor: 'pointer',
										transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
										'&:hover': {
											transform: 'translateY(-4px)',
											boxShadow:
												theme.palette.mode === 'dark'
													? '0 12px 30px rgba(0, 0, 0, 0.6)'
													: '0 12px 30px rgba(0, 0, 0, 0.18)',
										},
										'&:active': {
											transform: 'translateY(-1px)',
										},
									}}
									key={index}
								>
									<CardMedia
										onClick={() => {
											setGame(g)
											navigate(`/${g.name}/${g.id}`)
										}}
										sx={{
											width: '100%',
											objectFit: 'cover',
											objectPosition: 'center',
											aspectRatio: '1 / 1',
										}}
										component='img'
										image={`${apiUrl}${g.image}`}
										alt={g.name}
									/>
								</Card>
							))}
						</Box>
					) : (
						<>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'start',
									gap: 1.5,
									width: '100%',
									overflowX: 'auto',
									py: 2,
									px: 0.5,
									scrollbarWidth: 'none',
									'&::-webkit-scrollbar': { display: 'none' },
								}}
							>
								{data
									?.filter(g => g.place === 'top')
									.map((g, index) => (
										<Box
											key={index}
											sx={{
												width: 80,
												height: 80,
												borderRadius: '18px',
												cursor: 'pointer',
												flexShrink: 0,
												overflow: 'hidden',
												border: `2px solid ${
													theme.palette.mode === 'dark'
														? 'rgba(0, 212, 255, 0.3)'
														: 'rgba(0, 123, 255, 0.2)'
												}`,
												boxShadow:
													theme.palette.mode === 'dark'
														? '0 4px 15px rgba(0, 0, 0, 0.4)'
														: '0 4px 15px rgba(0, 0, 0, 0.1)',
												transition: 'all 0.25s ease',
												'&:hover': {
													transform: 'scale(1.08)',
													borderColor: theme.palette.primary.main,
													boxShadow:
														theme.palette.mode === 'dark'
															? '0 6px 20px rgba(0, 212, 255, 0.25)'
															: '0 6px 20px rgba(0, 123, 255, 0.2)',
												},
												'&:active': {
													transform: 'scale(0.95)',
												},
											}}
											onClick={() => {
												setGame(g)
												navigate(`/${g.name}/${g.id}`)
											}}
										>
											<img
												src={`${apiUrl}${g.image}`}
												alt={g.name}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
												}}
											/>
										</Box>
									))}
							</Box>
							<Box
								sx={{
									width: '100%',
									display: 'grid',
									gap: { xs: 1.5, sm: 2 },
									gridTemplateColumns: gridColumns,
									pb: 2,
								}}
							>
								{data
									?.filter(g => g.place == 'bot')
									.map((g, index) => {
										return (
											<Card
												sx={{
													borderRadius: '16px',
													boxShadow:
														theme.palette.mode === 'dark'
															? '0 4px 20px rgba(0, 0, 0, 0.5)'
															: '0 4px 20px rgba(0, 0, 0, 0.12)',
													overflow: 'hidden',
													cursor: 'pointer',
													transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
													'&:hover': {
														transform: 'translateY(-4px)',
														boxShadow:
															theme.palette.mode === 'dark'
																? '0 12px 30px rgba(0, 0, 0, 0.6)'
																: '0 12px 30px rgba(0, 0, 0, 0.18)',
													},
													'&:active': {
														transform: 'translateY(-1px)',
													},
												}}
												key={index}
											>
												<CardMedia
													onClick={() => {
														setGame(g)
														navigate(`/${g.name}/${g.id}`)
													}}
													sx={{
														width: '100%',
														objectFit: 'cover',
														objectPosition: 'center',
														aspectRatio: '1 / 1',
													}}
													component='img'
													image={`${apiUrl}${g.image}`}
													alt={g.id}
												/>
											</Card>
										)
									})}
							</Box>
						</>
					)}
				</>
			)}
		</>
	)
}

export default Games
