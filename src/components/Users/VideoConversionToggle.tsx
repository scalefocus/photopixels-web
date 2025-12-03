import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { setАllowVideoConversion } from 'api/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

export const VideoConversionToggle = () => {
    const [isConverting, setIsConverting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'enable' | 'disable' | null>(null);

    const handleConvertCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;

        if (isChecked) {
            setConfirmAction('enable');
        } else {
            setConfirmAction('disable');
        }

        setShowConfirmDialog(true);
    };

    const handleConfirm = () => {
        if (confirmAction === 'enable') {
            setIsConverting(true);
        } else if (confirmAction === 'disable') {
            setIsConverting(false);
        }

        setPreviewConversionMutation.mutate({
            previewConversion: confirmAction === 'enable'
        });

        setShowConfirmDialog(false);
        setConfirmAction(null);
    };

    const handleCancel = () => {
        if (confirmAction === 'enable') {
            // User cancelled enabling, so keep unchecked
        } else if (confirmAction === 'disable') {
            // User cancelled disabling, so keep checked
            setIsConverting(true);
        }
        setShowConfirmDialog(false);
        setConfirmAction(null);
    };

    const setPreviewConversionMutation = useMutation({
        mutationFn: setАllowVideoConversion,
        onSuccess: () => {
            toast.success('The option has been updated successfully');
        },
        onError: (error) => toast.error(`Something went wrong: ${error.message}`),
    });

    return (
        <>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Video Processing
                </Typography>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isConverting}
                            onChange={handleConvertCheckboxChange}
                            color="primary"
                        />
                    }
                    label="Convert iPhone videos"
                />
            </Box>

            <Dialog
                open={showConfirmDialog}
                onClose={handleCancel}
                aria-labelledby="confirm-dialog-title"
            >
                <DialogTitle id="confirm-dialog-title">
                    {confirmAction === 'enable'
                        ? "Еnable conversion for native iPhone videos?"
                        : "Re-convert your iPhone videos?"}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: 'text.secondary' }}>
                        {confirmAction === 'enable'
                            ? "The converted versions will increase your quota usage."
                            : "All currently converted versions will be deleted, your quota will be recalculated, and the original files will remain unchanged."}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} color="primary" variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};