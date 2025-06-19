import CloseIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestoreIcon from '@mui/icons-material/Restore';
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

import {
	emptyTrash,
	fetchTrashedIds,
	trashDeletePermamnentObjects,
	trashRestoreObjects,
} from '../api/api';
import ImageThumbnail from './ImageThumbnail';
import Loading from './Loading';
import Preview from './Preview';
import SelectImageButton from './SelectImageButton';

export const TrashGallery: React.FC = () => {
	const [previewOpen, setPreviewOpen] = useState(false);
	const [currentImage, setCurrentImage] = useState<number | null>(null);
	const [selectedImages, setSelectedImages] = useState<string[]>([]); // <-- add this
	const { ref, inView } = useInView();

	const queryClient = useQueryClient();

	const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
		queryKey: ['fetchTrashedMediaIds'],
		queryFn: fetchTrashedIds,
		initialPageParam: '',
		getNextPageParam: (lastPage) => lastPage.lastId || null,
	});

	// mutation for restoring trashed objects
	const trashRestoreMutation = useMutation({
		mutationFn: trashRestoreObjects,
		onSuccess: () => {
			toast.success('Object(s) restored successfully.');
		},
		onError: (error) => {
			toast.error(`Something went wrong: ${error.message}`);
		},
	});

	// mutation for restoring trashed objects
	const trashDeletePermamnentMutation = useMutation({
		mutationFn: trashDeletePermamnentObjects,
		onSuccess: () => {
			toast.success('Object(s) deleted permanently successfully.');
		},
		onError: (error) => {
			toast.error(`Something went wrong: ${error.message}`);
		},
	});

	const trashEmptyMutation = useMutation({
		mutationFn: emptyTrash,
		onSuccess: () => {
			toast.success('Object(s) trashed successfully.');
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
	const handleDeletePermanent = () => {
		trashDeletePermamnentMutation.mutate(
			{ objectIds: selectedImages },
			{
				onSuccess: () => {
					handleClearSelection();
					queryClient.invalidateQueries({ queryKey: ['fetchTrashedMediaIds'] });
				},
			}
		);
	};

	const handleRestore = () => {
		trashRestoreMutation.mutate(
			{ objectIds: selectedImages },
			{
				onSuccess: () => {
					handleClearSelection();
					queryClient.invalidateQueries({ queryKey: ['fetchTrashedMediaIds'] });
				},
			}
		);
	};

	const handleEmptyTrash = () => {
		trashEmptyMutation.mutate(undefined, {
			onSuccess: () => {
				handleClearSelection();
				queryClient.invalidateQueries({ queryKey: ['fetchTrashedMediaIds'] });
			},
		});
	};

	const theme = useTheme();

	const [openDeletePermanentDialog, setOpenDeletePermanentDialog] =
		useState(false);
	const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
	const [openEmptyTrashDialog, setOpenEmptyTrashDialog] = useState(false);

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
						<Tooltip title="Restore">
							<IconButton
								color="inherit"
								onClick={() => setOpenRestoreDialog(true)}
							>
								<RestoreIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title="Delete Permanently">
							<IconButton
								color="inherit"
								onClick={() => setOpenDeletePermanentDialog(true)}
							>
								<DeleteForeverIcon />
							</IconButton>
						</Tooltip>
						<Dialog
							open={openDeletePermanentDialog}
							onClose={() => setOpenDeletePermanentDialog(false)}
							aria-labelledby="delete-dialog-title"
							aria-describedby="delete-dialog-description"
						>
							<DialogTitle
								id="delete-dialog-title"
								sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
							>
								<DeleteForeverIcon color="error" sx={{ fontSize: 32 }} />
								Delete {selectedImages.length}{' '}
								{selectedImages.length === 1 ? 'item' : 'items'}?
							</DialogTitle>
							<Typography
								id="delete-dialog-description"
								sx={{ px: 3, pb: 1, color: 'text.secondary' }}
							>
								This action will delete permanenty the selected{' '}
								{selectedImages.length === 1 ? 'item' : 'items'}.
							</Typography>
							<DialogActions>
								<Button
									onClick={() => setOpenDeletePermanentDialog(false)}
									variant="outlined"
								>
									Cancel
								</Button>
								<Button
									onClick={() => {
										handleDeletePermanent();
										setOpenDeletePermanentDialog(false);
									}}
									color="error"
									variant="contained"
								>
									Delete Permanently
								</Button>
							</DialogActions>
						</Dialog>
						<Dialog
							open={openRestoreDialog}
							onClose={() => setOpenRestoreDialog(false)}
							aria-labelledby="restore-dialog-title"
							aria-describedby="restore-dialog-description"
						>
							<DialogTitle
								id="restore-dialog-title"
								sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
							>
								<RestoreIcon sx={{ fontSize: 32 }} />
								Restore {selectedImages.length}{' '}
								{selectedImages.length === 1 ? 'item' : 'items'}?
							</DialogTitle>
							<Typography
								id="restore-dialog-description"
								sx={{ px: 3, pb: 1, color: 'text.secondary' }}
							>
								This action will restore the selected{' '}
								{selectedImages.length === 1 ? 'item' : 'items'}.
							</Typography>
							<DialogActions>
								<Button
									onClick={() => setOpenRestoreDialog(false)}
									variant="outlined"
								>
									Cancel
								</Button>
								<Button
									onClick={() => {
										handleRestore();
										setOpenRestoreDialog(false);
									}}
									variant="contained"
								>
									Restore
								</Button>
							</DialogActions>
						</Dialog>
					</Toolbar>
				</AppBar>
			</Slide>

			<Divider sx={{ mb: 2 }} />
			{!isLoading && hasImages && (
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						px: '10px',
					}}
				>
					<Box sx={{ color: 'text.primary' }}>
						Items in Trash will be permanently deleted after 60 days
					</Box>
					<Dialog
						open={openEmptyTrashDialog}
						onClose={() => setOpenEmptyTrashDialog(false)}
						aria-labelledby="empty-dialog-title"
						aria-describedby="empty-dialog-description"
					>
						<DialogTitle
							id="empty-dialog-title"
							sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
						>
							<DeleteForeverIcon color="error" sx={{ fontSize: 32 }} />
							Empty Trash?
						</DialogTitle>
						<Typography
							id="delete-dialog-description"
							sx={{ px: 3, pb: 1, color: 'text.secondary' }}
						>
							This action will delete permanenty all items in Trash.
						</Typography>
						<DialogActions>
							<Button
								onClick={() => setOpenEmptyTrashDialog(false)}
								variant="outlined"
							>
								Cancel
							</Button>
							<Button
								onClick={() => {
									handleEmptyTrash();
									setOpenEmptyTrashDialog(false);
								}}
								color="error"
								variant="contained"
							>
								Empty Trash
							</Button>
						</DialogActions>
					</Dialog>

					<Button
						variant="text"
						color="error"
						onClick={() => setOpenEmptyTrashDialog(true)}
						sx={{ textTransform: 'none', fontWeight: 600, pl: 0 }}
					>
						<IconButton color="error" sx={{ mr: 1 }}>
							<DeleteForeverIcon />
						</IconButton>
						Empty Trash
					</Button>
				</Box>
			)}

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
				<Typography color="text.secondary" gutterBottom sx={{ mt: 2 }}>
					<DeleteOutlineIcon sx={{ fontSize: 28, verticalAlign: 'middle' }} />{' '}
					Trash is empty
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
