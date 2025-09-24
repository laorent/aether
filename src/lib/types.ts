// 文件路径: src/lib/types.ts
// 用途: 定义应用中共享的 TypeScript 类型
import { Part } from "@google/generative-ai";
/**
 * 表示信息来源的引用
 */
export interface Citation {
  url: string;
  title: string;
  index: number;
}

/**
 * 表示一条聊天消息
 */
export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  image?: {
    url: string;
    mimeType: string;
  };
  citations?: Citation[];
  isStreaming?: boolean;
  parts: Part[];
}
