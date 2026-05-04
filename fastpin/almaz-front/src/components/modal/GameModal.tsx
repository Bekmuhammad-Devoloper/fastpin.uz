import { useEffect, useState } from 'react'
import { useGamesStoreModal } from '../../store/modal/useGameModal'
import {
	Box,
	Button,
	Dialog,
	FormControl,
	InputLabel,
	NativeSelect,
	TextField,
	Typography,
} from '@mui/material'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { useTokenStore } from '../../store/token/useTokenStore'
import { createGame, deleteGame, updateGame } from '../../api/games/games'
import LoadingProgress from '../Loading/LoadingProgress'
const GameModal = () => {
	const { t } = useTranslationStore()
	const { token } = useTokenStore()
	const { modalOpen, selectedGame, closeModal } = useGamesStoreModal()
	const [name, setName] = useState('')
	const [howToUseUz, setHowToUseUz] = useState('')
	const [howToUseRu, setHowToUseRu] = useState('')
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [imageHelperFile, setImageHelperFile] = useState<File | null>(null)
	const [videoFile, setVideoFile] = useState<File | null>(null)
	const [fieldsCount, setFieldsCount] = useState<'one' | 'two'>('one')
	const [previewMain, setPreviewMain] = useState<string | null>(null)
	const [previewHelper, setPreviewHelper] = useState<string | null>(null)
	const [previewVideo, setPreviewVideo] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [place, setIsPlace] = useState<string>('top')
	useEffect(() => {
		if (selectedGame) {
			setName(selectedGame.name || '')
			setFieldsCount(selectedGame.description || 'one')
			setHowToUseUz(selectedGame.howToUseUz || '')
			setHowToUseRu(selectedGame.howToUseRu || '')
			setPreviewMain(selectedGame.image || null)
			setPreviewHelper(selectedGame.helpImage || null)
			setPreviewVideo(selectedGame.video || null)
			setImageFile(null)
			setImageHelperFile(null)
			setVideoFile(null)
			setIsPlace(selectedGame.place)
		} else {
			setName('')
			setHowToUseUz('')
			setFieldsCount('one')
			setHowToUseRu('')
			setPreviewMain(null)
			setPreviewHelper(null)
			setPreviewVideo(null)
			setImageFile(null)
			setImageHelperFile(null)
			setVideoFile(null)
			setIsPlace('top')
		}
	}, [selectedGame, modalOpen])

	useEffect(() => {
		if (imageFile) {
			const url = URL.createObjectURL(imageFile)
			setPreviewMain(url)
			return () => URL.revokeObjectURL(url)
		}
	}, [imageFile])

	useEffect(() => {
		if (imageHelperFile) {
			const url = URL.createObjectURL(imageHelperFile)
			setPreviewHelper(url)
			return () => URL.revokeObjectURL(url)
		}
	}, [imageHelperFile])

	useEffect(() => {
		if (videoFile) {
			const url = URL.createObjectURL(videoFile)
			setPreviewVideo(url)
			return () => URL.revokeObjectURL(url)
		}
	}, [videoFile])

	const onSubmit = async () => {
		if (!name.trim()) return
		const data = new FormData()
		data.append('token', token)
		data.append('name', name.trim())
		data.append('howToUseUz', howToUseUz.trim())
		data.append('howToUseRu', howToUseRu.trim())
		data.append('place', place.trim())
		data.append('description', fieldsCount)
		if (imageFile) data.append('image', imageFile)
		if (imageHelperFile) data.append('helpImage', imageHelperFile)
		if (videoFile) data.append('video', videoFile)

		try {
			setLoading(true)
			if (selectedGame) {
				data.append('id', selectedGame.id.toString())
				await updateGame(data)
			} else {
				await createGame(data)
			}
			closeModal()
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	const onDelete = async () => {
		if (!selectedGame) return

		try {
			setLoading(true)
			await deleteGame({ token, id: selectedGame.id })
			closeModal()
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			{loading && <LoadingProgress />}
			<Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth='sm'>
				<Box
					sx={{
						p: { xs: 3, sm: 4 },
						display: 'flex',
						flexDirection: 'column',
						gap: 3,
					}}
				>
					<Typography variant='h5' textAlign='center' fontWeight='bold'>
						{selectedGame ? t.update_game : t.add_game}
					</Typography>

					<FormControl fullWidth>
						<InputLabel variant='standard' htmlFor='uncontrolled-native'>
							{t.place}
						</InputLabel>
						<NativeSelect
							value={place}
							onChange={e => setIsPlace(e.target.value)}
							inputProps={{ id: 'place-native' }}
						>
							<option value='top'>{t.top}</option>
							<option value='bot'>{t.bottom}</option>
							<option value='stop'>{t.stop}</option>
						</NativeSelect>
					</FormControl>
					<NativeSelect
						value={fieldsCount}
						onChange={e => setFieldsCount(e.target.value as 'one' | 'two')}
					>
						<option value='one'>{t.one_field}</option>
						<option value='two'>{t.two_fields}</option>
					</NativeSelect>

					<TextField
						label={t.name}
						value={name}
						sx={{ whiteSpace: 'pre-line' }}
						onChange={e => setName(e.target.value)}
						fullWidth
						variant='outlined'
						autoFocus
					/>

					<TextField
						label='Как использовать (UZ)'
						value={howToUseUz}
						sx={{ whiteSpace: 'pre-line' }}
						onChange={e => setHowToUseUz(e.target.value)}
						fullWidth
						multiline
						rows={4}
						variant='outlined'
					/>

					<TextField
						label='Как использовать (RU)'
						value={howToUseRu}
						sx={{ whiteSpace: 'pre-line' }}
						onChange={e => setHowToUseRu(e.target.value)}
						fullWidth
						multiline
						rows={4}
						variant='outlined'
					/>

					<Box>
						<Typography variant='subtitle1' gutterBottom>
							{t.main_image}
						</Typography>
						<Button
							variant='outlined'
							component='label'
							fullWidth
							sx={{ py: 2, textTransform: 'none' }}
						>
							{imageFile ? imageFile.name : t.upload_image}
							<input
								type='file'
								hidden
								accept='image/*'
								onChange={e => setImageFile(e.target.files?.[0] || null)}
							/>
						</Button>
						{previewMain && (
							<Box sx={{ textAlign: 'center', mt: 2 }}>
								<img
									src={previewMain}
									alt={t.main_image}
									style={{
										maxWidth: '100%',
										maxHeight: '300px',
										borderRadius: '12px',
										boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
									}}
								/>
							</Box>
						)}
					</Box>

					<Box>
						<Typography variant='subtitle1' gutterBottom>
							{t.auxiliary_image_instruction}
						</Typography>
						<Button
							variant='outlined'
							component='label'
							fullWidth
							sx={{ py: 2, textTransform: 'none' }}
						>
							{imageHelperFile ? imageHelperFile.name : t.upload_image}
							<input
								type='file'
								hidden
								accept='image/*'
								onChange={e => setImageHelperFile(e.target.files?.[0] || null)}
							/>
						</Button>
						{previewHelper && (
							<Box sx={{ textAlign: 'center', mt: 2 }}>
								<img
									src={previewHelper}
									alt={t.auxiliary_image_instruction}
									style={{
										maxWidth: '100%',
										maxHeight: '300px',
										borderRadius: '12px',
										boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
									}}
								/>
							</Box>
						)}
					</Box>

					<Box>
						<Typography variant='subtitle1' gutterBottom>
							{t.video}
						</Typography>

						<Button
							variant='outlined'
							component='label'
							fullWidth
							sx={{ py: 2, textTransform: 'none' }}
						>
							{videoFile ? videoFile.name : 'Загрузить видео или WebP'}
							<input
								type='file'
								hidden
								accept='video/*,image/webp'
								onChange={e => setVideoFile(e.target.files?.[0] || null)}
							/>
						</Button>

						{previewVideo && videoFile && (
							<Box sx={{ textAlign: 'center', mt: 2 }}>
								{videoFile.type.startsWith('video/') ? (
									<video
										src={previewVideo}
										controls
										style={{
											maxWidth: '100%',
											maxHeight: '300px',
											borderRadius: '12px',
											boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
										}}
									/>
								) : (
									<img
										src={previewVideo}
										alt='preview'
										style={{
											maxWidth: '100%',
											maxHeight: '300px',
											borderRadius: '12px',
											boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
										}}
									/>
								)}
							</Box>
						)}
					</Box>

					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							gap: 2,
							mt: 3,
						}}
					>
						{selectedGame && (
							<Button
								variant='contained'
								color='error'
								onClick={onDelete}
								fullWidth
							>
								{t.delete_game}
							</Button>
						)}
						<Button
							variant='contained'
							color='primary'
							onClick={onSubmit}
							disabled={!name.trim()}
							fullWidth
						>
							{t.save}
						</Button>
					</Box>
				</Box>
			</Dialog>
		</>
	)
}

export default GameModal
