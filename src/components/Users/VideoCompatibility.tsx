import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { setАllowVideoConversion, useUserSettings } from 'api/api';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import toast from 'react-hot-toast';

interface VideoCompatibilityProps {
	onConversionStatusChange?: (status: boolean) => void;
}

export interface VideoCompatibilityRef {
	triggerDisableConfirmation: () => void;
}

export const VideoCompatibility = forwardRef<VideoCompatibilityRef, VideoCompatibilityProps>(
	({ onConversionStatusChange }, ref) => {
		const { data, isLoading } = useUserSettings();
		const [isConverting, setIsConverting] = useState(false);
		const [showConfirmDialog, setShowConfirmDialog] = useState(false);
		const [confirmAction, setConfirmAction] = useState<'enable' | 'disable' | null>(null);

		useImperativeHandle(ref, () => ({
			triggerDisableConfirmation: () => {
				setConfirmAction('disable');
				setShowConfirmDialog(true);
			},
		}));

		useEffect(() => {
			if (data) {
				setIsConverting(data.settings.allowVideoConversion);
				onConversionStatusChange?.(data.settings.allowVideoConversion);
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
				onConversionStatusChange?.(isConverting);
			},
			onError: (error) => toast.error(`Something went wrong: ${error.message}`),
		});

		const dialogTexts = {
			enable: {
				title: "Enable conversion for native iPhone videos?",
				description:
					"Conversion will duplicate storage usage. Both original and converted videos will be kept.",
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
				<Box sx={{ pb: 3, borderBottom: '1px solid rgb(0, 0, 0, 0.12)' }}>
					<FormControlLabel
						control={
							<Checkbox
								checked={isConverting}
								onChange={handleConvertCheckboxChange}
								color="primary"
								disabled={isLoading || setPreviewConversionMutation.isPending}
							/>
						}
						label="Automatically convert iPhone videos to MP4 (Recommended)"
					/>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, ml: 4 }}>
						iPhone videos are recorded in HEVC (H.265) format.
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 4 }}>
						Converting to MP4 ensures compatibility across all browsers and devices.
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, ml: 4 }}>
						Original files are preserved{' '}
						<Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
							🔒
						</Typography>
					</Typography>
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
	}
);

VideoCompatibility.displayName = 'VideoCompatibility';
