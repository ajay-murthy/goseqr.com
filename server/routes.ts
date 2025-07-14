import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertDocumentSchema, insertAnalysisSchema, entityInfoSchema } from "@shared/schema.js";
import { DocumentParser } from "./services/document-parser.js";
import { GDPRAnalyzer } from "./services/gdpr-analyzer.js";
import { HuggingFaceGDPRAnalyzer } from "./services/huggingface-analyzer.js";
import { DeepSeekGDPRAnalyzer } from "./services/deepseek-analyzer.js";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload document
  app.post("/api/documents", upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { originalname, mimetype, size, buffer } = req.file;
      
      // Parse document content
      const content = await DocumentParser.parseDocument(buffer, mimetype, originalname);
      
      const documentData = {
        filename: originalname,
        originalName: originalname,
        mimeType: mimetype,
        size,
        content,
      };

      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);

      res.json(document);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json(document);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Analyze document
  app.post("/api/documents/:id/analyze", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const entityInfo = entityInfoSchema.parse(req.body);
      
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Check if analysis already exists
      const existingAnalysis = await storage.getAnalysisByDocumentId(documentId);
      if (existingAnalysis) {
        return res.json(existingAnalysis);
      }

      // Perform GDPR analysis with OpenAI and fallback system
      let analysisResults;
      try {
        // Try OpenAI first
        analysisResults = await GDPRAnalyzer.analyzeDocument(document.content, entityInfo);
      } catch (error) {
        console.log('OpenAI failed, falling back to rule-based analyzer:', error.message);
        // Fallback to free rule-based analyzer
        analysisResults = await HuggingFaceGDPRAnalyzer.analyzeDocument(document.content, entityInfo);
      }
      
      const analysisData = {
        documentId,
        dataSubject: entityInfo.dataSubject,
        dataController: entityInfo.dataController,
        dataProcessor: entityInfo.dataProcessor,
        analysisResults,
        complianceScore: analysisResults.summary.complianceScore,
      };

      const validatedData = insertAnalysisSchema.parse(analysisData);
      const analysis = await storage.createAnalysis(validatedData);

      res.json(analysis);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get analysis
  app.get("/api/analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get analysis by document ID
  app.get("/api/documents/:id/analysis", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const analysis = await storage.getAnalysisByDocumentId(documentId);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
