import FavoriteIcon from '@mui/icons-material/Favorite';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { Box, IconButton, Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getThumbnail } from 'api/api';

const ImageThumbnail = ({
	id,
	mediaType,
	isFavorite,
}: {
	id: string;
	mediaType?: string;
	isFavorite?: boolean;
}) => {
	const { data: url, isLoading } = useQuery({
		queryKey: ['getThumbnail', id],
		queryFn: () => getThumbnail(id),
		refetchOnWindowFocus: false,
	});

	return (
		<Box sx={{ width: '100%', aspectRatio: '1/1', position: 'relative' }}>
			{isLoading ? (
				<Skeleton variant="rectangular" width="100%" height="100%" />
			) : (
				<>
					<img
						src={url}
						alt="thumbnail"
						style={{
							width: '100%',
							aspectRatio: '1/1',
							objectFit: 'cover',
						}}
					/>
					{mediaType === 'video' && (
						<Box display="flex" alignItems="center">
							<IconButton
								sx={{
									position: 'absolute',
									top: 0,
									right: 0,
									color: 'white',
								}}
							>
								<PlayCircleIcon />
							</IconButton>
						</Box>
					)}
					{isFavorite && (
						<Box
							display="flex"
							alignItems="center"
							sx={{ position: 'relative' }}
						>
							<IconButton
								sx={{
									position: 'absolute',
									bottom: 6,
									left: -4,
									color: 'white',
								}}
							>
								<FavoriteIcon />
							</IconButton>
						</Box>
					)}
				</>
			)}
		</Box>
	);
};

export default ImageThumbnail;
