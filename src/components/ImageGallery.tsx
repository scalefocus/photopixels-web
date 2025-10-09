import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
	Box,
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
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import { addObjectsToAlbum, bulkRemoveObjectsFromAlbum, getAlbumItems } from 'api/albumApi';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';
import { IThumbnail } from 'types/types';

import {
	addFavorites,
	downloadObjectsAsZip,
	fetchImageIds,
	removeFavorites,
	trashObjects,
} from '../api/api';
import AddToAlbumDialog from './Albums/AddToAlbumDialog';
import GalleryItemPaper from './GalleryItemPaper';
import Loading from './Loading';
import Preview from './Preview';

export const ImageGallery: React.FC<{ albumId?: string }> = ({ albumId }) => {
	const [previewOpen, setPreviewOpen] = useState(false);
	const [currentImage, setCurrentImage] = useState<number | null>(null);
	const [selectedImages, setSelectedImages] = useState<string[]>([]);
	const { ref, inView } = useInView();

	const queryClient = useQueryClient();

	const albumQueryFn = React.useCallback(() => {
		if (!albumId) throw new Error('Missing albumId');
		return getAlbumItems({ albumId });
	}, [albumId]);

	const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
		queryKey: ['fetchIds', albumId ?? null],
		queryFn: albumId ? albumQueryFn : fetchImageIds,
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

	const favoritesMutation = useMutation({
		mutationFn: addFavorites,
		onSuccess: () => {
			toast.success('Object(s) added to Favorites successfully.');
		},
		onError: (error) => {
			toast.error(`Something went wrong: ${error.message}`);
		},
	});

	const singleAddFavoritesMutation = useMutation({
		mutationFn: addFavorites,
	});

	const singleRemoveFavoritesMutation = useMutation({
		mutationFn: removeFavorites,
	});

	const addToAlbumMutation = useMutation({
		mutationFn: addObjectsToAlbum,
		onSuccess: () => {
			toast.success('The images has been added successfully to the album');
			setSelectedImages([]);
			setOpenAddToAlbumDialog(false);
			queryClient.invalidateQueries({ queryKey: ['fetchIds', albumId ?? null] });
		},
		onError: (error) => {
			toast.error(`Error adding object to the album: ${error?.message ?? 'Error'}`);
		},
	});

	const removeFromAlbumMutation = useMutation({
		mutationFn: bulkRemoveObjectsFromAlbum,
		onSuccess: () => {
			toast.success('Selected item(s) were removed from the album.');
			setSelectedImages([]);
			queryClient.invalidateQueries({ queryKey: ['fetchIds', albumId ?? null] });
		},
		onError: (error) => {
			toast.error(`Error removing from album: ${error?.message ?? 'Error'}`);
		},
	});

	const lastId = data?.pages.slice(-1)[0].lastId;
	const imageIds = data?.pages.map((page) => page.properties).flat();
	const lastImage = data?.pages.slice(-1)[0].properties?.slice(-1)[0]?.id;
	const numberOfImages = imageIds?.length || 0;
	const hasNewPage = hasNextPage && lastImage !== lastId;
	const hasImages = data?.pages && data?.pages[0].properties?.length > 0;

	useEffect(() => {
		if (inView && hasNewPage) {
			fetchNextPage();
		}
	}, [inView, hasNewPage, fetchNextPage]);

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
					queryClient.invalidateQueries({ queryKey: ['fetchIds', albumId ?? null] });
				},
			}
		);
	};
	const handleDownload = () => {
		downloadObjectMutation.mutate(
			{ objectIds: selectedImages },
			{
				onSuccess: ({ href, disposition }) => {
					// Extract filename from Content-Disposition header
					let filename = 'files.zip';
					if (disposition) {
						const match = disposition.match(
							/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
						);
						if (match && match[1])
							filename = match[1].replace(/['"]/g, '');
					}

					const link = document.createElement('a');
					link.href = href;
					link.setAttribute('download', filename);
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(href);
				},
			}
		);
	};
	const handleFavorites = () => {
		favoritesMutation.mutate(
			{ objectIds: selectedImages },
			{
				onSuccess: () => {
					handleClearSelection();
					queryClient.invalidateQueries({ queryKey: ['fetchIds', albumId ?? null] });
				},
			}
		);
	};
	const handleSingleFavorites = (id: string, actionAdd: boolean) => {
		if (actionAdd) {
			singleAddFavoritesMutation.mutate(
				{ objectIds: [id] },
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: ['fetchIds', albumId ?? null] });
					},
				}
			);
			return;
		}

		singleRemoveFavoritesMutation.mutate(
			{ objectIds: [id] },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ['fetchIds', albumId ?? null] });
				},
			}
		);
	};
	const theme = useTheme();

	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	const [openAddToAlbumDialog, setOpenAddToAlbumDialog] = React.useState(false);

	const handleAddToAlbum = (albumIdToAdd: string) => {
		if (selectedImages.length === 0) return;
		addToAlbumMutation.mutate({ albumId: albumIdToAdd, objectIds: selectedImages });
	};

	const handleRemoveFromAlbum = () => {
		if (!albumId || selectedImages.length === 0) return;
		removeFromAlbumMutation.mutate({ albumId, objectIds: selectedImages });
	};

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
						<Tooltip title="Add to Favorites">
							<IconButton color="inherit" onClick={handleFavorites}>
								<FavoriteIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title="Download">
							<IconButton color="inherit" onClick={handleDownload}>
								<DownloadIcon />
							</IconButton>
						</Tooltip>
						{albumId && (
							<Tooltip title="Remove from album">
								<span>
									<IconButton
										color="inherit"
										onClick={handleRemoveFromAlbum}
										disabled={removeFromAlbumMutation.isPending}
										aria-label="Remove from album"
									>
										<RemoveCircleOutlineIcon />
									</IconButton>
								</span>
							</Tooltip>
						)}
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

			<Divider sx={{ mb: 2 }} />

			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					mb: 1,
				}}
			>
				<Typography color="text.primary" variant="h5" sx={{ fontWeight: 700 }}>
					Gallery
				</Typography>

				{selectedImages.length > 0 && !albumId && (
					<Tooltip
						title="Add to Album"
					>
						<span>
							<Button
								variant="outlined"
								startIcon={<LibraryAddIcon />}
								disabled={addToAlbumMutation.isPending}
								onClick={() => setOpenAddToAlbumDialog(true)}
							>
								Add to Album
							</Button>
						</span>
					</Tooltip>
				)}
			</Box>

			<Grid container spacing={1} columns={{ xs: 3, sm: 4, lg: 6, xl: 8 }}>
				{hasImages &&
					!trashObjectMutation.isPending &&
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
									handleSingleFavorites={handleSingleFavorites}
								/>
							</Grid>
						))}
			</Grid>

			{!isLoading && !hasImages && (
				<Typography color="text.secondary" gutterBottom sx={{ mt: 3 }}>
					The gallery has no media objects. Please upload media object.{' '}
				</Typography>
			)}
			{(isLoading || trashObjectMutation.isPending) && <Loading />}
			{currentImage !== null && imageIds && (
				<Preview
					isOpen={previewOpen}
					onClose={closePreview}
					handleNext={handleNext}
					handlePrev={handlePrev}
					media={imageIds[currentImage]}
					disablePrevButton={disablePrevButton}
					disableNextButton={disableNextButton}
					handleSingleFavorites={handleSingleFavorites}
				/>
			)}
			<Typography
				ref={ref}
				color="text.primary"
				gutterBottom
				sx={{ fontWeight: 600 }}
			></Typography>

			<AddToAlbumDialog
				open={openAddToAlbumDialog}
				onClose={() => setOpenAddToAlbumDialog(false)}
				onSelect={handleAddToAlbum}
				hideSystemAlbums={true}
				title="Add to"
			/>
		</>
	);
};
