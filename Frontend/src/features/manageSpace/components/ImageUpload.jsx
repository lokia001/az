import React, { useState } from 'react';

function ImageUpload({ onImagesChange }) {
    const [selectedImages, setSelectedImages] = useState([]);

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        // Validation (ví dụ: kiểm tra kiểu file, kích thước file, số lượng file)
        const validFiles = files.filter(file => file.type.startsWith('image/'));

        if (validFiles.length !== files.length) {
            alert('Chỉ được phép tải lên các file hình ảnh.');
            return;
        }

        // Tạo URL cho bản xem trước
        const newImages = validFiles.map(file => ({
            file: file,
            url: URL.createObjectURL(file)
        }));

        setSelectedImages([...selectedImages, ...newImages]);
        onImagesChange([...selectedImages, ...newImages]); // Báo cho component cha
    };

    const handleRemoveImage = (index) => {
        const updatedImages = [...selectedImages];
        updatedImages.splice(index, 1);
        setSelectedImages(updatedImages);
        onImagesChange(updatedImages); // Báo cho component cha
    };

    return (
        <div>
            <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
            />
            <div className="image-preview">
                {selectedImages.map((image, index) => (
                    <div key={index} className="image-item">
                        <img src={image.url} alt={`Preview ${index}`} style={{ maxWidth: '100px', maxHeight: '100px' }} />
                        <button onClick={() => handleRemoveImage(index)}>Xóa</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ImageUpload;