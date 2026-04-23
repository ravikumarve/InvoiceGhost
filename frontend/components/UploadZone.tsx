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
    <div className="w-full max-w-2xl mx-auto">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-12
            transition-all duration-200 ease-in-out
            ${isDragging 
              ? 'border-amber-500 bg-amber-500/10 animate-pulse' 
              : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'
            }
            ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
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
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`
              p-4 rounded-full
              ${isDragging ? 'bg-amber-500/20' : 'bg-zinc-800'}
              transition-colors duration-200
            `}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-amber-500' : 'text-zinc-400'}`} />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-zinc-100">
                {isDragging ? 'Drop your invoice here' : 'Upload your invoice'}
              </p>
              <p className="text-sm text-zinc-400">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-zinc-500">
                Supports PDF, PNG, JPG, WEBP (Max 10MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-zinc-800 rounded-lg">
                <FileText className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-zinc-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            {!isProcessing && (
              <button
                onClick={handleRemoveFile}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}