import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  AlertCircle, 
  Scale, 
  CheckCircle, 
  Lightbulb,
  Download 
} from "lucide-react";
import type { Analysis, GDPRAnalysisResult } from "@shared/schema";

interface AnalysisResultsProps {
  analysis: Analysis;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const results = analysis.analysisResults as GDPRAnalysisResult;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'WARNING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'bg-green-100 text-green-800';
      case 'PARTIAL': return 'bg-amber-100 text-amber-800';
      case 'NON_COMPLIANT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportReport = () => {
    const reportData = {
      document: analysis.documentId,
      entityInfo: {
        dataSubject: analysis.dataSubject,
        dataController: analysis.dataController,
        dataProcessor: analysis.dataProcessor,
      },
      analysisResults: results,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gdpr-analysis-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">GDPR Compliance Analysis</h2>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleExportReport}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Analysis completed</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{results.summary.criticalCount}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Warnings</p>
                <p className="text-2xl font-bold text-amber-600">{results.summary.warningCount}</p>
              </div>
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">GDPR Clauses</p>
                <p className="text-2xl font-bold text-blue-600">{results.summary.gdprClauseCount}</p>
              </div>
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Compliance Score</p>
                <p className="text-2xl font-bold text-green-600">{results.summary.complianceScore}%</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Analysis Sections */}
        <div className="space-y-6">
          {/* Critical Issues */}
          {results.criticalIssues.length > 0 && (
            <div className="border border-red-200 rounded-lg p-6 bg-red-50">
              <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Critical Issues
              </h3>
              <div className="space-y-4">
                {results.criticalIssues.map((issue, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800">{issue.title}</h4>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {issue.gdprArticles.map((article, i) => (
                          <Badge key={i} variant="outline" className="text-blue-600 border-blue-600">
                            {article}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-800">{issue.documentLines}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {results.warnings.length > 0 && (
            <div className="border border-amber-200 rounded-lg p-6 bg-amber-50">
              <h3 className="text-lg font-semibold text-amber-600 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Warnings & Recommendations
              </h3>
              <div className="space-y-4">
                {results.warnings.map((warning, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-amber-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800">{warning.title}</h4>
                      <Badge className={getSeverityColor(warning.severity)}>
                        {warning.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{warning.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {warning.gdprArticles.map((article, i) => (
                          <Badge key={i} variant="outline" className="text-blue-600 border-blue-600">
                            {article}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-800">{warning.documentLines}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GDPR Clause Mapping */}
          {results.clauseMapping.length > 0 && (
            <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
                <Scale className="w-5 h-5 mr-2" />
                GDPR Clause Mapping
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-200">
                      <th className="text-left py-2 px-4 font-medium text-gray-800">Document Section</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-800">GDPR Articles</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-800">Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.clauseMapping.map((mapping, index) => (
                      <tr key={index} className="bg-white">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{mapping.documentSection}</p>
                            <p className="text-xs text-gray-500">{mapping.lines}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {mapping.gdprArticles.map((article, i) => (
                              <Badge key={i} variant="outline" className="text-blue-600 border-blue-600">
                                {article}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getComplianceStatusColor(mapping.complianceStatus)}>
                            {mapping.complianceStatus.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Actionable Recommendations
              </h3>
              <div className="space-y-3">
                {results.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">{recommendation.priority}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{recommendation.title}</p>
                      <p className="text-sm text-gray-600">{recommendation.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
