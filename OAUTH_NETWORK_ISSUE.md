# Google OAuth 网络问题解决方案

## 问题诊断

你遇到的问题是：`ConnectTimeoutError: fetch failed`

这表示无法连接到 Google 的 OAuth 服务器。原因可能是：

1. **地区网络限制** - 某些地区无法直接访问 Google 服务
2. **防火墙/代理** - 公司或学校网络阻止了连接
3. **DNS 问题** - 无法解析 Google 域名

## 解决方案

### 方案 1: 使用代理（如果你有）

1. 在系统或终端设置代理
2. 更新 `.env.local`：

```bash
# 取消注释并设置你的代理地址
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

3. 重启服务器

### 方案 2: 部署到支持 Google OAuth 的环境（推荐用于生产）

将应用部署到以下平台，它们可以直接访问 Google OAuth：

#### Vercel（推荐）
```bash
npm install -g vercel
vercel login
vercel
```

然后在 Vercel 项目设置中添加环境变量：
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL` = `https://your-domain.vercel.app`
- `NEXTAUTH_SECRET`

#### Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### 你的域名（averycmo.com 或 averycmo.ai）
1. 将代码部署到支持的服务器
2. 确保 DNS 正确指向服务器
3. 在 Google OAuth 设置中添加你的域名

### 方案 3: 使用模拟登录（仅用于开发体验）

我已添加临时模拟登录功能，让你可以先体验产品：

1. 访问 http://localhost:3001/login
2. 点击 **"🚀 Quick Demo Login (无需注册)"** 按钮
3. 自动登录并跳转到 Dashboard

**注意**: 模拟登录仅用于本地开发体验，生产环境需要真正的认证系统。

## 测试连接

运行以下命令测试是否能访问 Google OAuth：

```bash
curl -I https://accounts.google.com/o/oauth2/v2/auth
```

如果超时，说明确实无法直接访问。

## 推荐的开发流程

1. **本地开发**: 使用模拟登录体验功能
2. **测试 OAuth**: 部署到 Vercel 测试 Google OAuth
3. **生产环境**: 使用你的域名 (averycmo.com/ai)

## 其他 OAuth 提供商

如果 Google OAuth 一直有问题，可以考虑：

- GitHub OAuth（更容易访问）
- Email + Magic Link
- 自定义 OAuth 提供商

## 部署检查清单

部署到生产环境前确保：

- [ ] Google OAuth 重定向 URI 正确配置
- [ ] 环境变量已添加
- [ ] 域名 DNS 正确指向服务器
- [ ] HTTPS 证书已配置
- [ ] NEXTAUTH_URL 正确设置为生产域名
