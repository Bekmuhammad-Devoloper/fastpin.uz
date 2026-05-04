import { alpha, Box, LinearProgress, Stack, Typography } from '@mui/material'

const StatusBar = ({
	label,
	count,
	total,
	color,
	icon,
}: {
	label: string
	count: number
	total: number
	color: string
	icon: React.ReactNode
}) => {
	const percent = total > 0 ? (count / total) * 100 : 0
	return (
		<Box sx={{ mb: 1.5 }}>
			<Stack
				direction='row'
				justifyContent='space-between'
				alignItems='center'
				mb={0.3}
			>
				<Stack direction='row' alignItems='center' spacing={0.5}>
					{icon}
					<Typography variant='body2' fontWeight={500}>
						{label}
					</Typography>
				</Stack>
				<Typography variant='body2' fontWeight={700} sx={{ color }}>
					{count}
				</Typography>
			</Stack>
			<LinearProgress
				variant='determinate'
				value={Math.min(percent, 100)}
				sx={{
					height: 8,
					borderRadius: 4,
					bgcolor: alpha('#000', 0.06),
					'& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: color },
				}}
			/>
			<Typography
				variant='caption'
				color='text.secondary'
				sx={{ mt: 0.3, display: 'block', textAlign: 'right' }}
			>
				{percent.toFixed(1)}%
			</Typography>
		</Box>
	)
}

export default StatusBar
