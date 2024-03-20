import { Box, Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getThumbnail } from 'api/api';

const ImageThumbnail = ({ id }: { id: string }) => {
	const { data: url, isLoading } = useQuery({
		queryKey: ['getThumbnail', id],
		queryFn: () => getThumbnail(id),
		refetchOnWindowFocus: false,
	});

	return (
		<Box sx={{width: "100%", aspectRatio: '1/1'}}>
			{isLoading ? (
				<Skeleton variant="rectangular" width="100%" height="100%" />
			) : (
				<img
					src={url}
					alt="thumbnail"
					style={{
						width: '100%',
						aspectRatio: '1/1',
						objectFit: 'cover',
					}}
				/>
			)}
		</Box>
	);
};

export default ImageThumbnail;
