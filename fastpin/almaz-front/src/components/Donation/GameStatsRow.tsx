import { alpha, Box, LinearProgress, Stack, Typography } from '@mui/material'
import { formatCurrency, type IStatsItem } from './func'
const GameStatsRow = ({
	name,
	stats,
	totalForPercent,
	color,
}: {
	name: string
	stats: IStatsItem
	totalForPercent: number
	color: string
}) => {
	const percent =
		totalForPercent > 0 ? (Math.abs(stats.total) / totalForPercent) * 100 : 0
	return (
		<Box sx={{ mb: 1.5 }}>
			<Stack
				direction='row'
				justifyContent='space-between'
				alignItems='center'
				mb={0.3}
			>
				<Typography variant='body2' fontWeight={500} noWrap sx={{ flex: 1 }}>
					{name}
				</Typography>
				<Typography variant='body2' fontWeight={700} color={color} ml={1}>
					{formatCurrency(stats.total)}
				</Typography>
			</Stack>
			<Stack direction='row' alignItems='center' spacing={1}>
				<LinearProgress
					variant='determinate'
					value={Math.min(percent, 100)}
					sx={{
						flex: 1,
						height: 6,
						borderRadius: 3,
						bgcolor: alpha('#000', 0.06),
					}}
					color={percent >= 30 ? 'error' : percent >= 20 ? 'warning' : 'info'}
				/>
				<Typography
					variant='caption'
					color='text.secondary'
					sx={{ minWidth: 60, textAlign: 'right' }}
				>
					{stats.count} ta · {percent.toFixed(1)}%
				</Typography>
			</Stack>
		</Box>
	)
}
export default GameStatsRow
