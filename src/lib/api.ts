/**
 * Avery API 客户端
 * 与后端 FastAPI 通信
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * 内容类型
 */
export enum ContentType {
  INDUSTRY_TRENDS = 'industry_trends',
  POSITION_INSIGHT = 'position_insight',
  CUSTOM = 'custom',
}

/**
 * 生成状态
 */
export enum GenerationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * API 响应类型
 */
interface ContentGenerateRequest {
  linkedin_url: string;
  company_url?: string;
  content_type: ContentType;
  additional_context?: string;
}

interface ContentGenerateResponse {
  id: string;
  status: GenerationStatus;
  message: string;
}

interface ContentResponse {
  id: string;
  user_id: string;
  content_type: ContentType;
  linkedin_url: string;
  company_url?: string;
  status: GenerationStatus;
  generated_content?: string;
  generated_images?: any[];
  is_favorited: boolean;
  created_at: string;
  completed_at?: string;
}

interface LinkedInValidationRequest {
  url: string;
}

interface LinkedInValidationResponse {
  valid: boolean;
  message: string;
  profile_id?: string;
}

/**
 * API 客户端类
 */
export class AveryAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 生成内容
   */
  async generateContent(request: ContentGenerateRequest): Promise<ContentGenerateResponse> {
    const response = await fetch(`${this.baseUrl}/content/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate content');
    }

    return response.json();
  }

  /**
   * 获取历史记录
   */
  async getHistory(limit: number = 10, offset: number = 0): Promise<ContentResponse[]> {
    const response = await fetch(`${this.baseUrl}/content/?limit=${limit}&offset=${offset}`);

    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    return response.json();
  }

  /**
   * 获取单条内容
   */
  async getContent(contentId: string): Promise<ContentResponse> {
    const response = await fetch(`${this.baseUrl}/content/${contentId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }

    return response.json();
  }

  /**
   * 更新内容
   */
  async updateContent(contentId: string, content: string): Promise<ContentResponse> {
    const response = await fetch(`${this.baseUrl}/content/${contentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ generated_content: content }),
    });

    if (!response.ok) {
      throw new Error('Failed to update content');
    }

    return response.json();
  }

  /**
   * 切换收藏状态
   */
  async toggleFavorite(contentId: string): Promise<ContentResponse> {
    const response = await fetch(`${this.baseUrl}/content/${contentId}/favorite`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to toggle favorite');
    }

    return response.json();
  }

  /**
   * 验证 LinkedIn URL
   */
  async validateLinkedInUrl(url: string): Promise<LinkedInValidationResponse> {
    const response = await fetch(`${this.baseUrl}/content/linkedin/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Failed to validate LinkedIn URL');
    }

    return response.json();
  }

  /**
   * SSE 流式监听生成进度
   */
  streamProgress(executionId: string, onProgress: (progress: any) => void, onComplete: (result: any) => void, onError: (error: string) => void) {
    const eventSource = new EventSource(`${this.baseUrl}/n8n/stream/${executionId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'progress') {
        onProgress(data);
      } else if (data.type === 'complete') {
        onComplete(data.content);
        eventSource.close();
      } else if (data.type === 'error') {
        onError(data.error);
        eventSource.close();
      }
    };

    eventSource.onerror = (error) => {
      onError('Connection error');
      eventSource.close();
    };
  }
}

// 导出单例实例
export const api = new AveryAPI();
