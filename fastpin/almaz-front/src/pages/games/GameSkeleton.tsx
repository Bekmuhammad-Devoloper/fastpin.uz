import { Box, Skeleton } from '@mui/material'

const GameSkeleton = () => {
	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'start',
				gap: 1.5,
				width: '100%',
				overflowX: 'auto',
				py: 2,
				scrollbarWidth: 'none',
				'&::-webkit-scrollbar': { display: 'none' },
			}}
		>
			{Array.from(new Array(5)).map((_, index) => (
				<Skeleton
					key={index}
					variant='rectangular'
					animation='wave'
					sx={{
						width: 80,
						height: 80,
						borderRadius: '18px',
						flexShrink: 0,
					}}
				/>
			))}
		</Box>
	)
}

export default GameSkeleton
