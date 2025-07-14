import { useState, useRef } from "react";
import { Upload, FileText, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@shared/schema";

interface DocumentUploadProps {
  onDocumentUploaded: (document: Document) => void;
  uploadedDocument?: Document;
}

export function DocumentUpload({ onDocumentUploaded, uploadedDocument }: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (document: Document) => {
      onDocumentUploaded(document);
      toast({
        title: "Document uploaded successfully",
        description: `${document.originalName} has been processed.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or text file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    return '📄';
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Document Upload</h2>
        
        {!uploadedDocument ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-800 mb-2">
              Drop your document here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports PDF, Word, and text files up to 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
            />
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={uploadMutation.isPending}>
              <FolderOpen className="w-4 h-4 mr-2" />
              {uploadMutation.isPending ? 'Uploading...' : 'Choose File'}
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getFileIcon(uploadedDocument.mimeType)}</span>
                <div>
                  <p className="font-medium text-gray-800">{uploadedDocument.originalName}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(uploadedDocument.size)} • Uploaded {new Date(uploadedDocument.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => window.location.reload()}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
