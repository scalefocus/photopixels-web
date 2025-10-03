import { Alert, Box, Button, Snackbar, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ICommonError } from 'types/types';
import { addAlbum, getAlbumById, updateAlbum } from 'api/albumApi';
import { useParams, useNavigate } from 'react-router-dom';

export const CreateAlbum: React.FC = () => {
    const { albumId } = useParams<{ albumId?: string }>();
    const isEditMode = Boolean(albumId);
    const navigate = useNavigate();

    const [showMessage, setShowMessage] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState<Array<string> | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const albumQuery = useQuery({
        queryKey: ['album', albumId],
        queryFn: () => getAlbumById({ albumId: albumId! }),
        enabled: isEditMode,
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
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                Album name
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {albumQuery.isLoading ? 'Loading…' : name || '—'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                (Click to edit)
                            </Typography>
                        </Box>
                    ) : (
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="Name"
                            name="name"
                            type="text"
                            autoFocus={!isEditMode}
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            disabled={albumQuery.isLoading}
                        />
                    )}

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
                </form>
            </Box>
        </>
    );
};
