# GeminiFlow - 智能聊天机器人

GeminiFlow 是一个功能完整、可直接部署到 Vercel 的 Gemini 聊天机器人 Web 应用。它基于 Next.js App Router 构建，并利用 Gemini 的强大功能，支持多轮对话、流式响应、图像理解和联网搜索。

![GeminiFlow 截图](https://storage.googleapis.com/aall-demos/geminiflow/geminiflow-screenshot.png)

## ✨ 核心功能

- **🤖 多轮对话历史**: 客户端保存对话历史，为 Gemini 提供上下文，实现连贯的交流。
- **⚡️ 流式响应**: 后端通过 SSE (Server-Sent Events) 实现流式输出，前端逐步渲染 token，带来“正在生成”的实时体验。
- **🖼️ 图像理解**: 支持上传图片并进行分析。模型能够识别图像内容并回答相关问题。
- **🌐 联网搜索与引用**: 自动调用 Gemini 内置的联网工具，并在前端清晰地展示信息来源引用。
- **🔐 安全设计**: API 密钥通过环境变量管理，不硬编码在代码中，确保安全。
- **📂 历史管理**: 支持一键清除当前对话，或将对话历史下载为 JSON 文件。
- **💅 优雅的界面**: 基于 shadcn/ui 和 Tailwind CSS 构建，提供美观、响应式且易于使用的用户界面。

## 🛠️ 技术栈

- **前端**: Next.js (App Router), React, TypeScript
- **后端/API**: Next.js API Routes (Edge-runtime)
- **AI**: Google AI Gemini (`gemini-1.5-flash-latest`)
- **UI 组件**: shadcn/ui, Lucide React
- **样式**: Tailwind CSS
- **包管理**: npm

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-repo/geminiflow.git
cd geminiflow
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

首先，你需要从 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取你的 Gemini API 密钥。

然后，在项目根目录下创建一个名为 `.env.local` 的文件，并将你的密钥添加进去：

```
GEMINI_API_KEY=在此处粘贴你的API密钥
```

`.env.local.example` 文件可作为模板参考。

### 4. 运行本地开发服务器

```bash
npm run dev
```

现在，在浏览器中打开 `http://localhost:3000` 即可开始与你的 Gemini 聊天机器人互动。

## 部署到 Vercel

你可以轻松地将此应用一键部署到 Vercel。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-repo%2Fgeminiflow)

**部署步骤**:

1.  点击上面的 "Deploy with Vercel" 按钮。
2.  按照 Vercel 的指引创建一个新的项目。
3.  在 "Configure Project" 步骤中，展开 "Environment Variables" 部分。
4.  添加一个名为 `GEMINI_API_KEY` 的环境变量，并将其值设置为你的 Gemini API 密钥。
5.  点击 "Deploy" 并等待部署完成。

部署成功后，你就可以通过 Vercel 提供的域名访问你的在线聊天机器人了。

## 📝 API 实现细节

### 流式响应 (`/api/chat`)

- **端点**: `POST /api/chat`
- **运行时**: Edge Function (`edge`)
- **功能**:
  1.  接收包含 `messages` (对话历史) 和可选 `image` (Base64 编码) 的请求体。
  2.  使用 `@google/generative-ai` SDK 与 Gemini API 通信。
  3.  启用内置的 `googleSearch` 工具以支持联网功能。
  4.  调用 `generateContentStream` 方法获取流式响应。
  5.  将来自 Gemini 的数据块实时封装为 Server-Sent Events (SSE) 并发送给前端。每个事件都是一个 JSON 对象，可能包含文本片段 (`text`) 或引用信息 (`citations`)。

### 图片处理

当用户上传图片时，前端会：
1.  将图片读取为 Base64 格式的 Data URL。
2.  在发送消息时，将 Base64 字符串（去除 data URI 前缀）和图片的 MIME 类型一起发送到后端。
3.  后端将这些信息构造成 Gemini API 需要的 `inlineData` 部分，实现多模态输入。

### 引用渲染

- 当模型使用联网工具时，Gemini API 会在响应中包含 `groundingAttribution`。
- 后端 API 会解析这些引用数据，并将其作为 `citations` 字段通过 SSE 发送给前端。
- 前端 `ChatMessage` 组件会检查消息中是否存在引用，并将其渲染为可点击的来源卡片，清晰地展示来源标题和链接。

## 🔄 更换模型

默认使用的模型是 `gemini-1.5-flash-latest`。如果你想更换为其他 Gemini 模型（例如 `gemini-1.5-pro-latest`），只需修改后端 API 文件：

- **文件**: `src/app/api/chat/route.ts`
- **修改**: 找到 `const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", ... })` 这一行，并将 `"gemini-1.5-flash-latest"` 替换为你想要使用的模型名称。

## ❓ 常见问题 (FAQ)

- **Q: 为什么我的应用在 Vercel 上出现错误？**
  - **A**: 最常见的原因是忘记在 Vercel 项目设置中配置 `GEMINI_API_KEY` 环境变量。请确保该变量已正确添加。

- **Q: Gemini API 的速率限制是多少？**
  - **A**: Gemini Flash 模型有较为宽松的免费用量限制（例如，每分钟请求数）。如果你遇到 `429 Too Many Requests` 错误，说明你可能已超出限制。你可以等待一段时间后重试，或查阅 [Google AI 官方文档](https://ai.google.dev/pricing) 了解详细的定价和配额信息。

- **Q: 为什么图片上传后响应很慢？**
  - **A**: 将图片以 Base64 编码发送会增加请求体的大小，这可能导致上传和处理时间变长，尤其是在网络连接较慢的情况下。这是内联图片方法的一个权衡。

- **Q: 项目中的 `src/ai` 目录是做什么的？**
  - **A**: 这些文件是使用 Genkit 框架的示例流程，用于演示特定的 AI 功能（如网页搜索引用和图片分析）。本聊天应用的核心逻辑位于 `src/app/api/chat/route.ts` 中，它直接使用了 `@google/generative-ai` SDK 以实现更灵活的流式聊天体验。

## 关键参考链接

- [Google AI for Developers](https://ai.google.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs/frameworks/nextjs)
- [shadcn/ui Components](https://ui.shadcn.com/)
