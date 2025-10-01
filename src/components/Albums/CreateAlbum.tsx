import { Alert, Box, Button, Snackbar, TextField } from '@mui/material';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ICommonError } from 'types/types';
import { addAlbum } from 'api/albumApi';

export const CreateAlbum: React.FC = () => {
    const [showMessage, setShowMessage] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState<Array<string> | null>(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addAlbumMutation.mutate({ name, isSystem: false });
    };

    const addAlbumMutation = useMutation({
        mutationFn: addAlbum,
        onSuccess: () => {
            setShowMessage(true),
                setName('')
        },
        onError: (err: ICommonError) => {
            const { errors } = err.response.data;
            setError(Object.values(errors));
        },
    });

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    direction: 'row',
                    justifyContent: 'space-between',
                    maxWidth: '700px',
                }}
            >
                <Snackbar
                    open={showMessage}
                    autoHideDuration={3000}
                    onClose={() => setShowMessage(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity="success" sx={{ width: '100%' }}>
                        Album has been created.
                    </Alert>
                </Snackbar>
                <form onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Name"
                        name="name"
                        type="text"
                        autoFocus
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <Button
                        disabled={addAlbumMutation.isPending}
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2, mb: 2 }}
                    >
                        Create Album
                    </Button>

                </form>
            </Box>
        </>
    );
};
