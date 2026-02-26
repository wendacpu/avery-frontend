/**
 * Avery 类型定义
 */

// 职位类型
export enum JobTitle {
  CEO_FOUNDER = 'ceo_founder',
  PRODUCT_MANAGER = 'product_manager',
  SALES_DIRECTOR = 'sales_director',
  MARKETING_LEADER = 'marketing_leader',
  TECH_LEAD = 'tech_lead',
  HR_DIRECTOR = 'hr_director',
  OPERATIONS_MANAGER = 'operations_manager',
  CONSULTANT = 'consultant',
  FREELANCER = 'freelancer',
  OTHER = 'other',
}

// 内容质量等级
export enum ContentQuality {
  NORMAL = 'normal',      // 普通：2-3个字段 × 15-25字
  ADVANCED = 'advanced',  // 进阶：3-4个字段 × 25-50字
  PROFESSIONAL = 'professional',  // 专业：全部字段 × 50-100字（有图片时可缩短）
}

// 输出格式
export enum OutputFormat {
  TEXT_ONLY = 'text_only',    // 纯文字
  WITH_IMAGE = 'with_image',  // 一图
}

// 生成状态
export enum GenerationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// 主题推荐
export interface TopicRecommendation {
  topic: string;
  source: 'hot_topic' | 'historical' | 'industry_trend';
  reason: string;
  estimated_engagement?: number;  // 预估互动度（可选）
}

// 内容生成请求
export interface ContentGenerationRequest {
  linkedin_url: string;        // LinkedIn URL（必选）
  company_url?: string;         // 公司网站 URL（可选）
  job_title: JobTitle;          // 职位（必选）
  content_quality: ContentQuality;  // 内容质量（必选）
  output_format: OutputFormat;  // 输出格式（必选）
  selected_topic: string;       // 用户选择或手动输入的主题
  additional_context?: string;  // 额外补充信息（可选）
  language?: string;            // 语言：en=英文, zh=中文，默认英文
}

// 内容生成响应
export interface ContentGenerationResponse {
  id: string;
  status: GenerationStatus;
  message: string;
  execution_id?: string;
}

// 生成结果（从轮询获取）
export interface GeneratedContent {
  id: string;
  user_id: string;
  job_title: JobTitle;
  content_quality: ContentQuality;
  output_format: OutputFormat;
  linkedin_url?: string;
  company_url?: string;
  selected_topic?: string;
  status: GenerationStatus;
  generated_content?: string;
  image_url?: string;
  content_structure?: string;  // 使用的内容结构（分类展示型/流程步骤型等）
  target_audience?: string;    // 目标受众
  is_favorited: boolean;
  created_at: string;
  completed_at?: string;
}

// 数据提取响应
export interface ExtractDataResponse {
  linkedin_profile?: LinkedInProfile;
  company_info?: CompanyInfo;
  topic_recommendations: TopicRecommendation[];
}

// LinkedIn 资料提取结果
export interface LinkedInProfile {
  name?: string;
  title?: string;
  company?: string;
  industry?: string;
  skills?: string[];
  about?: string;
  recent_posts?: RecentPost[];  // 最近3个月的帖子
}

// 历史帖子
export interface RecentPost {
  url?: string;
  content: string;
  published_at?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  engagement_score?: number;  // 综合互动分数
}

// 公司信息
export interface CompanyInfo {
  name?: string;
  description?: string;
  products_services?: string[];
  target_customers?: string;
  latest_news?: string[];
}
