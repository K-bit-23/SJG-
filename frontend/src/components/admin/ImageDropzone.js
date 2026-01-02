import React, { useState, useRef } from 'react';
import './ImageDropzone.css';

const ImageDropzone = ({ onDrop, existingImage }) => {
    const [preview, setPreview] = useState(existingImage || null);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result);
                if (onDrop) {
                    onDrop(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="image-dropzone" onClick={handleClick}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
            {
                preview ? (
                    <div className="image-preview">
                        <img src={preview} alt="Preview" />
                        <div className="overlay"><span>Change Image</span></div>
                    </div>
                ) : (
                    <div className="dropzone-placeholder">
                        <i className="fas fa-image"></i>
                        <p>Select an image</p>
                    </div>
                )
            }
        </div>
    );
};

export default ImageDropzone;
