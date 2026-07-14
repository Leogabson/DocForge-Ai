import { GoogleGenAI } from '@google/genai';
import { AIProvider } from './AIProvider.js';
import { config } from '../../config/index.js';
import { logger } from '../../config/logger.js';
import { AIProviderError } from '../../errors/customErrors.js';

export class GeminiProvider implements AIProvider {
  private aiClient: GoogleGenAI | null = null;
  private model: string;

  constructor() {
    this.model = config.ai.model || 'gemini-3-flash';
    
    if (config.ai.apiKey) {
      this.aiClient = new GoogleGenAI({ apiKey: config.ai.apiKey });
      logger.info(`AI: GeminiProvider initialized with model ${this.model}`);
    } else {
      logger.warn('AI: GEMINI_API_KEY is missing. GeminiProvider running in LOCAL FALLBACK mode.');
    }
  }

  private isFallbackMode(): boolean {
    return this.aiClient === null;
  }

  public async generate(prompt: string): Promise<string> {
    if (this.isFallbackMode() || !this.aiClient) {
      return `[Local Fallback: Completion generated for prompt: "${prompt.substring(0, 40)}..."]`;
    }

    try {
      const response = await this.aiClient.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      if (!response.text) {
        throw new Error('Empty response received from Gemini.');
      }
      return response.text;
    } catch (error: any) {
      throw new AIProviderError(`Gemini generation failed: ${error.message}`, error);
    }
  }

  public async summarize(content: string): Promise<string> {
    if (this.isFallbackMode()) {
      // Basic rule-based fallback: extract headings or first few lines
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      const summaryPoints = lines.slice(0, 3).map(l => `- ${l.replace(/^#+\s*/, '')}`);
      return `### Executive Summary (Local Fallback)\n${summaryPoints.join('\n') || '- No content available to summarize.'}`;
    }

    const prompt = `Please summarize the following document as a concise set of key points or an executive summary. Return only the summary in Markdown format:\n\n${content}`;
    return this.generate(prompt);
  }

  public async rewrite(content: string, instruction: string): Promise<string> {
    if (this.isFallbackMode()) {
      return `${content}\n\n[Local Fallback: Rewritten matching tone "${instruction}"]`;
    }

    const prompt = `Please rewrite the following content according to this instruction: "${instruction}". Preserve structure and markdown links where possible. Return ONLY the rewritten text:\n\nContent:\n${content}`;
    return this.generate(prompt);
  }

  public async grammar(content: string): Promise<string> {
    if (this.isFallbackMode()) {
      return content; // Return unchanged in fallback
    }

    const prompt = `Please proofread and correct any spelling or grammatical errors in the following text. Preserve all formatting, markdown layout, and spacing exactly. Return ONLY the corrected text:\n\n${content}`;
    return this.generate(prompt);
  }

  public async translate(content: string, targetLanguage: string): Promise<string> {
    if (this.isFallbackMode()) {
      return `[Local Fallback: Translated to ${targetLanguage}]\n\n${content}`;
    }

    const prompt = `Please translate the following text into ${targetLanguage}. Maintain all markdown elements and structural tags. Return ONLY the translated text:\n\n${content}`;
    return this.generate(prompt);
  }

  public async improveWriting(content: string): Promise<string> {
    if (this.isFallbackMode()) {
      return content;
    }

    const prompt = `Please rewrite the following text to improve its clarity, vocabulary, sentence flow, and professional tone. Keep the same core meaning and markdown formatting. Return ONLY the polished text:\n\n${content}`;
    return this.generate(prompt);
  }
}
export const aiProvider = new GeminiProvider();
