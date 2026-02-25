# Avery 前端开发指南

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 预览部署流程

#### 1. 创建功能分支

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

#### 2. 开发和测试

```bash
# 修改代码后，本地测试
npm run dev
```

#### 3. 提交更改

```bash
git add .
git commit -m "feat: describe your changes"
```

#### 4. 推送到 GitHub

```bash
git push -u origin feature/your-feature-name
```

#### 5. 查看 Vercel 预览部署

- 访问 Vercel Dashboard → Deployments
- 找到 `feature/your-feature-name` 分支的预览部署
- 点击预览 URL 测试

#### 6. 合并到生产

```bash
# 测试通过后
git checkout main
git merge feature/your-feature-name
git push origin main
```

## 📋 Git 工作流程

### 分支策略

- `main` - 生产环境（自动部署到 www.averycmo.com）
- `dev` - 开发环境（可选，日常开发使用）
- `feature/*` - 功能分支
- `fix/*` - 修复分支

### Commit 消息规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

## 🔧 环境配置

### 本地开发

`.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 生产环境

在 Vercel Dashboard 配置：
```env
NEXT_PUBLIC_API_URL=https://avery-backend-production.up.railway.app
```

## 📦 部署

### 自动部署

- **推送到 main 分支** → 自动部署到生产环境
- **推送到其他分支** → 自动创建预览部署

### 手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 预览部署
vercel

# 生产部署
vercel --prod
```

## 🧪 测试

### 本地测试

```bash
# 启动后端（另一个终端）
cd ../backend
source venv/bin/activate
uvicorn api.main:app --reload --port 8000

# 启动前端
npm run dev
```

### 预览环境测试

1. 推送代码到 GitHub
2. 等待 Vercel 创建预览部署
3. 访问预览 URL 测试
4. 检查所有功能是否正常

## 🔗 有用的链接

- **前端生产**: https://www.averycmo.com
- **后端 API**: https://avery-backend-production.up.railway.app
- **API 文档**: https://avery-backend-production.up.railway.app/docs
- **Vercel Dashboard**: https://vercel.com
- **GitHub 仓库**: https://github.com/wendacpu/avery-frontend

## ⚠️ 常见问题

### 端口被占用

```bash
# 查找占用进程
lsof -ti:3000

# 杀死进程
kill -9 $(lsof -ti:3000)
```

### 依赖安装失败

```bash
rm -rf node_modules package-lock.json
npm install
```

### 预览部署没有创建

1. 检查 Vercel 是否连接到 GitHub
2. 确认分支已推送到 GitHub
3. 在 Vercel Dashboard 查看 Deployments

## 📞 需要帮助？

- 查看 Vercel 部署日志
- 检查 GitHub Actions 状态
- 联系团队成员
