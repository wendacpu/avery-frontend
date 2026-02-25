/**
 * Avery API Client
 * 与后端 FastAPI 通信
 */

import { config } from './config';
import type {
  ContentGenerationRequest,
  ContentGenerationResponse,
  GeneratedContent,
  ExtractDataResponse,
  GenerationStatus,
} from './types';

class AveryAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  /**
   * 提取数据并推荐主题
   * 用于前端 Step 1 → Step 2
   */
  async extractAndRecommend(request: ContentGenerationRequest): Promise<ExtractDataResponse> {
    const response = await fetch(`${this.baseUrl}/content/extract-and-recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '数据提取失败');
    }

    return response.json();
  }

  /**
   * 触发内容生成
   */
  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/content/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '生成失败');
    }

    return response.json();
  }

  /**
   * 获取历史记录
   */
  async getHistory(limit: number = 20, offset: number = 0): Promise<GeneratedContent[]> {
    const response = await fetch(`${this.baseUrl}/content/?limit=${limit}&offset=${offset}`);

    if (!response.ok) {
      throw new Error('获取历史记录失败');
    }

    return response.json();
  }

  /**
   * 获取单条内容
   */
  async getContent(id: string): Promise<GeneratedContent> {
    const response = await fetch(`${this.baseUrl}/content/${id}`);

    if (!response.ok) {
      throw new Error('获取内容失败');
    }

    return response.json();
  }

  /**
   * 更新内容
   */
  async updateContent(id: string, content: string): Promise<GeneratedContent> {
    const response = await fetch(`${this.baseUrl}/content/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generated_content: content }),
    });

    if (!response.ok) {
      throw new Error('更新内容失败');
    }

    return response.json();
  }

  /**
   * 删除内容
   */
  async deleteContent(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/content/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('删除内容失败');
    }
  }

  /**
   * 切换收藏
   */
  async toggleFavorite(id: string): Promise<GeneratedContent> {
    const response = await fetch(`${this.baseUrl}/content/${id}/favorite`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('操作失败');
    }

    return response.json();
  }

  /**
   * 重新生成内容（使用相同参数）
   */
  async regenerateContent(id: string): Promise<ContentGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/content/${id}/regenerate`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '重新生成失败');
    }

    return response.json();
  }

  /**
   * 导出内容
   */
  downloadContent(content: string, filename: string = 'linkedin-post.md') {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 复制到剪贴板
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}

// 导出单例
export const api = new AveryAPI();
