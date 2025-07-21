import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import React from 'react';

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
}

const GalleryItemPaper: React.FC<GalleryItemPaperProps> = ({
    selected,
    onSelect,
    onPreview,
    thumbnail,
}) => (
    <Paper elevation={0}>
        <SelectImageButton
            selected={selected}
            onClick={onSelect}
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
                            width: '100%',
                            height: '50%',
                            pointerEvents: 'none',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            zIndex: 2,
                            background:
                                'linear-gradient(to bottom, rgba(26,115,232,0.18) 0%, rgba(26,115,232,0.01) 100%)',
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
                        <CheckCircleIcon
                            sx={{ color: 'white', fontSize: 24, opacity: 0.5 }}
                        />
                    </Box>
                </Box>
            )}
        </div>
    </Paper>
);

export default GalleryItemPaper;