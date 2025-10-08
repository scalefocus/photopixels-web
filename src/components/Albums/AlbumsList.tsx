import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { AppBar, Button, Checkbox, Dialog, DialogActions, DialogTitle, Divider, Grid, IconButton, Paper, Slide, Stack, Toolbar, Tooltip, Typography, useTheme } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { deleteAlbum,getAlbums } from 'api/albumApi';
import { Album } from "models/Album";
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link as RouterLink } from "react-router-dom";

export const AlbumsList: React.FC = () => {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const { data: albums, isLoading, isError, error } = getAlbums();
    const deleteAlbumMutation = deleteAlbum();
    const [selected, setSelected] = useState<string[]>([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);



    const albumsById = useMemo(() => {
        const map = new Map<string, Album>();
        (albums ?? []).forEach(a => map.set(a.id, a));
        return map;
    }, [albums]);

    const toggleSelect = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const clearSelection = () => setSelected([]);

    const handleSingleDelete = (id: string) => {
        const a = albumsById.get(id);
        if (!a) return;

        if (a.isSystem) {
            toast.error('This is a system album and cannot be deleted');
            return;
        }

        if (confirm(`Are you sure you want to delete "${a.name}"?. The files in the albums will be still available in your feed?`)) {
            deleteAlbumMutation.mutate(id, {
                onSuccess: () => {
                    toast.success(`The album "${a.name}" has been successfully deleted.`);
                    queryClient.invalidateQueries({ queryKey: ['getAlbums'] });
                },
                onError: (err: any) => {
                    toast.error(`Error during album deletion: ${err?.message ?? 'Error'}`);
                },
            });
        }
    };

    const handleBulkDelete = async () => {
        const deletable = selected.filter(id => !albumsById.get(id)?.isSystem);
        const blocked = selected.filter(id => albumsById.get(id)?.isSystem);

        if (blocked.length > 0) {
            toast.error('System albums cannot be deleted');
        }

        if (deletable.length === 0) {
            setOpenDeleteDialog(false);
            return;
        }

        try {
            for (const id of deletable) {
                await deleteAlbumMutation.mutateAsync(id);
            }
            toast.success(`Deleted: ${deletable.length} albums.`);
            clearSelection();
            queryClient.invalidateQueries({ queryKey: ['getAlbums'] });
        } catch (err: any) {
            toast.error(`Error during album deletion: ${err?.message ?? 'Error'}`);
        } finally {
            setOpenDeleteDialog(false);
        }
    };

    return (
        <>
            <Slide
                direction="down"
                in={selected.length > 0}
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
                        <IconButton edge="start" color="inherit" onClick={clearSelection}>
                            <CloseIcon />
                        </IconButton>

                        <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>
                            {selected.length} {selected.length === 1 ? ' selected album' : 'selected albums'}
                        </Typography>

                        <Tooltip title="Изтрий избраните">
                            <IconButton
                                color="inherit"
                                onClick={() => setOpenDeleteDialog(true)}
                                disabled={deleteAlbumMutation.isPending}
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
                                Confirm deletion of {selected.length}{' '}
                                {selected.length === 1 ? 'album' : 'albums'}?
                            </DialogTitle>

                            <Typography id="delete-dialog-description" sx={{ px: 3, pb: 1, color: 'text.secondary' }}>
                                The system albums(if there are such) will be not affected
                            </Typography>

                            <DialogActions>
                                <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleBulkDelete}
                                    color="error"
                                    variant="contained"
                                >
                                    Delete
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Toolbar>
                </AppBar>
            </Slide>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={1} columns={{ xs: 3, sm: 4, lg: 6, xl: 8 }}>
                {isError && (
                    <Typography color="error" sx={{ m: 2 }}>
                        Error loading albums: {(error as Error)?.message ?? 'Unknown'}
                    </Typography>
                )}

                {isLoading && (
                    <Grid item xs={3}>
                        <Typography color="text.secondary" sx={{ m: 2 }}>
                            Loading....
                        </Typography>
                    </Grid>
                )}

                {!isLoading && (albums?.length ?? 0) === 0 && (
                    <Grid item xs={3}>
                        <Typography color="text.secondary" sx={{ m: 2 }}>
                            There are no albums to show yet.
                        </Typography>
                    </Grid>
                )}

                {(albums ?? []).map((album) => (
                    <Grid item xs={1} key={album.id} sx={{ position: 'relative' }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                height: 90,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                '&:hover': { boxShadow: 2 },
                            }}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Checkbox
                                    checked={selected.includes(album.id)}
                                    onChange={() => toggleSelect(album.id)}
                                    inputProps={{ 'aria-label': 'Album selection' }}
                                />

                                <Tooltip
                                    title={
                                        album.isSystem
                                            ? 'System album. It cannot be deleted'
                                            : 'Delete'
                                    }
                                >
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleSingleDelete(album.id)}
                                            disabled={deleteAlbumMutation.isPending || album.isSystem}
                                            aria-label="Delete"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Stack>

                            <Typography
                                variant="subtitle2"
                                noWrap
                                sx={{
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    color: "text.primary",
                                    textDecoration: "none",
                                    "&:hover": { textDecoration: "underline" },
                                }}
                                component={RouterLink}
                                to={`/albums/view/${album.id}`}     // <-- коригирайте маршрута при нужда
                                title={album.name}
                            >
                                {album.name}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </>
    );
};
