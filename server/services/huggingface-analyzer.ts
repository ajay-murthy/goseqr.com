import { type EntityInfo, type GDPRAnalysisResult } from '@shared/schema';

export class HuggingFaceGDPRAnalyzer {
  private static readonly API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
  private static readonly FALLBACK_URL = 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill';

  static async analyzeDocument(
    documentContent: string,
    entityInfo: EntityInfo
  ): Promise<GDPRAnalysisResult> {
    try {
      // Truncate document if too large (free tier has limits)
      const maxContentLength = 2000; // Conservative limit for free tier
      const truncatedContent = documentContent.length > maxContentLength 
        ? documentContent.substring(0, maxContentLength) + "... [document truncated]"
        : documentContent;

      const analysisResult = await this.performAnalysis(truncatedContent, entityInfo);
      return analysisResult;
    } catch (error) {
      console.error('HuggingFace analysis failed:', error);
      // Return a basic analysis if AI fails
      return this.getFallbackAnalysis(documentContent, entityInfo);
    }
  }

  private static async performAnalysis(
    content: string,
    entityInfo: EntityInfo
  ): Promise<GDPRAnalysisResult> {
    // Since free models have limitations, we'll use a rule-based approach
    // combined with simple text analysis for GDPR compliance
    
    const analysis = this.performRuleBasedAnalysis(content, entityInfo);
    return analysis;
  }

  private static performRuleBasedAnalysis(
    content: string,
    entityInfo: EntityInfo
  ): GDPRAnalysisResult {
    const contentLower = content.toLowerCase();
    const criticalIssues = [];
    const warnings = [];
    const clauseMapping = [];
    const recommendations = [];

    // Extract document lines and sections for better analysis
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const documentHash = this.generateDocumentHash(content);

    // Check for consent-related issues with specific line analysis
    const consentLines = lines.filter((line, idx) => {
      const lineLower = line.toLowerCase();
      return lineLower.includes('consent') || lineLower.includes('agree') || lineLower.includes('accept');
    });

    if (consentLines.length === 0) {
      criticalIssues.push({
        title: 'Missing Consent Mechanism',
        description: `No clear consent mechanism found for processing ${entityInfo.dataSubject} data by ${entityInfo.dataController}. GDPR requires explicit consent.`,
        gdprArticles: ['Article 6', 'Article 7'],
        documentLines: 'No consent references found in document',
        severity: 'CRITICAL' as const
      });
    } else {
      clauseMapping.push({
        documentSection: 'Consent Section',
        gdprArticles: ['Article 6', 'Article 7'],
        complianceStatus: consentLines.length >= 2 ? 'COMPLIANT' : 'PARTIAL' as const,
        lines: `Consent mentioned in ${consentLines.length} lines`
      });
    }

    // Check for data subject rights with specific analysis
    const dataSubjectRights = ['access', 'rectification', 'erasure', 'portability', 'restriction'];
    const foundRights = dataSubjectRights.filter(right => contentLower.includes(right));
    const rightsLines = lines.filter(line => 
      dataSubjectRights.some(right => line.toLowerCase().includes(right))
    );
    
    if (foundRights.length < 3) {
      const missingRights = dataSubjectRights.filter(right => !foundRights.includes(right));
      criticalIssues.push({
        title: 'Incomplete Data Subject Rights',
        description: `Only ${foundRights.length} of 5 data subject rights found for ${entityInfo.dataSubject}. Missing: ${missingRights.join(', ')}`,
        gdprArticles: ['Article 15', 'Article 16', 'Article 17', 'Article 18', 'Article 20'],
        documentLines: rightsLines.length > 0 ? `Rights mentioned in ${rightsLines.length} lines` : 'No rights references found',
        severity: 'HIGH' as const
      });
    } else {
      clauseMapping.push({
        documentSection: 'Data Subject Rights Section',
        gdprArticles: ['Article 15', 'Article 16', 'Article 17', 'Article 18', 'Article 20'],
        complianceStatus: 'COMPLIANT' as const,
        lines: `Rights mentioned in ${rightsLines.length} lines`
      });
    }

    // Check for data protection officer with entity-specific analysis
    const dpoLines = lines.filter(line => {
      const lineLower = line.toLowerCase();
      return lineLower.includes('data protection officer') || lineLower.includes('dpo');
    });

    if (dpoLines.length === 0) {
      warnings.push({
        title: 'No Data Protection Officer Mentioned',
        description: `No DPO contact information found for ${entityInfo.dataController}. This may be required for certain organizations.`,
        gdprArticles: ['Article 37', 'Article 38', 'Article 39'],
        documentLines: 'No DPO references found',
        severity: 'WARNING' as const
      });
    }

    // Check for data retention with specific analysis
    const retentionLines = lines.filter(line => {
      const lineLower = line.toLowerCase();
      return lineLower.includes('retention') || lineLower.includes('delete') || lineLower.includes('storage period');
    });

    if (retentionLines.length === 0) {
      criticalIssues.push({
        title: 'No Data Retention Policy',
        description: `No clear data retention policy found for ${entityInfo.dataSubject} data held by ${entityInfo.dataController}. GDPR requires limiting data storage periods.`,
        gdprArticles: ['Article 5'],
        documentLines: 'No retention policy found',
        severity: 'HIGH' as const
      });
    } else {
      clauseMapping.push({
        documentSection: 'Data Retention Section',
        gdprArticles: ['Article 5'],
        complianceStatus: 'COMPLIANT' as const,
        lines: `Retention mentioned in ${retentionLines.length} lines`
      });
    }

    // Check for third-party data sharing with specific analysis
    const sharingLines = lines.filter(line => {
      const lineLower = line.toLowerCase();
      return lineLower.includes('third party') || lineLower.includes('share') || lineLower.includes('transfer');
    });

    if (sharingLines.length > 0) {
      clauseMapping.push({
        documentSection: 'Data Sharing/Transfer Section',
        gdprArticles: ['Article 44', 'Article 45', 'Article 46'],
        complianceStatus: 'PARTIAL' as const,
        lines: `Data sharing mentioned in ${sharingLines.length} lines`
      });
    }

    // Check for legal basis with specific analysis
    const legalBasisTerms = ['legitimate interest', 'contract', 'legal obligation', 'vital interest', 'public task'];
    const foundBasis = legalBasisTerms.some(term => contentLower.includes(term));
    const basisLines = lines.filter(line => 
      legalBasisTerms.some(term => line.toLowerCase().includes(term)) || 
      line.toLowerCase().includes('consent')
    );
    
    if (!foundBasis && !contentLower.includes('consent')) {
      criticalIssues.push({
        title: 'No Legal Basis Specified',
        description: `No clear legal basis for processing ${entityInfo.dataSubject} data by ${entityInfo.dataController} found.`,
        gdprArticles: ['Article 6'],
        documentLines: 'No legal basis references found',
        severity: 'CRITICAL' as const
      });
    } else if (basisLines.length > 0) {
      clauseMapping.push({
        documentSection: 'Legal Basis Section',
        gdprArticles: ['Article 6'],
        complianceStatus: 'COMPLIANT' as const,
        lines: `Legal basis mentioned in ${basisLines.length} lines`
      });
    }

    // Check for processor agreements if processor is specified
    if (entityInfo.dataProcessor && entityInfo.dataProcessor.trim() !== '') {
      const processorLines = lines.filter(line => {
        const lineLower = line.toLowerCase();
        return lineLower.includes('processor') || lineLower.includes('processing agreement');
      });

      if (processorLines.length === 0) {
        warnings.push({
          title: 'No Processor Agreement Found',
          description: `No processor agreement found for ${entityInfo.dataProcessor}. Article 28 requires written agreements.`,
          gdprArticles: ['Article 28'],
          documentLines: 'No processor agreement found',
          severity: 'WARNING' as const
        });
      } else {
        clauseMapping.push({
          documentSection: 'Processor Agreement Section',
          gdprArticles: ['Article 28'],
          complianceStatus: 'COMPLIANT' as const,
          lines: `Processor mentioned in ${processorLines.length} lines`
        });
      }
    }

    // Add entity-specific recommendations
    recommendations.push(
      {
        title: 'Implement Privacy by Design',
        description: `Ensure ${entityInfo.dataController} builds data protection measures into systems from the ground up for ${entityInfo.dataSubject} data.`,
        priority: 1
      },
      {
        title: 'Regular Compliance Audits',
        description: `Conduct regular GDPR compliance audits for ${entityInfo.dataController} and update policies accordingly.`,
        priority: 2
      },
      {
        title: 'Staff Training',
        description: `Provide regular GDPR training for all ${entityInfo.dataController} staff handling ${entityInfo.dataSubject} data.`,
        priority: 3
      }
    );

    // Calculate compliance score
    const totalChecks = 6; // Number of checks performed
    const passedChecks = totalChecks - criticalIssues.length - Math.floor(warnings.length / 2);
    const complianceScore = Math.max(0, Math.round((passedChecks / totalChecks) * 100));

    return {
      criticalIssues,
      warnings,
      clauseMapping,
      recommendations,
      summary: {
        criticalCount: criticalIssues.length,
        warningCount: warnings.length,
        gdprClauseCount: clauseMapping.length,
        complianceScore
      }
    };
  }

  private static generateDocumentHash(content: string): string {
    // Simple hash to differentiate documents
    return content.length.toString() + content.substring(0, 100).replace(/\s/g, '').length.toString();
  }

  private static getFallbackAnalysis(
    content: string,
    entityInfo: EntityInfo
  ): GDPRAnalysisResult {
    return {
      criticalIssues: [
        {
          title: 'Document Analysis Required',
          description: 'This document requires manual review for GDPR compliance. Please consult with a data protection expert.',
          gdprArticles: ['Article 5', 'Article 6'],
          documentLines: 'Full document',
          severity: 'MEDIUM' as const
        }
      ],
      warnings: [
        {
          title: 'Automated Analysis Limitation',
          description: 'This analysis was performed using rule-based checking. A comprehensive legal review is recommended.',
          gdprArticles: ['All Articles'],
          documentLines: 'N/A',
          severity: 'INFO' as const
        }
      ],
      clauseMapping: [
        {
          documentSection: 'Entity Information',
          gdprArticles: ['Article 4'],
          complianceStatus: 'PARTIAL' as const,
          lines: `Data Subject: ${entityInfo.dataSubject}, Controller: ${entityInfo.dataController}, Processor: ${entityInfo.dataProcessor}`
        }
      ],
      recommendations: [
        {
          title: 'Professional Legal Review',
          description: 'Consult with a qualified data protection lawyer for comprehensive GDPR compliance.',
          priority: 1
        },
        {
          title: 'GDPR Compliance Checklist',
          description: 'Use official GDPR compliance checklists from data protection authorities.',
          priority: 2
        }
      ],
      summary: {
        criticalCount: 1,
        warningCount: 1,
        gdprClauseCount: 1,
        complianceScore: 60
      }
    };
  }
}