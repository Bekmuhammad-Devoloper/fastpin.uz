import { Box, Skeleton } from '@mui/material'

const AnnouncementsSkeleton = () => {
	return (
		<Box
			sx={{
				p: { xs: 1.5, sm: 2 },
				display: 'grid',
				gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
				gap: 2,
			}}
		>
			{Array.from(new Array(4)).map((_, i) => (
				<Box key={i}>
					<Skeleton
						variant='rectangular'
						animation='wave'
						sx={{
							height: 280,
							borderRadius: '16px 16px 0 0',
						}}
					/>
					<Skeleton
						variant='text'
						animation='wave'
						sx={{ mt: 1, mx: 1, borderRadius: 1 }}
					/>
					<Skeleton
						variant='text'
						animation='wave'
						width='70%'
						sx={{ mx: 1, mb: 1, borderRadius: 1 }}
					/>
				</Box>
			))}
		</Box>
	)
}

export default AnnouncementsSkeleton
