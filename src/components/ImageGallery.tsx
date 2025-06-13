import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import {
	Button,
	Dialog,
	DialogActions,
	DialogTitle,
	Divider,
	Grid,
	Paper,
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

import { downloadObjectsAsZip, fetchImageIds, trashObjects } from '../api/api';
import ImageThumbnail from './ImageThumbnail';
import Loading from './Loading';
import Preview from './Preview';
import SelectImageButton from './SelectImageButton';

export const ImageGallery: React.FC = () => {
	const [previewOpen, setPreviewOpen] = useState(false);
	const [currentImage, setCurrentImage] = useState<number | null>(null);
	const [selectedImages, setSelectedImages] = useState<string[]>([]); // <-- add this
	const { ref, inView } = useInView();

	const queryClient = useQueryClient();

	const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
		queryKey: ['fetchIds'],
		queryFn: fetchImageIds,
		initialPageParam: '',
		getNextPageParam: (lastPage) => lastPage.lastId || null,
	});

	const trashObjectMutation = useMutation({
		mutationFn: trashObjects,
		onSuccess: () => {
			toast.success('Object(s) trashed successfully.');
		},
		onError: (error) => {
			toast.error(`Something went wrong: ${error.message}`);
		},
	});

	const downloadObjectMutation = useMutation({
		mutationFn: downloadObjectsAsZip,
		onMutate: () => {
			toast.success('Prepare to download items(s)...');
		},
		onSuccess: () => {
			toast.success('Object(s) downloaded successfully.');
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
	const handleDelete = () => {
		trashObjectMutation.mutate(
			{ objectIds: selectedImages },
			{
				onSuccess: () => {
					handleClearSelection();
					queryClient.invalidateQueries({ queryKey: ['fetchIds'] }); // <-- refresh the gallery
				},
			}
		);
	};
	const handleDownload = () => {
		downloadObjectMutation.mutate(
			{ objectIds: selectedImages },
			{
				onSuccess: (href) => {
					// create "a" HTML element with href to file & click
					const link = document.createElement('a');
					link.href = href;
					link.setAttribute('download', 'files.zip'); //or any other extension
					document.body.appendChild(link);
					link.click();

					// clean up "a" element & remove ObjectURL
					document.body.removeChild(link);
					URL.revokeObjectURL(href);
				},
			}
		);
	};
	const theme = useTheme();

	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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
						<Tooltip title="Download">
							<IconButton color="inherit" onClick={handleDownload}>
								<DownloadIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title="Delete">
							<IconButton
								color="inherit"
								onClick={() => setOpenDeleteDialog(true)}
							>
								<DeleteIcon />
							</IconButton>
						</Tooltip>
						<Dialog
							open={openDeleteDialog}
							onClose={() => setOpenDeleteDialog(false)}
							aria-labelledby="delete-dialog-title"
							aria-describedby="delete-dialog-description"
						>
							<DialogTitle
								id="delete-dialog-title"
								sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
							>
								<DeleteIcon color="error" sx={{ fontSize: 32 }} />
								Delete {selectedImages.length}{' '}
								{selectedImages.length === 1 ? 'item' : 'items'}?
							</DialogTitle>
							<Typography
								id="delete-dialog-description"
								sx={{ px: 3, pb: 1, color: 'text.secondary' }}
							>
								This action will move the selected{' '}
								{selectedImages.length === 1 ? 'item' : 'items'} to trash. You
								can restore them from trash later.
							</Typography>
							<DialogActions>
								<Button
									onClick={() => setOpenDeleteDialog(false)}
									variant="outlined"
								>
									Cancel
								</Button>
								<Button
									onClick={() => {
										handleDelete();
										setOpenDeleteDialog(false);
									}}
									color="error"
									variant="contained"
								>
									Move to Trash
								</Button>
							</DialogActions>
						</Dialog>
					</Toolbar>
				</AppBar>
			</Slide>

			{selectedImages.length > 0 && <Toolbar />}

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
							<Grid
								item
								xs={1}
								key={thumbnail.id}
								sx={{ position: 'relative' }}
							>
								<Paper elevation={0}>
									<SelectImageButton
										selected={selectedImages.includes(thumbnail.id)}
										onClick={(e) => {
											e.stopPropagation();
											toggleSelectImage(thumbnail.id);
										}}
									/>
									<div onClick={() => openPreview(index)}>
										{selectedImages.includes(thumbnail.id) ? (
											<Box component="section" sx={{ p: 1.5 }}>
												<ImageThumbnail
													id={thumbnail.id}
													mediaType={thumbnail.mediaType}
												/>
											</Box>
										) : (
											<ImageThumbnail
												id={thumbnail.id}
												mediaType={thumbnail.mediaType}
											/>
										)}
									</div>
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
