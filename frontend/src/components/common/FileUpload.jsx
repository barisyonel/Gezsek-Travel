import React, { useState, useRef } from 'react';
import '../../App.css';

const FileUpload = ({ onUpload, onUploadComplete, multiple = false, accept = "image/*,video/*" }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      if (multiple) {
        Array.from(files).forEach((file) => {
          formData.append('files', file);
        });
      } else {
        formData.append('file', files[0]);
      }

      const token = localStorage.getItem('token');
      const endpoint = multiple ? '/api/upload/multiple' : '/api/upload';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        if (onUploadComplete) {
          onUploadComplete(data);
        }
        if (onUpload) {
          if (multiple) {
            onUpload(data.files);
          } else {
            onUpload(data);
          }
        }
        setUploadProgress(100);
      } else {
        throw new Error(data.message || 'Yükleme başarısız');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Yükleme hatası: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>Yükleniyor... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <h3>{multiple ? 'Dosyaları Yükle' : 'Dosya Yükle'}</h3>
            <p>
              {multiple ? 'Dosyaları buraya sürükleyin veya seçmek için tıklayın' : 'Dosyayı buraya sürükleyin veya seçmek için tıklayın'}
            </p>
            <p className="upload-hint">
              Desteklenen formatlar: JPG, PNG, GIF, WEBP, MP4, AVI, MOV
            </p>
            <p className="upload-hint">
              Maksimum dosya boyutu: 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 