// 文件路径: src/app/api/chat/route.ts
// 用途: 处理聊天请求的核心 API，支持流式响应、图像和工具调用。

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Content,
  Part,
} from "@google/generative-ai";

export const runtime = "edge";

// 定义请求体结构
interface RequestBody {
  messages: Content[];
  userMessage: {
    content: string;
    image?: {
      data: string; // Base64 编码的图片数据
      type: string; // MIME 类型
    };
  };
}

// 定义引用格式
interface Citation {
  url: string;
  title: string;
  index: number;
}


/**
 * 将 GroundingAttribution 转换为我们定义的 Citation 格式
 * @param citations - 来自 Gemini API 的引用数据
 * @returns 格式化后的 Citation 数组
 */
const formatCitations = (citations: any[] | undefined) => {
  if (!citations) return [];
  // 基于 groundingAttribution 的格式
  if (citations[0]?.groundingAttribution) {
    return citations.map((att, index) => ({
      url: att.groundingAttribution.web.uri,
      title: att.groundingAttribution.web.title,
      index: index + 1,
    }));
  }
  // 基于新格式
  return citations.map((att, index) => ({
    url: att.url,
    title: att.title,
    index: att.citationNumber,
  }));
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API 密钥未配置" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages, userMessage }: RequestBody = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ googleSearch: {} }],
    });

    const generationConfig = {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192,
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const history = messages.map(msg => ({
        role: msg.role,
        parts: msg.parts.filter(part => part.text !== undefined || part.inlineData !== undefined),
    })).filter(msg => msg.parts.length > 0);

    const currentUserParts: Part[] = [{ text: userMessage.content }];
    if (userMessage.image) {
      currentUserParts.push({
        inlineData: {
          mimeType: userMessage.image.type,
          data: userMessage.image.data,
        },
      });
    }

    const contents = [...history, { role: 'user', parts: currentUserParts }];
    
    if (contents.length === 0 || contents.every(c => c.parts.length === 0)) {
        return new Response(
            JSON.stringify({ error: "请求必须至少包含一个有效部分。" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }


    const result = await model.generateContentStream({
      contents,
      generationConfig,
      safetySettings,
    });
    
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        for await (const chunk of result.stream) {
          try {
            const text = chunk.text();
            
            let citations: Citation[] = [];
            if(chunk.citations) {
                citations = formatCitations(chunk.citations)
            }


            const payload: any = {
              ...(text && { text }),
            };
            
            // 只有当有引用并且有文本时才发送引用
            if(citations.length > 0 && text) {
                payload.citations = citations;
            }
            
            if (Object.keys(payload).length > 0) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
            }
          } catch (e) {
            console.error("Error processing chunk:", e);
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("Gemini API error:", error);
    const errorMessage = error.message || "与 Gemini API 通信时发生未知错误";
    const detailedError = error.cause?.message || errorMessage;
    return new Response(
      JSON.stringify({ error: detailedError }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
