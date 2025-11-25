import { Alert, Box, Button, ClickAwayListener, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, TextField, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { addAlbum, getAlbumById, updateAlbum } from 'api/albumApi';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ICommonError } from 'types/types';

export const CreateAlbum: React.FC = () => {
    const { albumId } = useParams<{ albumId?: string }>();
    const isEditMode = Boolean(albumId);
    const navigate = useNavigate();

    const [showMessage, setShowMessage] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState<Array<string> | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [confirmOpenDiscardChanges, setOpenDiscardChanges] = useState(false);


    const albumQuery = useQuery({
        queryKey: ['album', albumId] as const,
        enabled: isEditMode,
        queryFn: () => {
            if (!albumId) throw new Error('Missing albumId');
            return getAlbumById({ albumId: albumId });
        },
    });

    useEffect(() => {
        if (albumQuery.data?.name) {
            setName(albumQuery.data.name);
        }
    }, [albumQuery.data?.name]);

    const addAlbumMutation = useMutation({
        mutationFn: addAlbum,
        onSuccess: (created) => {
            setShowMessage(true);
            setName('');
            setError(null);
            if (created?.id) {
                navigate(`/albums/view/${created.id}`);
            }
        },
        onError: (err: ICommonError) => {
            const { errors } = err.response.data;
            setError(Object.values(errors));
        },
    });

    const updateAlbumMutation = useMutation({
        mutationFn: (payload: { id: string; name: string }) => updateAlbum(payload),
        onSuccess: () => {
            setShowMessage(true);
            setIsEditing(false);
            setError(null);
            setName((prev) => prev.trim());
        },
        onError: (err: ICommonError) => {
            const { errors } = err.response.data;
            setError(Object.values(errors));
        },
    });

    const isBusy = addAlbumMutation.isPending || updateAlbumMutation.isPending;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (isEditMode) {
            if (!albumId) return;
            updateAlbumMutation.mutate({ id: albumId, name: name.trim() });
            return;
        }

        addAlbumMutation.mutate({ name: name.trim(), isSystem: false });
    };

    const originalName = albumQuery.data?.name ?? '';
    const trimmed = useMemo(() => name.trim(), [name]);

    const showSubmitButton = isEditMode
        ? (!albumQuery.isLoading && isEditing && trimmed !== '' && trimmed !== originalName)
        : trimmed !== '';

    const exitEditAlbumName = () => {
        if (!isEditMode) return;
        if (trimmed !== (originalName ?? '').trim()) {
            setOpenDiscardChanges(true);
        } else {
            setIsEditing(false);
        }
    };

    const handleClickAway = () => {
        if (confirmOpenDiscardChanges || isBusy) return;
        exitEditAlbumName();
    };

    const handleConfirmSaveAlbum = () => {
        setOpenDiscardChanges(false);
        if (!albumId) { setIsEditing(false); return; }
        updateAlbumMutation.mutate({ id: albumId, name: trimmed });
    };

    const handleDiscardChanges = () => {
        setOpenDiscardChanges(false);
        setName(originalName ?? '');
        setIsEditing(false);
        setError(null);
    };

    return (
        <>
            <Snackbar
                open={showMessage}
                autoHideDuration={3000}
                onClose={() => setShowMessage(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="success" sx={{ width: '100%' }}>
                    {isEditMode ? 'Album has been updated.' : 'Album has been created.'}
                </Alert>
            </Snackbar>

            <Dialog open={confirmOpenDiscardChanges} onClose={handleDiscardChanges}>
                <DialogTitle>Save changes?</DialogTitle>
                <DialogContent>
                    The name of the album has been changed. Do you want me to save it?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDiscardChanges} disabled={isBusy}>No</Button>
                    <Button onClick={handleConfirmSaveAlbum} disabled={isBusy} autoFocus>Yes</Button>
                </DialogActions>
            </Dialog>

            <Box
                sx={{
                    display: 'flex',
                    direction: 'row',
                    justifyContent: 'space-between',
                    maxWidth: '700px',
                }}
            >
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    {error?.length ? (
                        <Box sx={{ mb: 1 }}>
                            {error.map((e, i) => (
                                <Alert key={i} severity="error" sx={{ mb: 1 }}>
                                    {e}
                                </Alert>
                            ))}
                        </Box>
                    ) : null}

                    {isEditMode && !isEditing ? (
                        <Box
                            sx={{ py: 1.5, cursor: 'text' }}
                            onClick={() => setIsEditing(true)}
                            title="Click to edit the name"
                        >
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {albumQuery.isLoading ? 'Loading…' : name || '—'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                (Click to edit)
                            </Typography>
                        </Box>
                    ) : (
                        <ClickAwayListener onClickAway={handleClickAway}>
                            <Box>
                                <TextField
                                    placeholder='Add an album title here...'
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Album title"
                                    name="name"
                                    type="text"
                                    autoFocus={!isEditMode}
                                    value={name}
                                    inputProps={{ maxLength: 30 }}
                                    onChange={(event) => setName(event.target.value)} onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            e.preventDefault();
                                            handleClickAway();
                                        }
                                    }}
                                    disabled={albumQuery.isLoading || isBusy}
                                />

                                {showSubmitButton && (
                                    <Button
                                        disabled={isBusy || albumQuery.isLoading}
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        sx={{ mt: 2, mb: 2 }}
                                    >
                                        {isEditMode ? 'Save Changes' : 'Create Album'}
                                    </Button>
                                )}
                            </Box>
                        </ClickAwayListener>
                    )}
                </form>
            </Box>
        </>
    );
};
