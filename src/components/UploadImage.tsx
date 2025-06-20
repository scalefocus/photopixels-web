import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import {
	Box,
	Button,
	CircularProgress,
	Stack,
	Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IUploadError } from 'types/types';

import { uploadImage } from '../api/api';
import { generateImageHash } from '../utils/utils';

const Upload: React.FC = () => {
	const [selectedFilesCount, setSelectedFilesCount] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const queryClient = useQueryClient();

	const uploadImageMutation = useMutation({
		mutationFn: uploadImage,
		onError: (error: IUploadError) =>
			toast.error(`Something went wrong: ${error.response.data.title}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['fetchIds'] });
		},
	});
	const { isPending } = uploadImageMutation;

	useEffect(() => {
		if (!isPending) setSelectedFilesCount(0);
	}, [isPending]);

	const handleDragOver = (event: React.DragEvent<HTMLInputElement>) => {
		event.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleUpload = (files: Array<File>) => {
		const numberOfFiles = files.length;

		setSelectedFilesCount(numberOfFiles);

		files.map(async (file) => {
			const objectHash = await generateImageHash(file);

			uploadImageMutation.mutate(
				{ file, objectHash },
				{
					onSuccess: () => {
						toast.success(
							`${numberOfFiles} image${
								numberOfFiles > 1 ? 's' : ''
							} uploaded successfully`
						);
					},
				}
			);
		});
	};

	return (
		<Box
			component="form"
			sx={{
				p: { xs: 0, sm: 4 },
				height: { xs: '100%', sm: '210px' },
				border: { xs: 'none', sm: '1px solid rgb(0, 0, 0, 0.12)' },
				borderRadius: '10px',
				width: '100%',
				bgcolor: isDragging ? '#F9FAFB' : 'transparent',
			}}
			onDrop={(event) => {
				event.preventDefault();
				handleUpload(Object.values(event.dataTransfer.files));
				setIsDragging(false);
			}}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
		>
			<Stack alignItems="center" spacing={{ xs: 0, sm: 2 }}>
				<CollectionsOutlinedIcon
					fontSize="large"
					color="primary"
					sx={{ display: { xs: 'none', sm: 'block' } }}
				/>
				<Typography
					color="text.secondary"
					sx={{ display: { xs: 'none', sm: 'block' } }}
				>
					Drag and drop media files here or
				</Typography>

				<Button
					sx={{ width: { xs: '100%', sm: '160px' } }}
					component="label"
					variant="contained"
					startIcon={
						isPending ? (
							<CircularProgress color="inherit" size="1rem" />
						) : (
							<CloudUploadIcon />
						)
					}
				>
					{isPending ? 'Uploading' : 'Browse Files'} 
					<input
						data-testid="input-browse-files"
						type="file"	
						accept="image/*, video/*"
						onChange={(event) => {
							const files = event.target.files;

							if (files) handleUpload(Object.values(files));
						}}
						style={{ height: 1, width: 1 }}
						multiple
					/>
				</Button>
				{isPending && (
					<Typography color="text.secondary">
						{`Uploading ${selectedFilesCount} media file${
							selectedFilesCount > 1 ? 's' : ''
						}`}
					</Typography>
				)}
			</Stack>
		</Box>
	);
};

export default Upload;
