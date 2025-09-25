# Aether - 智能聊天机器人

Aether 是一个功能完整、可直接部署到 Vercel 的 Gemini 聊天机器人 Web 应用。它基于 Next.js App Router 构建，并利用 Gemini 的强大功能，支持多轮对话、流式响应、图像理解和联网搜索。


## ✨ 核心功能

- **🤖 多轮对话历史**: 客户端保存对话历史，为 Gemini 提供上下文，实现连贯的交流。
- **⚡️ 流式响应**: 后端通过 SSE (Server-Sent Events) 实现流式输出，前端逐步渲染 token，带来“正在生成”的实时体验。
- **🖼️ 图像理解**: 支持上传图片并进行分析。模型能够识别图像内容并回答相关问题。
- **🌐 联网搜索与引用**: 自动调用 Gemini 内置的联网工具，并在前端清晰地展示信息来源引用。
- **🔐 安全设计**: API 密钥通过环境变量管理，不硬编码在代码中，确保安全。
- **🔑 访问控制**: 可选地通过环境变量设置访问密码，保护您的应用。
- **📂 历史管理**: 支持一键清除当前对话，或将对话历史下载为 JSON 文件。
- **💅 优雅的界面**: 基于 shadcn/ui 和 Tailwind CSS 构建，提供美观、响应式且易于使用的用户界面。
- **⚙️ 模型可配置**: 通过环境变量轻松切换使用的 Gemini 模型。

## 🛠️ 技术栈

- **前端**: Next.js (App Router), React, TypeScript
- **后端/API**: Next.js API Routes (Edge-runtime)
- **AI**: Google AI Gemini
- **UI 组件**: shadcn/ui, Lucide React
- **样式**: Tailwind CSS
- **包管理**: npm

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-repo/aether.git
cd aether
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

首先，你需要从 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取你的 Gemini API 密钥。

然后，在项目根目录下创建一个名为 `.env.local` 的文件，并将你的密钥添加进去。

`.env.local.example` 文件可作为模板参考。

```sh
# .env.local

# 必填：你的 Google Gemini API 密钥
GEMINI_API_KEY=在此处粘贴你的API密钥

# 可选：设置访问密码来保护你的应用
# 如果留空，则应用将是公开访问的
NEXT_PUBLIC_AETHER_PASSWORD=

# 可选：指定要使用的 Gemini 模型
# 如果留空，将默认使用 "gemini-2.5-flash"
GEMINI_MODEL=gemini-1.5-pro-latest
```

### 4. 运行本地开发服务器

```bash
npm run dev
```

现在，在浏览器中打开 `http://localhost:3000` 即可开始与你的 Gemini 聊天机器人互动。

## 部署到 Vercel

你可以轻松地将此应用一键部署到 Vercel。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-repo%2Faether)

**部署步骤**:

1.  点击上面的 "Deploy with Vercel" 按钮。
2.  按照 Vercel 的指引创建一个新的项目。
3.  在 "Configure Project" 步骤中，展开 "Environment Variables" 部分。
4.  添加 `GEMINI_API_KEY`，并将其值设置为你的 Gemini API 密钥。
5.  （可选）添加 `NEXT_PUBLIC_AETHER_PASSWORD` 来设置访问密码。
6.  （可选）添加 `GEMINI_MODEL` 来指定一个不同的模型。
7.  点击 "Deploy" 并等待部署完成。

部署成功后，你就可以通过 Vercel 提供的域名访问你的在线聊天机器人了。

## 📝 API 实现细节

### 流式响应 (`/api/chat`)

- **端点**: `POST /api/chat`
- **运行时**: Edge Function (`edge`)
- **功能**:
  1.  接收包含 `messages` (对话历史) 和可选 `image` (Base64 编码) 的请求体。
  2.  使用 `@google/generative-ai` SDK 与 Gemini API 通信。
  3.  使用的模型由 `GEMINI_MODEL` 环境变量决定，默认为 `gemini-2.5-flash`。
  4.  启用内置的 `googleSearch` 工具以支持联网功能。
  5.  调用 `generateContentStream` 方法获取流式响应。
  6.  将来自 Gemini 的数据块实时封装为 Server-Sent Events (SSE) 并发送给前端。

## ❓ 常见问题 (FAQ)

- **Q: 为什么我的应用在 Vercel 上出现错误？**
  - **A**: 最常见的原因是忘记在 Vercel 项目设置中配置 `GEMINI_API_KEY` 环境变量。请确保该变量已正确添加。

- **Q: 如何设置或更改访问密码？**
  - **A**: 在你的 `.env.local` 文件或 Vercel 的环境变量设置中，添加或修改 `NEXT_PUBLIC_AETHER_PASSWORD` 的值。如果想移除密码，将该变量的值设置为空即可。

- **Q: 如何更换模型？**
  - **A**: 在你的 `.env.local` 文件或 Vercel 的环境变量设置中，添加或修改 `GEMINI_MODEL` 的值。例如，可以设置为 `gemini-1.5-pro-latest`。
