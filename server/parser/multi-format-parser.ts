import fs from "fs";
import path from "path";
import { storage } from "../storage";
import type { Upload } from "@shared/schema";

interface ParsedContent {
  descriptions: string[];
  metadata: {
    format: string;
    lineCount: number;
    wordCount: number;
    errors: string[];
  };
}

class MultiFormatParser {
  private supportedFormats = ['.txt', '.md', '.json', '.csv', '.docx'];

  async processFile(upload: Upload): Promise<void> {
    try {
      const fileExtension = path.extname(upload.originalName).toLowerCase();
      
      if (!this.supportedFormats.includes(fileExtension)) {
        await storage.updateUpload(upload.id, {
          status: 'failed',
          errors: [`Unsupported file format: ${fileExtension}`]
        });
        return;
      }

      const fileContent = await fs.promises.readFile(upload.path);
      const parsed = await this.parseContent(fileContent, fileExtension, upload.originalName);
      
      await storage.updateUpload(upload.id, {
        status: 'completed',
        processedCount: parsed.descriptions.length,
        totalCount: parsed.descriptions.length,
        errors: parsed.metadata.errors
      });

      // Process each description through the effect generation pipeline
      for (const description of parsed.descriptions) {
        if (description.trim().length > 10) {
          try {
            await this.createEffectJob(description.trim());
          } catch (error) {
            console.error("Failed to create effect job:", error);
          }
        }
      }

    } catch (error) {
      console.error("File processing error:", error);
      await storage.updateUpload(upload.id, {
        status: 'failed',
        errors: [error instanceof Error ? error.message : 'Unknown processing error']
      });
    }
  }

  private async parseContent(content: Buffer, format: string, filename: string): Promise<ParsedContent> {
    const errors: string[] = [];
    let descriptions: string[] = [];

    try {
      switch (format) {
        case '.txt':
        case '.md':
          descriptions = this.parseTextFile(content);
          break;
        case '.json':
          descriptions = this.parseJsonFile(content);
          break;
        case '.csv':
          descriptions = this.parseCsvFile(content);
          break;
        case '.docx':
          descriptions = await this.parseDocxFile(content);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      errors.push(`Parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Try fallback text parsing
      try {
        descriptions = this.parseTextFile(content);
        errors.push("Falling back to text parsing");
      } catch (fallbackError) {
        errors.push("Fallback parsing also failed");
      }
    }

    // Filter out empty or too short descriptions
    const validDescriptions = descriptions.filter(desc => desc.trim().length > 5);
    
    if (validDescriptions.length === 0) {
      errors.push("No valid effect descriptions found in file");
    }

    const allText = descriptions.join(' ');
    const wordCount = allText.split(/\s+/).filter(word => word.length > 0).length;

    return {
      descriptions: validDescriptions,
      metadata: {
        format,
        lineCount: descriptions.length,
        wordCount,
        errors
      }
    };
  }

  private parseTextFile(content: Buffer): string[] {
    const text = content.toString('utf-8');
    
    // Split by lines and filter out empty ones
    const lines = text.split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#') && !line.startsWith('//'));
    
    // Also try to split by common delimiters
    const additionalSplits = text.split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10);
    
    return [...lines, ...additionalSplits];
  }

  private parseJsonFile(content: Buffer): string[] {
    const text = content.toString('utf-8');
    const jsonData = JSON.parse(text);
    const descriptions: string[] = [];

    // Handle different JSON structures
    if (Array.isArray(jsonData)) {
      jsonData.forEach(item => {
        if (typeof item === 'string') {
          descriptions.push(item);
        } else if (typeof item === 'object' && item !== null) {
          this.extractStringsFromObject(item, descriptions);
        }
      });
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      this.extractStringsFromObject(jsonData, descriptions);
    }

    return descriptions;
  }

  private extractStringsFromObject(obj: any, descriptions: string[]): void {
    const potentialFields = ['description', 'effect', 'text', 'content', 'prompt', 'instruction'];
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.length > 5) {
        // Prioritize known description fields
        if (potentialFields.some(field => key.toLowerCase().includes(field))) {
          descriptions.unshift(value);
        } else {
          descriptions.push(value);
        }
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'string' && item.length > 5) {
            descriptions.push(item);
          } else if (typeof item === 'object' && item !== null) {
            this.extractStringsFromObject(item, descriptions);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        this.extractStringsFromObject(value, descriptions);
      }
    }
  }

  private parseCsvFile(content: Buffer): string[] {
    const text = content.toString('utf-8');
    const lines = text.split(/\r?\n/);
    const descriptions: string[] = [];

    // Try to detect CSV structure
    const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase());
    const descriptionColumnIndex = headers?.findIndex(header => 
      header.includes('description') || 
      header.includes('effect') || 
      header.includes('text') ||
      header.includes('prompt')
    );

    if (descriptionColumnIndex !== undefined && descriptionColumnIndex >= 0) {
      // Use the identified description column
      for (let i = 1; i < lines.length; i++) {
        const columns = this.parseCsvLine(lines[i]);
        if (columns && columns[descriptionColumnIndex]) {
          descriptions.push(columns[descriptionColumnIndex].trim());
        }
      }
    } else {
      // Fall back to extracting from all columns
      for (let i = 1; i < lines.length; i++) {
        const columns = this.parseCsvLine(lines[i]);
        if (columns) {
          columns.forEach(column => {
            if (column && column.trim().length > 10) {
              descriptions.push(column.trim());
            }
          });
        }
      }
    }

    return descriptions;
  }

  private parseCsvLine(line: string): string[] | null {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result.length > 0 ? result : null;
  }

  private async parseDocxFile(content: Buffer): Promise<string[]> {
    // Basic DOCX parsing without external libraries
    // DOCX files are ZIP archives containing XML files
    try {
      // For now, try to extract text using a simple approach
      // In a production system, you'd want a proper DOCX parser
      const text = content.toString('binary');
      
      // Extract text between XML tags (very basic approach)
      const textMatches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      const descriptions: string[] = [];
      
      if (textMatches) {
        textMatches.forEach(match => {
          const textContent = match.replace(/<[^>]*>/g, '').trim();
          if (textContent.length > 5) {
            descriptions.push(textContent);
          }
        });
      }

      // If no text found, try a different approach
      if (descriptions.length === 0) {
        // Extract any readable text
        const readableText = content.toString('utf-8', 0, Math.min(content.length, 10000))
          .replace(/[^\x20-\x7E\s]/g, '') // Keep only printable ASCII
          .split(/\s+/)
          .filter(word => word.length > 3)
          .join(' ');
        
        if (readableText.length > 20) {
          descriptions.push(readableText);
        }
      }

      return descriptions;
    } catch (error) {
      throw new Error(`Failed to parse DOCX file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createEffectJob(description: string): Promise<void> {
    try {
      await storage.createJob({
        description,
        platform: 'javascript',
        options: { 
          source: 'file_upload',
          performance: 'medium' 
        },
        estimatedTime: 180 // 3 minutes default
      });
    } catch (error) {
      console.error("Failed to create job from parsed description:", error);
    }
  }

  // Utility method to validate file format
  isFormatSupported(filename: string): boolean {
    const extension = path.extname(filename).toLowerCase();
    return this.supportedFormats.includes(extension);
  }

  // Get file format info
  getFormatInfo(filename: string) {
    const extension = path.extname(filename).toLowerCase();
    
    const formatInfo = {
      '.txt': { name: 'Plain Text', description: 'Simple text file with effect descriptions' },
      '.md': { name: 'Markdown', description: 'Markdown formatted text with effect descriptions' },
      '.json': { name: 'JSON', description: 'Structured data with effect descriptions' },
      '.csv': { name: 'CSV', description: 'Comma-separated values with effect data' },
      '.docx': { name: 'Word Document', description: 'Microsoft Word document with effect descriptions' }
    };

    return formatInfo[extension as keyof typeof formatInfo] || { 
      name: 'Unknown', 
      description: 'Unsupported file format' 
    };
  }

  // Batch process multiple files
  async processBatch(uploads: Upload[]): Promise<void> {
    const processingPromises = uploads.map(upload => this.processFile(upload));
    await Promise.allSettled(processingPromises);
  }
}

export const multiFormatParser = new MultiFormatParser();
