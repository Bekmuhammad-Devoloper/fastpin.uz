import { Box } from '@mui/material'

const statusConfig = {
	top: {
		label: 'TOP',
		bg: 'linear-gradient(135deg, #ff9a3c, #ff5e62)',
		color: '#fff',
		glow: '0 0 20px rgba(255, 94, 98, 0.6)',
		border: '1px solid rgba(255,255,255,0.18)',
	},
	sale: {
		label: 'SALE',
		bg: 'linear-gradient(135deg, #f56565, #c53030)',
		color: '#fff',
		glow: '0 0 24px rgba(245, 101, 101, 0.55)',
		border: '1px solid rgba(255,255,255,0.15)',
	},
	vip: {
		label: 'VIP',
		bg: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
		color: '#fff',
		glow: '0 0 22px rgba(167, 139, 250, 0.65)',
		border: '1px solid rgba(255,255,255,0.2)',
	},
}

type StatusType = 'vip' | 'sale' | 'top' | '' | '-'

const GameStatus = ({ status }: { status: StatusType }) => {
	if (!status || status === '-') return null

	const conf = statusConfig[status]

	return (
		<Box
			sx={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100px', 
				height: '100px',
				overflow: 'visible',
				pointerEvents: 'none',
				zIndex: 2,
			}}
		>
			<Box
				component='span'
				sx={{
					position: 'absolute',
					top: 0,
					left: 0,
					display: 'block',
					width: '140%', 
					padding: '6px 0',
					background: conf.bg,
					color: conf.color,
					fontWeight: 700,
					fontSize: '12px',
					textAlign: 'center',
					textTransform: 'uppercase',
					letterSpacing: '1px',
					transform: 'rotate(-45deg) translate(-70px, 15px)',
					transformOrigin: 'top left',
					boxShadow: conf.glow,
					border: conf.border,
					whiteSpace: 'nowrap',
				}}
			>
				{conf.label}
			</Box>
		</Box>
	)
}

export default GameStatus
