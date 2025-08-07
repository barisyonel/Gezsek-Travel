import React, { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ 
  onUpload, 
  onRemove, 
  currentImage, 
  label = "Görsel Yükle",
  accept = "image/*",
  multiple = false,
  maxSize = 5 // MB
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Dosya boyutu kontrolü
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`${file.name} dosyası çok büyük. Maksimum ${maxSize}MB olmalıdır.`);
        }

        // Dosya tipi kontrolü
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} geçerli bir resim dosyası değil.`);
        }

        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Dosya yükleme hatası');
        }

        const result = await response.json();
        
        if (result.success) {
          onUpload(result.url, result.public_id);
          setUploadProgress(((i + 1) / files.length) * 100);
        } else {
          throw new Error('Dosya yüklenemedi');
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // File input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const event = { target: { files } };
      handleFileSelect(event);
    }
  };

  const handleRemove = () => {
    if (currentImage && onRemove) {
      onRemove();
    }
  };

  return (
    <div className="file-upload-container">
      <label className="file-upload-label">{label}</label>
      
      <div 
        className="file-upload-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {currentImage ? (
          <div className="current-image">
            <img src={currentImage} alt="Yüklenen görsel" />
            <div className="image-overlay">
              <button 
                type="button" 
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                title="Görseli Kaldır"
              >
                🗑️
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            {isUploading ? (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p>Yükleniyor... {Math.round(uploadProgress)}%</p>
              </div>
            ) : (
              <>
                <div className="upload-icon">📁</div>
                <p>Dosya seçmek için tıklayın veya sürükleyin</p>
                <small>Maksimum {maxSize}MB, JPG, PNG, GIF</small>
              </>
            )}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={isUploading}
        />
      </div>

      {error && (
        <div className="upload-error">
          ❌ {error}
        </div>
      )}

      {currentImage && (
        <div className="image-info">
          <small>✅ Görsel yüklendi</small>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 