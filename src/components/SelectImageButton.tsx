import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import IconButton from '@mui/material/IconButton';
import React, { useState } from 'react';

interface SelectImageButtonProps {
    selected: boolean;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const SelectImageButton: React.FC<SelectImageButtonProps> = ({ selected, onClick }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <IconButton
            size="small"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                position: 'absolute',
                top: 10,
                left: 6,
                zIndex: 2,
                //transition: 'background 0.2s, box-shadow 0.2s, filter 0.2s',
                //boxShadow: 1,
                // '&:hover': {
                //     background: 'rgba(26,115,232,0.15)',
                // },
            }}
        >
            {(() => {
                if (selected) {
                    return (
                        <CheckCircleIcon
                            sx={{
                                color: '#0B57D0',
                                fontSize: 24,
                                filter: 'drop-shadow(0 0 2px #fff)',
                            }}
                        />
                    );
                } else if (hovered) {
                    return (
                        <CheckCircleIcon
                            sx={{
                                color: 'white',
                                fontSize: 24,
                            }}
                        />
                    );
                } else {
                    return (
                        <CheckCircleOutlineIcon
                            sx={{
                                color: 'gray',
                                fontSize: 24,
                            }}
                        />
                    );
                }
            })()}
        </IconButton>
    );
};

export default SelectImageButton;