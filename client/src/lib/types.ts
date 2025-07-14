export interface AnalysisStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'pending';
}

export interface UploadedFile {
  file: File;
  preview: {
    name: string;
    size: string;
    uploadTime: string;
  };
}
