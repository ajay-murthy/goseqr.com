import { documents, analyses, type Document, type InsertDocument, type Analysis, type InsertAnalysis } from "@shared/schema";

export interface IStorage {
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getAnalysisByDocumentId(documentId: number): Promise<Analysis | undefined>;
}

export class MemStorage implements IStorage {
  private documents: Map<number, Document>;
  private analyses: Map<number, Analysis>;
  private currentDocumentId: number;
  private currentAnalysisId: number;

  constructor() {
    this.documents = new Map();
    this.analyses = new Map();
    this.currentDocumentId = 1;
    this.currentAnalysisId = 1;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = {
      ...insertDocument,
      id,
      uploadedAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.currentAnalysisId++;
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getAnalysisByDocumentId(documentId: number): Promise<Analysis | undefined> {
    return Array.from(this.analyses.values()).find(
      (analysis) => analysis.documentId === documentId
    );
  }
}

export const storage = new MemStorage();
