import FolderIcon from '@mui/icons-material/Folder';
import {
    Button,
    Checkbox,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItemButton,
    ListItemIcon, ListItemText, Typography
} from '@mui/material';
import { getAlbums } from 'api/albumApi';
import { Album } from 'models/Album';
import * as React from 'react';

type Props = {
    open: boolean;
    onClose: () => void;
    onSelect: (albumId: string[]) => void;
    title?: string;
    hideSystemAlbums?: boolean;
};

export const AddToAlbumDialog: React.FC<Props> = ({
    open,
    onClose,
    onSelect,
    title = 'Choose album(s)',
    hideSystemAlbums = false,
}) => {
    const { data: albums, isLoading, isError, error } = getAlbums();

    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    React.useEffect(() => {
        if (!open) {
            setSelectedIds([]);
        }
    }, [open]);


    const visibleAlbums = React.useMemo<Album[]>(() => {
        const list = albums ?? [];
        return hideSystemAlbums ? list.filter((a) => !a.isSystem) : list;
    }, [albums, hideSystemAlbums]);

    const handleToggle = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const handleConfirm = () => {
        if (selectedIds.length === 0) return;

        onSelect(selectedIds);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            aria-labelledby="select-album-title"
        >
            <DialogTitle id="select-album-title">{title}</DialogTitle>

            <DialogContent dividers>
                {isLoading && <CircularProgress size={24} />}

                {isError && (
                    <Typography color="error">
                        Error loading albums {(error as Error)?.message ?? 'Unknown error'}
                    </Typography>
                )}

                {!isLoading && !isError && visibleAlbums.length === 0 && (
                    <Typography color="text.secondary">There are no albums to pick</Typography>
                )}

                {!isLoading && !isError && visibleAlbums.length > 0 && (
                    <List dense disablePadding>
                        {visibleAlbums.map((album) => {
                            const checked = selectedIds.includes(album.id);
                            return (
                                <ListItemButton
                                    key={album.id}
                                    onClick={() => handleToggle(album.id)}
                                    selected={checked}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Checkbox
                                            edge="start"
                                            checked={checked}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>

                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <FolderIcon />
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={album.name}
                                        secondary={new Date(album.dateCreated).toLocaleDateString()}
                                        primaryTypographyProps={{ noWrap: true, fontWeight: 600 }}
                                        secondaryTypographyProps={{ noWrap: true }}
                                    />
                                </ListItemButton>
                            );
                        })}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={selectedIds.length === 0}
                >
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddToAlbumDialog;
