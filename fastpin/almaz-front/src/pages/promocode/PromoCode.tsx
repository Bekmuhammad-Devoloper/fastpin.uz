import {
	Box,
	Button,
	TextField,
	MenuItem,
	useTheme,
	Typography,
} from '@mui/material'
import Header from '../../components/Header/Header'
import BottomNavigate from '../home/BottomNavigate'
import { useState } from 'react'
import { useTokenStore } from '../../store/token/useTokenStore'
import { createPromocode } from '../../api/promocode/promocode'
import { useTranslationStore } from '../../store/language/useTranslationStore'

const PromoCode = () => {
	const theme = useTheme()
	const { t } = useTranslationStore()
	const { token } = useTokenStore()
	const [code, setCode] = useState('')
	const [expiresAt, setExpiresAt] = useState('')
	const [usageLimit, setUsageLimit] = useState<number>()
	const [usagePerUser, setUsagePerUser] = useState<number>()
	const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed')
	const [discount, setDiscount] = useState<number | ''>('')
	const [maxDiscount, setMaxDiscount] = useState<number | ''>('')
	const [minPrice, setMinPrice] = useState<number | ''>('')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setMessage(null)
		setError(null)
		if (!code.trim()) {
			setError(t.enter_promo_code)
			return
		}
		if (!discount || discount <= 0) {
			setError(t.discount_must_be_greater_than_zero)
			return
		}
		if (discountType === 'percent' && discount > 100) {
			setError(t.percentage_discount_cannot_exceed_100)
			return
		}

		const expiresAtDate = expiresAt ? new Date(expiresAt) : undefined
		if (expiresAt && isNaN(expiresAtDate!.getTime())) {
			setError(t.invalid_end_date)
			return
		}

		setLoading(true)

		try {
			await createPromocode({
				token,
				code: code.trim().toUpperCase(),
				expiresAt: expiresAtDate!,
				usageLimit: usageLimit || 999,
				usagePerUser: usagePerUser || 999,
				discountType,
				discount: Number(discount),
				maxDiscount: Number(maxDiscount),
				minPrice: Number(minPrice),
			})

			setMessage(t.promo_code_created_successfully)
			setCode('')
			setExpiresAt('')
			setUsageLimit(0)
			setUsagePerUser(0)
			setDiscount('')
			setMaxDiscount('')
			setMinPrice('')
			setDiscountType('fixed')
		} catch (err: any) {
			setError(t.error_creating_promo_code)
			alert(err)
		} finally {
			setLoading(false)
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
				component='form'
				onSubmit={handleSubmit}
				sx={{
					p: 3,
					maxWidth: 480,
					mx: 'auto',
					display: 'flex',
					flexDirection: 'column',
					gap: 2.5,
					mt: 2,
				}}
			>
				<Typography
					variant='h5'
					align='center'
					gutterBottom
					sx={{ color: 'white' }}
				>
					{t.create_promo_code}
				</Typography>

				<TextField
					label={t.promo_code}
					value={code}
					onChange={e => setCode(e.target.value)}
					fullWidth
					required
					inputProps={{ style: { textTransform: 'uppercase' } }}
				/>

				<TextField
					label={t.discount}
					type='number'
					value={discount}
					onChange={e =>
						setDiscount(e.target.value ? Number(e.target.value) : '')
					}
					fullWidth
					required
					inputProps={{ min: 1 }}
				/>

				<TextField
					select
					label={t.discount_type}
					value={discountType}
					onChange={e => setDiscountType(e.target.value as 'percent' | 'fixed')}
					fullWidth
				>
					<MenuItem value='fixed'>{t.fixed_amount}</MenuItem>
					<MenuItem value='percent'>{t.percentage}</MenuItem>
				</TextField>

				<TextField
					label={t.max_discount_amount_percent_only}
					type='number'
					value={maxDiscount}
					onChange={e =>
						setMaxDiscount(e.target.value ? Number(e.target.value) : '')
					}
					fullWidth
					disabled={discountType === 'fixed'}
					helperText={
						discountType === 'fixed'
							? t.not_applicable
							: t.discount_limit_in_money
					}
				/>

				<TextField
					label={t.min_order_amount}
					type='number'
					value={minPrice}
					onChange={e =>
						setMinPrice(e.target.value ? Number(e.target.value) : '')
					}
					fullWidth
				/>

				<TextField
					label={t.end_date_optional}
					type='datetime-local'
					value={expiresAt}
					onChange={e => setExpiresAt(e.target.value)}
					fullWidth
					InputLabelProps={{ shrink: true }}
				/>

				<TextField
					label={t.total_usage_limit}
					type='number'
					value={usageLimit}
					onChange={e => setUsageLimit(Number(e.target.value))}
					fullWidth
				/>

				<TextField
					label={t.usage_limit_per_user}
					type='number'
					value={usagePerUser}
					onChange={e => setUsagePerUser(Number(e.target.value))}
					fullWidth
				/>

				{error && (
					<Typography color='error' variant='body2' align='center'>
						{error}
					</Typography>
				)}

				{message && (
					<Typography
						color='success.main'
						variant='body1'
						align='center'
						fontWeight='medium'
					>
						{message}
					</Typography>
				)}

				<Button
					type='submit'
					variant='contained'
					color='primary'
					size='large'
					disabled={loading}
					sx={{ mt: 2, py: 1.5 }}
				>
					{loading ? t.loading : t.create_promo_code_action}
				</Button>
			</Box>

			<BottomNavigate />
		</Box>
	)
}

export default PromoCode
