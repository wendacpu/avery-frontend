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
    label: 'CEO / Founder',
    icon: '👔',
    description: 'Entrepreneurs, business owners, company decision-makers',
  },
  {
    value: JobTitle.PRODUCT_MANAGER,
    label: 'Product Manager',
    icon: '📱',
    description: 'Product practitioners, internet practitioners',
  },
  {
    value: JobTitle.SALES_DIRECTOR,
    label: 'Sales Director / VP',
    icon: '💰',
    description: 'Sales teams, B2B practitioners, business owners',
  },
  {
    value: JobTitle.MARKETING_LEADER,
    label: 'Marketing Lead',
    icon: '📢',
    description: 'Marketing personnel, growth hackers',
  },
  {
    value: JobTitle.TECH_LEAD,
    label: 'Tech Lead / CTO',
    icon: '💻',
    description: 'Tech managers, developers, CTOs',
  },
  {
    value: JobTitle.HR_DIRECTOR,
    label: 'HR Director',
    icon: '👥',
    description: 'HR practitioners, corporate managers',
  },
  {
    value: JobTitle.OPERATIONS_MANAGER,
    label: 'Operations Manager',
    icon: '📊',
    description: 'Operations personnel, growth teams',
  },
  {
    value: JobTitle.CONSULTANT,
    label: 'Consultant',
    icon: '💡',
    description: 'Business owners, executives, decision-makers',
  },
  {
    value: JobTitle.FREELANCER,
    label: 'Freelancer',
    icon: '🎯',
    description: 'Freelancers, independent workers',
  },
  {
    value: JobTitle.OTHER,
    label: 'Other',
    icon: '🔧',
    description: 'Other roles (manual input)',
  },
] as const;

// 内容质量选项
export const contentQualities = [
  {
    value: 'normal',
    label: 'Normal',
    icon: '📝',
    description: 'Concise content, suitable for quick reading (2-3 fields, 15-25 words each)',
    color: 'from-gray-500 to-gray-600',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    icon: '📚',
    description: 'Rich content with some depth (3-4 fields, 25-50 words each)',
    color: 'from-blue-500 to-blue-600',
  },
  {
    value: 'professional',
    label: 'Professional',
    icon: '🏆',
    description: 'Deep content with maximum information density (all fields, 50-100 words each)',
    color: 'from-purple-500 to-purple-600',
  },
] as const;

// 输出格式选项
export const outputFormats = [
  {
    value: 'text_only',
    label: 'Text Only',
    icon: '📄',
    description: 'Generate text content only, no image',
    color: 'from-gray-400 to-gray-500',
  },
  {
    value: 'with_image',
    label: 'With Image',
    icon: '🖼️',
    description: 'Generate text content + image',
    color: 'from-green-500 to-green-600',
  },
] as const;

// 生成步骤
export const generationSteps = [
  { key: 'validate', label: 'Validate Input' },
  { key: 'extract', label: 'Extract Data' },
  { key: 'recommend', label: 'Recommend Topics' },
  { key: 'analyze', label: 'Analyze Structure' },
  { key: 'retrieve', label: 'Retrieve Knowledge' },
  { key: 'generate', label: 'Generate Content' },
  { key: 'design', label: 'Visual Design' },
  { key: 'image', label: 'Generate Image' },
  { key: 'complete', label: 'Complete' },
] as const;

// 内容结构类型（用于显示，不作为用户输入）
export const contentStructures = {
  classification_display: 'Categorized Display',
  process_steps: 'Process Steps',
  comparison_table: 'Comparison Table',
  tool_list: 'Tool List',
  checklist: 'Checklist',
  custom: 'Custom Structure',
} as const;
