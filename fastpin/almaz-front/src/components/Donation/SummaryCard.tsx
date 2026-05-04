import { Card, CardContent, Stack, Typography } from "@mui/material"

const SummaryCard = ({
	icon,
	label,
	value,
	subLabel,
	gradient,
}: {
	icon: React.ReactNode
	label: string
	value: string
	subLabel?: string
	gradient: string
}) => (
	<Card
		elevation={4}
		sx={{
			flex: 1,
			minWidth: 140,
			borderRadius: 3,
			background: gradient,
			color: 'white',
		}}
	>
		<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
			<Stack direction='row' alignItems='center' spacing={1} mb={1}>
				{icon}
				<Typography variant='caption' fontWeight={600} sx={{ opacity: 0.9 }}>
					{label}
				</Typography>
			</Stack>
			<Typography variant='h6' fontWeight={700} lineHeight={1.2}>
				{value}
			</Typography>
			{subLabel && (
				<Typography variant='caption' sx={{ opacity: 0.8 }}>
					{subLabel}
				</Typography>
			)}
		</CardContent>
	</Card>
)
export default SummaryCard
