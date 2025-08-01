import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import React from 'react';

import FavoriteMediaButton from './FavoriteMediaButton';
import ImageThumbnail from './ImageThumbnail';
import SelectImageButton from './SelectImageButton';

interface GalleryItemPaperProps {
	selected: boolean;
	onSelect: (e: React.MouseEvent<HTMLButtonElement>) => void;
	onPreview: () => void;
	thumbnail: {
		id: string;
		mediaType?: string;
		isFavorite?: boolean;
	};
	handleSingleFavorites?: (id: string, actionAdd: boolean) => void;
}

const GalleryItemPaper: React.FC<GalleryItemPaperProps> = ({
	selected,
	onSelect,
	onPreview,
	thumbnail,
	handleSingleFavorites,
}) => (
	<Paper elevation={0}>
		<SelectImageButton selected={selected} onClick={onSelect} />
		<FavoriteMediaButton
			thumbnail={thumbnail}
			handleSingleFavorites={handleSingleFavorites}
		/>
		<div onClick={onPreview}>
			{selected ? (
				<Box component="section" sx={{ p: 1.5 }}>
					<ImageThumbnail
						id={thumbnail.id}
						mediaType={thumbnail.mediaType}
						isFavorite={thumbnail?.isFavorite}
					/>
				</Box>
			) : (
				<Box
					component="section"
					sx={{
						position: 'relative',
						'&:hover .check-icon': {
							opacity: 1,
						},
						'&:hover .selection-gradient': {
							opacity: 1,
						},
					}}
				>
					<ImageThumbnail
						id={thumbnail.id}
						mediaType={thumbnail.mediaType}
						isFavorite={thumbnail?.isFavorite}
					/>
					{/* Gradient overlay, appears on hover */}
					<Box
						className="selection-gradient"
						sx={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '90%',
							height: '90%',
							pointerEvents: 'none',
							opacity: 0,
							transition: 'opacity 0.2s',
							zIndex: 2,
							background:
								'linear-gradient(to right, rgba(26,115,232,0.18) 0%, rgba(26,115,232,0.01) 100%)',
							borderTopLeftRadius: 8,
							borderTopRightRadius: 8,
						}}
					/>
					<Box
						className="check-icon"
						sx={{
							position: 'absolute',
							top: 7,
							left: 3,
							opacity: 0,
							transition: 'opacity 0.2s',
							zIndex: 3,
							pointerEvents: 'none',
						}}
					>
						<CheckCircleOutlineIcon
							sx={{ color: 'white', fontSize: 24, opacity: 0.8 }}
						/>
					</Box>
					{thumbnail.isFavorite != null && !thumbnail.isFavorite && (
						<Box
							className="check-icon"
							sx={{
								position: 'absolute',
								bottom: 8,
								left: 4,
								opacity: 0,
								transition: 'opacity 0.2s',
								zIndex: 3,
								pointerEvents: 'none',
							}}
						>
							<FavoriteBorderIcon sx={{ color: 'white', fontSize: 24, opacity: 0.8 }} />{' '} {/* yellow when not favorite */}
						</Box>
					)}
				</Box>
			)}
		</div>
	</Paper>
);

export default GalleryItemPaper;