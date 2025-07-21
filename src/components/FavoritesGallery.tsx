import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import {
	Button,
	Dialog,
	DialogActions,
	DialogTitle,
	Divider,
	Grid,
	Tooltip,
	Typography,
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';
import { IThumbnail } from 'types/types';

import {
	fetchFavoritesIds,
	removeFavorites,
} from '../api/api';
import GalleryItemPaper from './GalleryItemPaper';
import Loading from './Loading';
import Preview from './Preview';

export const FavoritesGallery: React.FC = () => {
	const [previewOpen, setPreviewOpen] = useState(false);
	const [currentImage, setCurrentImage] = useState<number | null>(null);
	const [selectedImages, setSelectedImages] = useState<string[]>([]); // <-- add this
	const { ref, inView } = useInView();

	const queryClient = useQueryClient();

	const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
		queryKey: ['fetchFavoritesIds'],
		queryFn: fetchFavoritesIds,
		initialPageParam: '',
		getNextPageParam: (lastPage) => lastPage.lastId || null,
	});

	// mutation for restoring trashed objects
	const unfavoritesMutation = useMutation({
		mutationFn: removeFavorites,
		onSuccess: () => {
			toast.success('Object(s) removed from favorites successfully.');
		},
		onError: (error) => {
			toast.error(`Something went wrong: ${error.message}`);
		},
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

	const toggleSelectImage = (id: string) => {
		setSelectedImages((prev) =>
			prev.includes(id) ? prev.filter((imgId) => imgId !== id) : [...prev, id]
		);
	};

	const handleClearSelection = () => setSelectedImages([]);

	// tuka
	// and clear selection

	const handleUnfavorites = () => {
		unfavoritesMutation.mutate(
			{ objectIds: selectedImages },
			{
				onSuccess: () => {
					handleClearSelection();
					queryClient.invalidateQueries({ queryKey: ['fetchFavoritesIds'] });
				},
			}
		);
	};

	const theme = useTheme();

	const [openUnfavoriteDialog, setOpenUnfavoriteDialog] = useState(false);

	return (
		<>
			{/* Selection Toolbar */}
			<Slide
				direction="down"
				in={selectedImages.length > 0}
				mountOnEnter
				unmountOnExit
			>
				<AppBar
					position="fixed"
					color="default"
					elevation={2}
					sx={{
						top: 0,
						left: 0,
						right: 0,
						background: theme.palette.background.paper,
						borderBottom: '1px solid #eee',
						zIndex: theme.zIndex.drawer + 2,
					}}
				>
					<Toolbar>
						<IconButton
							edge="start"
							color="inherit"
							onClick={handleClearSelection}
						>
							<CloseIcon />
						</IconButton>
						<Typography sx={{ flexGrow: 1, fontWeight: 600 }}>
							{selectedImages.length} selected
						</Typography>
						<Tooltip title="Remove from Favorites">
							<IconButton
								color="inherit"
								onClick={() => setOpenUnfavoriteDialog(true)}
							>
								<CancelIcon />
							</IconButton>
						</Tooltip>
						<Dialog
							open={openUnfavoriteDialog}
							onClose={() => setOpenUnfavoriteDialog(false)}
							aria-labelledby="unfavorite-dialog-title"
							aria-describedby="unfavorite-dialog-description"
						>
							<DialogTitle
								id="unfavorite-dialog-title"
								sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
							>
								<CancelIcon sx={{ fontSize: 32 }} />
								Remove from favororites {selectedImages.length}{' '}
								{selectedImages.length === 1 ? 'item' : 'items'}?
							</DialogTitle>
							<Typography
								id="unfavorite-dialog-description"
								sx={{ px: 3, pb: 1, color: 'text.secondary' }}
							>
								This action will remove from favororites the selected{' '}
								{selectedImages.length === 1 ? 'item' : 'items'}.
							</Typography>
							<DialogActions>
								<Button
									onClick={() => setOpenUnfavoriteDialog(false)}
									variant="outlined"
								>
									Cancel
								</Button>
								<Button
									onClick={() => {
										handleUnfavorites();
										setOpenUnfavoriteDialog(false);
									}}
									variant="contained"
								>
									Remove from Favorites
								</Button>
							</DialogActions>
						</Dialog>
					</Toolbar>
				</AppBar>
			</Slide>

			<Divider sx={{ mb: 2 }} />
			<Box sx={{ mt: 3 }} />
			<Grid container spacing={1} columns={{ xs: 3, sm: 4, lg: 6, xl: 8 }}>
				{hasImages &&
					data.pages
						.map((page) => page.properties)
						.flat()
						.map((thumbnail: IThumbnail, index) => (
							<Grid
								item
								xs={1}
								key={thumbnail.id}
								sx={{ position: 'relative' }}
							>
								<GalleryItemPaper
									selected={selectedImages.includes(thumbnail.id)}
									onSelect={(e) => {
										e.stopPropagation();
										toggleSelectImage(thumbnail.id);
									}}
									onPreview={() => openPreview(index)}
									thumbnail={thumbnail}
								/>
							</Grid>
						))}
			</Grid>

			{!isLoading && !hasImages && (
				<Typography color="text.secondary" gutterBottom sx={{ mt: 2 }}>
					<FavoriteBorderIcon sx={{ fontSize: 28, verticalAlign: 'middle' }} />{' '}
					No favorites
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
