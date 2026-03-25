import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import {
	Box,
	Button,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	Divider,
	Tooltip,
	Typography,
} from '@mui/material';
import CardMedia from '@mui/material/CardMedia';
import { useQuery } from '@tanstack/react-query';
import { getPhoto } from 'api/api';
import { useEffect, useState } from 'react';

interface PreviewProps {
	isOpen: boolean;
	media: {
		id: string;
		dateCreated: string;
		mediaType?: string;
		isFavorite?: boolean;
		dateMediaTaken?: string;
		dateMediaCreated?: string;
		filename?: string;
		sizeInBytes?: number;
		width?: number;
		height?: number;
	};
	handlePrev: () => void;
	handleNext: () => void;
	disablePrevButton: boolean;
	disableNextButton: boolean;
	onClose: () => void;
	handleSingleFavorites?: (id: string, actionAdd: boolean) => void;
}

/** Format bytes → human-readable string (e.g. "3.2 MB") */
const formatBytes = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Format an ISO date string → readable local date+time */
const formatDate = (iso: string): string => {
	try {
		return new Date(iso).toLocaleString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return iso;
	}
};

// ── Info pane row ─────────────────────────────────────────────────────────────

interface InfoRowProps {
	label: string;
	value: string;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
	<Box sx={{ py: 1.5 }}>
		<Typography
			variant="caption"
			sx={{
				color: 'text.secondary',
				textTransform: 'uppercase',
				letterSpacing: '0.08em',
				fontSize: '0.68rem',
			}}
		>
			{label}
		</Typography>
		<Typography variant="body2" sx={{ mt: 0.3, wordBreak: 'break-all' }}>
			{value}
		</Typography>
	</Box>
);

// ── Main component ─────────────────────────────────────────────────────────────

const Preview = ({
	isOpen,
	media,
	onClose,
	handlePrev,
	handleNext,
	disablePrevButton,
	disableNextButton,
	handleSingleFavorites,
}: PreviewProps) => {
	const { data: url, isLoading } = useQuery({
		queryKey: ['getPhoto', media.id],
		queryFn: () => getPhoto(media.id),
	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const date = new Date(media.dateCreated).toDateString();

	const [zoom, setZoom] = useState(false);
	const [infoOpen, setInfoOpen] = useState(false);

	const handleZoomIn = () => {
		setZoom(true);
	};

	const handleZoomOut = () => {
		setZoom(false);
	};

	const handleFavorite = () => {
		handleSingleFavorites?.(media.id, !media.isFavorite);
	};

	// Close info pane when media changes
	useEffect(() => {
		setInfoOpen(false);
	}, [media.id]);

	useEffect(() => {
		const handleKeyLeft = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				handlePrev();
			}
		};

		const handleKeyRight = (e: KeyboardEvent) => {
			if (e.key === 'ArrowRight' && !disableNextButton) {
				handleNext();
			}
		};

		document.addEventListener('keydown', handleKeyLeft);
		document.addEventListener('keydown', handleKeyRight);

		return () => {
			document.removeEventListener('keydown', handleKeyLeft);
			document.removeEventListener('keydown', handleKeyRight);
		};
	}, [media]);

	// Shared toolbar button style
	const toolbarBtnSx = {
		minWidth: 32,
		p: '4px',
		color: 'gray',
		'&:hover': {
			backgroundColor: 'transparent',
			color: 'currentColor',
		},
	};

	return (
		<>
			{zoom && (
				<Container>
					<Box
						onClick={handleZoomOut}
						sx={{
							textAlign: 'center',
							position: 'absolute',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							zIndex: 10000,
							width: '100%',
							height: '100%',
							maxWidth: '100%',
							maxHeight: '100%',
							overflow: 'auto',
							cursor: 'zoom-out',
							backgroundColor: 'rgba(0, 0, 0)',
						}}
					>
						{ media.mediaType !== "video" && (<img src={url} alt="image" />)}
					</Box>
				</Container>
			)}
			<Dialog open={isOpen} onClose={onClose} fullScreen>
				{/* ── Top toolbar ── */}
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'flex-end', // align all buttons to the right
						alignItems: 'center',
						px: '5px',
						gap: 0.5, // reduce space between icons
					}}
				>
					{/* HeartBroken / Favorite */}
					{handleSingleFavorites && (
						<Button onClick={handleFavorite} disableRipple sx={toolbarBtnSx}>
							{media.isFavorite ? (
								<Tooltip title="Remove from Favorites">
									<HeartBrokenIcon />
								</Tooltip>
							) : (
								<Tooltip title="Add to Favorites">
									<FavoriteIcon />
								</Tooltip>
							)}
						</Button>
					)}

					{/* ── Info button (between HeartBroken and ZoomIn) ── */}
					<Button
						onClick={() => setInfoOpen((prev) => !prev)}
						disableRipple
						sx={{
							...toolbarBtnSx,
							color: infoOpen ? 'primary.main' : 'gray',
						}}
					>
						<Tooltip title="Info">
							<InfoOutlinedIcon />
						</Tooltip>
					</Button>

					{/* Zoom In */}
					{media.mediaType !== 'video' && (
						<Button onClick={handleZoomIn} disableRipple sx={toolbarBtnSx}>
							<Tooltip title="Zoom In">
								<ZoomInIcon />
							</Tooltip>
						</Button>
					)}

					{/* Close */}
					<Button onClick={onClose} disableRipple sx={toolbarBtnSx}>
						<Tooltip title="Close Preview">
							<CloseIcon />
						</Tooltip>
					</Button>
				</Box>

				{/* ── Main content area ── */}
				<DialogContent
					sx={{
						p: 0,
						overflow: 'hidden',
						position: 'relative',
						display: 'flex',
					}}
				>
					{/* Media area — shrinks when info pane opens */}
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							height: '100%',
							flex: 1,
							minWidth: 0,
							transition: 'all 0.3s ease',
						}}
					>
						<Button
							onClick={handlePrev}
							disableRipple
							disabled={disablePrevButton}
							sx={{
								flex: 1,
								height: '100%',
								color: 'gray',
								'&:hover': {
									backgroundColor: 'transparent',
									color: 'currentColor',
								},
							}}
						>
							<Tooltip title="Previous">
								<ChevronLeftIcon
									sx={{
										position: 'absolute',
										left: '10px',
										top: '50%',
										transform: 'translateY(-50%)',
									}}
									fontSize="large"
								/>
							</Tooltip>
						</Button>
						<Box
							sx={{
								height: '100%',
								display: 'flex',
								justifyContent: 'center',
								flex: 1,
								minWidth: 0,
							}}
						>
							{isLoading ? (
								<CircularProgress sx={{ my: 'auto' }} />
							) : (
								<Box
									onClick={media.mediaType !== 'video' ? handleZoomIn : undefined}
									sx={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										maxWidth: '100%',
										maxHeight: '100%',
										objectFit: 'contain',
										position: 'relative',
									}}
								>
									{media.mediaType !== 'video' && (
										<img
											src={url}
											alt="image"
											style={{
												objectFit: 'contain',
												maxWidth: '100%',
												maxHeight: '100%',
												cursor: 'zoom-in',
											}}
										/>
									)}
									{media.mediaType === 'video' && (
										<CardMedia
											component='video'
											src={url}
											sx={{
												display: 'flex',
												objectFit: 'contain',
												maxWidth: '100%',
												maxHeight: '100%'
											}}
											controls
										/>)}
								</Box>
							)}
						</Box>
						<Button
							onClick={handleNext}
							disableRipple
							disabled={disableNextButton}
							sx={{
								flex: 1,
								height: '100%',
								color: 'gray',
								'&:hover': {
									backgroundColor: 'transparent',
									color: 'currentColor',
								},
							}}
						>
							<Tooltip title="Next">
								<ChevronRightIcon
									fontSize="large"
									sx={{
										position: 'absolute',
										right: '10px',
										top: '50%',
										transform: 'translateY(-50%)',
									}}
								/>
							</Tooltip>
						</Button>
					</Box>

					{/* ── Sliding Info Pane — absolutely positioned, slides in over the right edge ── */}
					<Box
						sx={{
							position: 'absolute',
							top: 0,
							right: 0,
							height: '100%',
							width: 300,
							transform: infoOpen ? 'translateX(0)' : 'translateX(100%)',
							transition: 'transform 0.3s ease',
							borderLeft: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
							boxSizing: 'border-box',
							px: 2,
							py: 2,
							overflowY: 'auto',
							overflowX: 'hidden',
							zIndex: 10,
						}}
					>
						{/* Pane header */}
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								mb: 1,
							}}
						>
							<Typography variant="subtitle1" fontWeight={600}>
								Info
							</Typography>
							<Button
								onClick={() => setInfoOpen(false)}
								disableRipple
								sx={{
									minWidth: 32,
									p: '4px',
									color: 'gray',
									'&:hover': { backgroundColor: 'transparent' },
								}}
							>
								<CloseIcon fontSize="small" />
							</Button>
						</Box>

						<Divider sx={{ mb: 1 }} />

						{/* Info rows — only rendered when data is present */}
						{media.filename && (
							<InfoRow label="Filename" value={media.filename} />
						)}
						{media.dateMediaTaken && (
							<>
								<InfoRow
									label="Date Taken"
									value={formatDate(media.dateMediaTaken)}
								/>
								<Divider />
							</>
						)}
						{media.dateMediaCreated && (
							<>
								<InfoRow
									label="Date Created"
									value={formatDate(media.dateMediaCreated)}
								/>
								<Divider />
							</>
						)}
						{(media.width || media.height) && (
							<>
								<InfoRow
									label="Dimensions"
									value={
										[
											media.width && `${media.width}`,
											media.height && `${media.height}`,
										]
											.filter(Boolean)
											.join(' × ') + ' px'
									}
								/>
								<Divider />
							</>
						)}
						{media.sizeInBytes != null && (
							<InfoRow
								label="File Size"
								value={formatBytes(media.sizeInBytes)}
							/>
						)}
					</Box>
				</DialogContent>
				<DialogActions>
					<Box
						sx={{
							width: '100%',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							px: 2,
						}}
					>
						{/* <Typography color="text.secondary" fontSize={'small'}>
							Date Created: {date}
						</Typography> */}
					</Box>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default Preview;
