import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { setАllowVideoConversion, useUserSettings } from 'api/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const VideoConversionToggle = () => {
    const { data, isLoading } = useUserSettings();
    const [isConverting, setIsConverting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'enable' | 'disable' | null>(null);

    useEffect(() => {
        if (data) {
            setIsConverting(data.settings.allowVideoConversion);
        }
    }, [data]);

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

    const dialogTexts = {
        enable: {
            title: "Enable conversion for native iPhone videos?",
            description:
                "Conversion will duplicate storage usage.  Both original and converted videos will be kept.",
            confirmButton: "Enable",
            cancelButton: "Cancel"
        },
        disable: {
            title: "Cancel Conversion",
            description:
                "Canceling will stop the conversion and permanently delete all converted videos. Original videos will be kept. Do you want to continue?",
            confirmButton: "Confirm Cancel",
            cancelButton: "Continue Conversion"
        }
    } as const;

    const currentText = confirmAction ? dialogTexts[confirmAction] : null;

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
                            disabled={isLoading || setPreviewConversionMutation.isPending}
                        />
                    }
                    label="Convert iOS videos for cross-platform compatibility"
                />
            </Box>

            <Dialog
                open={showConfirmDialog}
                onClose={handleCancel}
                aria-labelledby="confirm-dialog-title"
            >
                <DialogTitle id="confirm-dialog-title">
                    {currentText?.title}
                </DialogTitle>

                <DialogContent>
                    <Typography sx={{ color: "text.secondary" }}>
                        {currentText?.description}
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCancel} variant="outlined">
                        {currentText?.cancelButton}
                    </Button>

                    <Button
                        onClick={handleConfirm}
                        color="primary"
                        variant="contained"
                    >
                        {currentText?.confirmButton}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};