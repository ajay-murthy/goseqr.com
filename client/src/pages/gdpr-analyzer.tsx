import { useState } from "react";
import { Shield, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/sidebar";
import { DocumentUpload } from "@/components/document-upload";
import { EntityForm } from "@/components/entity-form";
import { AnalysisResults } from "@/components/analysis-results";
import type { Document, Analysis, EntityInfo } from "@shared/schema";

export default function GDPRAnalyzer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (entityInfo: EntityInfo) => {
      if (!uploadedDocument) throw new Error("No document uploaded");
      
      const response = await apiRequest(
        'POST',
        `/api/documents/${uploadedDocument.id}/analyze`,
        entityInfo
      );
      return response.json();
    },
    onSuccess: (analysisResult: Analysis) => {
      setAnalysis(analysisResult);
      setCurrentStep(3);
      toast({
        title: "Analysis completed",
        description: "Your GDPR compliance analysis is ready.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDocumentUploaded = (document: Document) => {
    setUploadedDocument(document);
    setCurrentStep(1);
  };

  const handleAnalyze = (entityInfo: EntityInfo) => {
    setCurrentStep(2);
    analyzeMutation.mutate(entityInfo);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-800">GDPR Compliance Analyzer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                <HelpCircle className="w-4 h-4 mr-1" />
                Help
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar currentStep={currentStep} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Document Upload Section */}
            <DocumentUpload
              onDocumentUploaded={handleDocumentUploaded}
              uploadedDocument={uploadedDocument || undefined}
            />

            {/* Entity Information Form */}
            {uploadedDocument && (
              <EntityForm
                onAnalyze={handleAnalyze}
                isAnalyzing={analyzeMutation.isPending}
              />
            )}

            {/* Analysis Results */}
            {analysis && (
              <AnalysisResults analysis={analysis} />
            )}

            {/* Loading State */}
            {analyzeMutation.isPending && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Analyzing Document</h3>
                  <p className="text-gray-600">AI is analyzing your document for GDPR compliance...</p>
                  <div className="mt-4 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Mapping GDPR clauses and identifying issues...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
