import FavoriteIcon from '@mui/icons-material/Favorite';
import IconButton from '@mui/material/IconButton';
import React, { useState } from 'react';

interface FavoriteMediaButtonProps {
	thumbnail: {
		id: string;
		mediaType?: string;
		isFavorite?: boolean;
	};
	handleSingleFavorites?: (id: string, actionAdd: boolean) => void;
}

const FavoriteMediaButton: React.FC<FavoriteMediaButtonProps> = ({
	thumbnail,
	handleSingleFavorites,
}) => {
	const [hovered, setHovered] = useState(false);

	const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		handleSingleFavorites?.(thumbnail.id, !thumbnail.isFavorite);
	};

	return (
		<IconButton
			size="small"
			onClick={handleOnClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			sx={{
				position: 'absolute',
				bottom: 9,
				left: 7,
				zIndex: 2,
			}}
		>
			{(() => {
				if (hovered && thumbnail.isFavorite != null && !thumbnail.isFavorite) {
					return <FavoriteIcon sx={{ color: 'white', fontSize: 24 }} />; // red when hovered and not favorite
				} else {
					return <FavoriteIcon sx={{ opacity: 0, fontSize: 24 }} />;
				}
			})()}
		</IconButton>
	);
};

export default FavoriteMediaButton;
