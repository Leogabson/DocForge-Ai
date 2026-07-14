export interface AIProvider {
  /**
   * Summarize the provided document content.
   */
  summarize(content: string): Promise<string>;

  /**
   * Rewrite document content matching the user's instructions (e.g., tone adjustments).
   */
  rewrite(content: string, instruction: string): Promise<string>;

  /**
   * Run a precision grammar and spelling check on the text.
   */
  grammar(content: string): Promise<string>;

  /**
   * Translate the content to a target language.
   */
  translate(content: string, targetLanguage: string): Promise<string>;

  /**
   * Improve content writing quality.
   */
  improveWriting(content: string): Promise<string>;

  /**
   * General completion helper.
   */
  generate(prompt: string): Promise<string>;
}
