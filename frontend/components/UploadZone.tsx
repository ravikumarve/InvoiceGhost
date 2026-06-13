'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export default function UploadZone({ onFileSelect, isProcessing = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const isValidFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    return validTypes.includes(file.type) || validExtensions.includes(extension);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border border-dashed p-16 text-center transition-all duration-300 cursor-pointer
            ${isDragging 
              ? 'border-[var(--accent-cyan)] bg-[rgba(0,240,255,0.02)]' 
              : 'border-[var(--border-highlight)] bg-[rgba(10,10,10,0.8)] hover:border-[var(--accent-cyan)] hover:bg-[rgba(0,240,255,0.02)]'
            }
            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileInput}
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            disabled={isProcessing}
          />
          
          <div className="flex flex-col items-center justify-center gap-4">
            {/* Technical Upload Icon */}
            <div className={`w-12 h-12 border border-[var(--border-main)] flex items-center justify-center transition-colors ${
              isDragging ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)]' : 'text-[var(--accent-cyan)]'
            }`}>
              <Upload className="w-6 h-6" />
            </div>
            
            <div>
              <p className="text-lg font-medium mb-1">
                {isDragging ? 'Drop your invoice here' : 'Initialize Extraction'}
              </p>
              <p className="mono text-xs text-[var(--text-tertiary)] uppercase">
                Drag & Drop PDF, PNG, JPG (Max 10MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-[var(--border-main)] bg-[var(--bg-panel)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-[var(--border-main)] flex items-center justify-center text-[var(--accent-cyan)]">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {selectedFile.name}
                </p>
                <p className="mono text-xs text-[var(--text-tertiary)]">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            {!isProcessing && (
              <button
                onClick={handleRemoveFile}
                className="p-2 hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <X className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
