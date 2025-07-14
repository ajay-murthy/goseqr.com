import { openai } from './openai.js';
import { type EntityInfo, type GDPRAnalysisResult } from '@shared/schema';

export class GDPRAnalyzer {
  static async analyzeDocument(
    documentContent: string,
    entityInfo: EntityInfo
  ): Promise<GDPRAnalysisResult> {
    // Truncate document to avoid token limits (keep first 15000 chars)
    const truncatedContent = documentContent.length > 15000 
      ? documentContent.substring(0, 15000) + '... [document truncated]'
      : documentContent;

    const prompt = `
    You are a GDPR compliance expert. Analyze the following document for GDPR compliance issues.

    Document Content:
    ${truncatedContent}

    Entity Information:
    - Data Subject: ${entityInfo.dataSubject}
    - Data Controller: ${entityInfo.dataController}
    - Data Processor: ${entityInfo.dataProcessor}

    Please provide a comprehensive GDPR compliance analysis in JSON format with the following structure:
    {
      "criticalIssues": [
        {
          "title": "Issue title",
          "description": "Detailed description of the issue",
          "gdprArticles": ["Article 6", "Article 13"],
          "documentLines": "Line numbers or section references",
          "severity": "CRITICAL"
        }
      ],
      "warnings": [
        {
          "title": "Warning title",
          "description": "Detailed description of the warning",
          "gdprArticles": ["Article 7"],
          "documentLines": "Line numbers or section references",
          "severity": "WARNING"
        }
      ],
      "clauseMapping": [
        {
          "documentSection": "Section name and line numbers",
          "gdprArticles": ["Article 5", "Article 6"],
          "complianceStatus": "NON_COMPLIANT",
          "lines": "Line numbers"
        }
      ],
      "recommendations": [
        {
          "title": "Recommendation title",
          "description": "Detailed recommendation",
          "priority": 1
        }
      ],
      "summary": {
        "criticalCount": 0,
        "warningCount": 0,
        "gdprClauseCount": 0,
        "complianceScore": 0
      }
    }

    Focus on:
    1. Legal basis for processing (Article 6)
    2. Data subject rights (Articles 15-22)
    3. Data protection principles (Article 5)
    4. Consent requirements (Article 7)
    5. Information requirements (Articles 13-14)
    6. Data retention (Article 5(1)(e))
    7. Data security (Article 32)
    8. Data transfers (Articles 44-49)
    9. Privacy by design (Article 25)
    10. Data protection impact assessments (Article 35)

    Provide specific, actionable recommendations with exact GDPR article references.
    Calculate compliance score as percentage (0-100).
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a GDPR compliance expert. Provide detailed analysis in valid JSON format only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const analysisResult = JSON.parse(response.choices[0].message.content || '{}');
      
      // Validate and ensure proper structure
      return this.validateAnalysisResult(analysisResult);
    } catch (error) {
      throw new Error(`GDPR analysis failed: ${error.message}`);
    }
  }

  private static validateAnalysisResult(result: any): GDPRAnalysisResult {
    // Ensure all required fields are present with defaults
    return {
      criticalIssues: result.criticalIssues || [],
      warnings: result.warnings || [],
      clauseMapping: result.clauseMapping || [],
      recommendations: result.recommendations || [],
      summary: {
        criticalCount: result.summary?.criticalCount || 0,
        warningCount: result.summary?.warningCount || 0,
        gdprClauseCount: result.summary?.gdprClauseCount || 0,
        complianceScore: result.summary?.complianceScore || 0,
      },
    };
  }
}
