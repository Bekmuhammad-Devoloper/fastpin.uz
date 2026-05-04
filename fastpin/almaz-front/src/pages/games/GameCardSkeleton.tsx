import { Box, Skeleton, useMediaQuery, useTheme } from '@mui/material'

const GameCardSkeleton = () => {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const isDesctop = useMediaQuery(theme.breakpoints.down('md'))
	return (
		<Box
			sx={{
				width: '100%',
				display: 'grid',
				gap: 2,
				gridTemplateColumns: isMobile
					? '1fr 1fr'
					: isDesctop
						? '1fr 1fr 1fr'
						: '1fr 1fr 1fr 1fr',
			}}
		>
			{Array.from(new Array(4)).map((_, i) => (
				<Skeleton
					key={i}
					variant='rectangular'
					animation='wave'
					width={'100%'}
					height={300}
				/>
			))}
		</Box>
	)
}

export default GameCardSkeleton
