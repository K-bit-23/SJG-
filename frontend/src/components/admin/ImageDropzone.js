import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './ImageDropzone.css';

const ImageDropzone = ({ onDrop, existingImage }) => {
    const [preview, setPreview] = useState(existingImage || null);

    const onDropAccepted = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
            setPreview(reader.result);
            if (onDrop) {
                onDrop(reader.result);
            }
        };
        reader.readAsDataURL(file);
    }, [onDrop]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onDropAccepted,
        accept: 'image/*',
        multiple: false
    });

    return (
        <div {...getRootProps()} className={`image-dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {
                preview ? (
                    <div className="image-preview">
                        <img src={preview} alt="Preview" />
                        <div className="overlay"><span>Change Image</span></div>
                    </div>
                ) : (
                    <div className="dropzone-placeholder">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <p>Drag & drop an image here, or click to select one</p>
                        <span>(Max file size: 5MB)</span>
                    </div>
                )
            }
        </div>
    );
};

export default ImageDropzone;
