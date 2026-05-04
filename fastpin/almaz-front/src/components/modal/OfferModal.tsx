import { useEffect, useState } from 'react'
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
import LoadingProgress from '../Loading/LoadingProgress'
import { useOfferStoreModal } from '../../store/modal/useOfferModal'
import { createOffer, deleteOffer, updateOffer } from '../../api/games/offer'
import { useParams } from 'react-router-dom'
import { useIsAdmin } from '../../hooks/useIsAdmin'
const OfferModal = () => {
	const { t } = useTranslationStore()
	const { gameId } = useParams()
	const { token } = useTokenStore()
	const { isAdmin, isLoading } = useIsAdmin()
	const { modalOpen, selectedOffer, closeModal } = useOfferStoreModal()
	const [image, setImage] = useState<File | null>(null)
	const [status, setStatus] = useState<string>('')
	const [ruName, setRuName] = useState('')
	const [botId, setBotId] = useState('')
	const [uzName, setUzName] = useState('')
	const [price, setPrice] = useState('')
	const [superPrice, setSuperPrice] = useState('')
	const [ruDesc, setRuDesc] = useState('')
	const [uzDesc, setUzDesc] = useState('')
	const [previewImage, setPreviewImage] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (selectedOffer) {
			setStatus(selectedOffer.status)
			setImage(null)
			setRuName(selectedOffer.ruName)
			setBotId(selectedOffer.botId)
			setUzName(selectedOffer.uzName)
			setPrice(selectedOffer.price)
			setSuperPrice(selectedOffer.superPrice)
			setRuDesc(selectedOffer.ruDesc)
			setUzDesc(selectedOffer.uzDesc)
			setPreviewImage(selectedOffer.image)
		} else {
			setImage(null)
			setStatus('')
			setPreviewImage(null)
			setRuName('')
			setUzName('')
			setPrice('')
			setSuperPrice('')
			setRuDesc('')
			setUzDesc('')
			setBotId('')
		}
	}, [selectedOffer, modalOpen])
	useEffect(() => {
		if (image) {
			const url = URL.createObjectURL(image)
			setPreviewImage(url)
			return () => URL.revokeObjectURL(url)
		}
	}, [image])

	if (!isLoading && !isAdmin) return null
	if (!modalOpen) return null
	const onSubmit = async () => {
		const data = new FormData()
		data.append('token', token)
		data.append('status', status)
		data.append('ruName', ruName.trim())
		data.append('uzName', uzName.trim())
		data.append('ruDesc', ruDesc.trim())
		data.append('uzDesc', uzDesc.trim())
		data.append('price', price.trim())
		data.append('superPrice', superPrice.trim())
		data.append('botId', botId.trim())

		if (image) data.append('image', image)

		try {
			setLoading(true)
			if (selectedOffer) {
				data.append('id', selectedOffer.id.toString())
				data.append('gameId', selectedOffer.gameId)
				await updateOffer(data)
			} else {
				data.append('gameId', gameId!)
				await createOffer(data)
			}
			closeModal()
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	const onDelete = async () => {
		if (!selectedOffer) return
		try {
			setLoading(true)
			await deleteOffer({ token, id: selectedOffer.id })
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
						{selectedOffer ? t.update : t.add}
					</Typography>
					<TextField
						label={t.bot_id}
						value={botId}
						onChange={e => setBotId(e.target.value)}
						fullWidth
						variant='outlined'
						autoFocus
					/>
					<FormControl>
						<InputLabel variant='standard' htmlFor='uncontrolled-native'>
							{t.status}
						</InputLabel>
						<NativeSelect
							value={status}
							onChange={e => setStatus(e.target.value)}
							inputProps={{ id: 'place-native' }}
						>
							<option value='-'>{t.empty}</option>
							<option value='sale'>sale</option>
							<option value='top'>top</option>
							<option value='vip'>vip</option>
						</NativeSelect>
					</FormControl>
					<TextField
						label={t.title_ru}
						value={ruName}
						onChange={e => setRuName(e.target.value)}
						fullWidth
						variant='outlined'
					/>
					<TextField
						label={t.title_uz}
						value={uzName}
						onChange={e => setUzName(e.target.value)}
						fullWidth
						variant='outlined'
					/>

					<TextField
						label={t.description_ru}
						value={ruDesc}
						onChange={e => setRuDesc(e.target.value)}
						fullWidth
						variant='outlined'
					/>

					<TextField
						label={t.description_uz}
						value={uzDesc}
						onChange={e => setUzDesc(e.target.value)}
						fullWidth
						variant='outlined'
					/>

					<TextField
						label={t.user_price}
						value={price}
						onChange={e => setPrice(e.target.value)}
						fullWidth
						variant='outlined'
					/>
					<TextField
						label={t.selected_people_price}
						value={superPrice}
						onChange={e => setSuperPrice(e.target.value)}
						fullWidth
						variant='outlined'
					/>
					<Box>
						<Typography variant='subtitle1' gutterBottom>
							{t.image}
						</Typography>
						<Button
							variant='outlined'
							component='label'
							fullWidth
							sx={{ py: 2, textTransform: 'none' }}
						>
							{image ? image.name : t.upload_image}
							<input
								type='file'
								hidden
								accept='image/*'
								onChange={e => setImage(e.target.files?.[0] || null)}
							/>
						</Button>
						{previewImage && (
							<Box sx={{ textAlign: 'center', mt: 2 }}>
								<img
									src={previewImage}
									alt='Превью изображения'
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

					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							gap: 2,
							mt: 3,
						}}
					>
						{selectedOffer && (
							<Button
								variant='contained'
								color='error'
								onClick={onDelete}
								fullWidth
							>
								{t.delete}
							</Button>
						)}
						<Button
							variant='contained'
							color='primary'
							onClick={onSubmit}
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

export default OfferModal
