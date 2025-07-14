import { type EntityInfo, type GDPRAnalysisResult } from '@shared/schema';

export class DeepSeekGDPRAnalyzer {
  private static readonly API_URL = 'https://api.deepseek.com/v1/chat/completions';
  private static readonly MODEL = 'deepseek-chat';

  static async analyzeDocument(
    documentContent: string,
    entityInfo: EntityInfo
  ): Promise<GDPRAnalysisResult> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    // Truncate document if too large to manage token limits
    const maxContentLength = 15000; // Conservative limit for document content
    const truncatedContent = documentContent.length > maxContentLength 
      ? documentContent.substring(0, maxContentLength) + "\n\n[Document truncated for analysis]"
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
    Return ONLY valid JSON without any markdown formatting or explanations.
    `;

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a GDPR compliance expert. Provide detailed analysis in valid JSON format only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from DeepSeek API');
      }

      const analysisResult = JSON.parse(content);
      
      // Validate and ensure proper structure
      return this.validateAnalysisResult(analysisResult);
    } catch (error) {
      console.error('DeepSeek GDPR analysis failed:', error);
      throw new Error(`GDPR analysis failed: ${error.message}`);
    }
  }

  private static validateAnalysisResult(result: any): GDPRAnalysisResult {
    // Ensure all required fields are present with defaults
    return {
      criticalIssues: Array.isArray(result.criticalIssues) ? result.criticalIssues : [],
      warnings: Array.isArray(result.warnings) ? result.warnings : [],
      clauseMapping: Array.isArray(result.clauseMapping) ? result.clauseMapping : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      summary: {
        criticalCount: result.summary?.criticalCount || 0,
        warningCount: result.summary?.warningCount || 0,
        gdprClauseCount: result.summary?.gdprClauseCount || 0,
        complianceScore: result.summary?.complianceScore || 0,
      },
    };
  }
}