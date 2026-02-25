/**
 * Avery 配置
 */

import { JobTitle } from './types';

export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  n8nWebhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678',
};

// 职位选项
export const jobTitles = [
  {
    value: JobTitle.CEO_FOUNDER,
    label: 'CEO / 创始人',
    icon: '👔',
    description: '创业者、企业家、公司决策者',
  },
  {
    value: JobTitle.PRODUCT_MANAGER,
    label: '产品经理',
    icon: '📱',
    description: '产品从业者、互联网从业者',
  },
  {
    value: JobTitle.SALES_DIRECTOR,
    label: '销售总监 / Sales VP',
    icon: '💰',
    description: '销售团队、B2B从业者、企业主',
  },
  {
    value: JobTitle.MARKETING_LEADER,
    label: '市场营销负责人',
    icon: '📢',
    description: '营销人员、增长黑客',
  },
  {
    value: JobTitle.TECH_LEAD,
    label: '技术负责人 / CTO',
    icon: '💻',
    description: '技术管理者、开发者、CTO',
  },
  {
    value: JobTitle.HR_DIRECTOR,
    label: 'HR总监',
    icon: '👥',
    description: 'HR从业者、企业管理者',
  },
  {
    value: JobTitle.OPERATIONS_MANAGER,
    label: '运营经理',
    icon: '📊',
    description: '运营人员、增长团队',
  },
  {
    value: JobTitle.CONSULTANT,
    label: '顾问 / 咨询师',
    icon: '💡',
    description: '企业主、高管、决策者',
  },
  {
    value: JobTitle.FREELANCER,
    label: '自由职业者',
    icon: '🎯',
    description: '自由职业者、独立工作者',
  },
  {
    value: JobTitle.OTHER,
    label: '其他',
    icon: '🔧',
    description: '其他职位（手动输入）',
  },
] as const;

// 内容质量选项
export const contentQualities = [
  {
    value: 'normal',
    label: '普通',
    icon: '📝',
    description: '精炼内容，适合快速阅读（2-3个字段，每处15-25字）',
    color: 'from-gray-500 to-gray-600',
  },
  {
    value: 'advanced',
    label: '进阶',
    icon: '📚',
    description: '丰富内容，有一定深度（3-4个字段，每处25-50字）',
    color: 'from-blue-500 to-blue-600',
  },
  {
    value: 'professional',
    label: '专业',
    icon: '🏆',
    description: '深度内容，信息密度最高（全字段，每处50-100字）',
    color: 'from-purple-500 to-purple-600',
  },
] as const;

// 输出格式选项
export const outputFormats = [
  {
    value: 'text_only',
    label: '纯文字',
    icon: '📄',
    description: '只生成文字内容，不生成图片',
    color: 'from-gray-400 to-gray-500',
  },
  {
    value: 'with_image',
    label: '一图',
    icon: '🖼️',
    description: '生成文字内容 + 配图',
    color: 'from-green-500 to-green-600',
  },
] as const;

// 生成步骤
export const generationSteps = [
  { key: 'validate', label: '验证输入' },
  { key: 'extract', label: '提取资料' },
  { key: 'recommend', label: '推荐主题' },
  { key: 'analyze', label: '分析结构' },
  { key: 'retrieve', label: '知识检索' },
  { key: 'generate', label: '生成内容' },
  { key: 'design', label: '视觉设计' },
  { key: 'image', label: '生成图片' },
  { key: 'complete', label: '完成' },
] as const;

// 内容结构类型（用于显示，不作为用户输入）
export const contentStructures = {
  classification_display: '分类展示型',
  process_steps: '流程步骤型',
  comparison_table: '对比表格型',
  tool_list: '工具列表型',
  checklist: '清单要点型',
  custom: '自定义结构',
} as const;
