import { Divider, Grid, Paper, Typography } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { IThumbnail } from 'types/types';

import { fetchImageIds } from '../api/api';
import ImageThumbnail from './ImageThumbnail';
import Loading from './Loading';
import Preview from './Preview';

export const ImageGallery: React.FC = () => {
	const [previewOpen, setPreviewOpen] = useState(false);
	const [currentImage, setCurrentImage] = useState<number | null>(null);
	const { ref, inView } = useInView();

	const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
		queryKey: ['fetchIds'],
		queryFn: fetchImageIds,
		initialPageParam: '',
		getNextPageParam: (lastPage) => lastPage.lastId || null,
	});

	const lastId = data?.pages.slice(-1)[0].lastId;
	const imageIds = data?.pages.map((page) => page.properties).flat();
	const lastImage = data?.pages.slice(-1)[0].properties?.slice(-1)[0].id;
	const numberOfImages = imageIds?.length || 0;
	const hasNewPage = hasNextPage && lastImage !== lastId;
	const hasImages = data?.pages && data?.pages[0].properties?.length > 0;

	useEffect(() => {
		if (inView && hasNewPage) {
			fetchNextPage();
		}
	}, [inView]);

	const openPreview = (index: number) => {
		setCurrentImage(index);
		setPreviewOpen(true);
	};

	const closePreview = () => {
		setCurrentImage(null);
		setPreviewOpen(false);
	};

	// if there is no previous image
	const disablePrevButton = currentImage === 0;

	// if there is no next image
	const disableNextButton = currentImage === numberOfImages - 1 && !hasNewPage;

	const handleNext = () => {
		if (disableNextButton) return;
		if (currentImage && currentImage >= numberOfImages - 2 && hasNewPage) {
			fetchNextPage();
		}
		setCurrentImage((prev) => (prev ? prev + 1 : 1));
	};

	const handlePrev = () => {
		if (currentImage === 0) {
			return;
		}
		setCurrentImage((prev) => (prev ? prev - 1 : 0));
	};

	return (
		<>
			<Divider sx={{ mb: 2 }} />
			<Typography
				color="text.primary"
				variant="h5"
				gutterBottom
				sx={{ fontWeight: 700 }}
			>
				Gallery
			</Typography>
			<Grid container spacing={1} columns={{ xs: 3, sm: 4, lg: 6, xl: 8 }}>
				{hasImages &&
					data.pages
						.map((page) => page.properties)
						.flat()
						.map((thumbnail: IThumbnail, index) => (
							<Grid item xs={1} key={thumbnail.id}>
								<Paper elevation={0} onClick={() => openPreview(index)}>									
								<ImageThumbnail id={thumbnail.id} mediaType={thumbnail.mediaType} />
								</Paper>
							</Grid>
						))}
			</Grid>

			{!isLoading && !hasImages && (
				<Typography color="text.secondary" gutterBottom sx={{ mt: 3 }}>
					The gallery has no images. Please upload images.{' '}
				</Typography>
			)}
			{isLoading && <Loading />}
			{currentImage !== null && imageIds && (
				<Preview
					isOpen={previewOpen}
					onClose={closePreview}
					handleNext={handleNext}
					handlePrev={handlePrev}
					media={imageIds[currentImage]}
					disablePrevButton={disablePrevButton}
					disableNextButton={disableNextButton}
				/>
			)}
			<Typography
				ref={ref}
				color="text.primary"
				gutterBottom
				sx={{ fontWeight: 600 }}
			></Typography>
		</>
	);
};
