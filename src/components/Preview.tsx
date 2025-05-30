import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import {
	Box,
	Button,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
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
	};
	handlePrev: () => void;
	handleNext: () => void;
	disablePrevButton: boolean;
	disableNextButton: boolean;
	onClose: () => void;
}

const Preview = ({
	isOpen,
	media,
	onClose,
	handlePrev,
	handleNext,
	disablePrevButton,
	disableNextButton,
}: PreviewProps) => {
	const { data: url, isLoading } = useQuery({
		queryKey: ['getPhoto', media.id],
		queryFn: () => getPhoto(media.id),
	});

	const date = new Date(media.dateCreated).toDateString();

	const [zoom, setZoom] = useState(false);

	const handleZoomIn = () => {
		setZoom(true);
	};

	const handleZoomOut = () => {
		setZoom(false);
	};

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
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						px: '10px',
					}}
				>
					<Button
						onClick={onClose}
						disableRipple
						sx={{
							color: 'gray',
							'&:hover': {
								backgroundColor: 'transparent',
								color: 'currentColor',
							},
						}}
					>
						<CloseIcon />
					</Button>
					<Button
						onClick={handleZoomIn}
						disableRipple
						sx={{
							color: 'gray',
							'&:hover': {
								backgroundColor: 'transparent',
								color: 'currentColor',
							},
						}}
					>
						<ZoomInIcon />
					</Button>
				</Box>
				<DialogContent sx={{ p: 0 }}>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							height: '100%',
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
							<ChevronLeftIcon
								sx={{
									position: 'absolute',
									left: '10px',
									top: '50%',
									transform: 'translateY(-50%)',
								}}
								fontSize="large"
							/>
						</Button>
						<Box
							sx={{
								height: '100%',
								display: 'flex',
								justifyContent: 'center',
							}}
						>
							{isLoading ? (
								<CircularProgress sx={{ my: 'auto' }} />
							) : (
								<Box
									onClick={handleZoomIn}
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
									{ media.mediaType !== "video" && (<img
										src={url}
										alt="image"
										style={{
											objectFit: 'contain',
											maxWidth: '100%',
											maxHeight: '100%',
											cursor: 'zoom-in',
										}}
									/>)}
									{ media.mediaType === "video" && (<CardMedia
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
							<ChevronRightIcon
								fontSize="large"
								sx={{
									position: 'absolute',
									right: '10px',
									top: '50%',
									transform: 'translateY(-50%)',
								}}
							/>
						</Button>
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
						<Typography color="text.secondary" fontSize={'small'}>
							Date Created: {date}
						</Typography>
					</Box>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default Preview;
