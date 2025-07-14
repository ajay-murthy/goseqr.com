import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  content: text("content").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  dataSubject: text("data_subject").notNull(),
  dataController: text("data_controller").notNull(),
  dataProcessor: text("data_processor").notNull(),
  analysisResults: jsonb("analysis_results").notNull(),
  complianceScore: integer("compliance_score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});

export const entityInfoSchema = z.object({
  dataSubject: z.string().min(1, "Data subject is required"),
  dataController: z.string().min(1, "Data controller is required"),
  dataProcessor: z.string().min(1, "Data processor is required"),
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;
export type EntityInfo = z.infer<typeof entityInfoSchema>;

export interface GDPRAnalysisResult {
  criticalIssues: Array<{
    title: string;
    description: string;
    gdprArticles: string[];
    documentLines: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  warnings: Array<{
    title: string;
    description: string;
    gdprArticles: string[];
    documentLines: string;
    severity: 'WARNING' | 'INFO';
  }>;
  clauseMapping: Array<{
    documentSection: string;
    gdprArticles: string[];
    complianceStatus: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
    lines: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: number;
  }>;
  summary: {
    criticalCount: number;
    warningCount: number;
    gdprClauseCount: number;
    complianceScore: number;
  };
}
