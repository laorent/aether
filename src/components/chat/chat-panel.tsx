// 文件路径: src/components/chat/chat-panel.tsx
// 用途: 管理聊天界面的主面板，包括消息状态和与 API 的交互。

"use client";

import { useState, useEffect } from "react";
import { Message, Citation } from "@/lib/types";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";

// 这是一个 polyfill，因为 some Vercel Edge Runtimes 可能没有 crypto.randomUUID
const getUUID = () => {
    if(typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return uuidv4();
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (content: string, image?: { data: string, type: string }) => {
    setIsLoading(true);

    const newUserMessage: Message = {
      id: getUUID(),
      role: "user",
      content: content,
      ...(image && { image: { url: `data:${image.type};base64,${image.data}`, mimeType: image.type } }),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages.slice(0, -1), // 发送历史消息
          userMessage: { content, image } // 单独发送当前消息内容
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '服务器发生错误');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let newModelMessage: Message = { id: getUUID(), role: "model", content: "", isStreaming: true, citations: [] };
      setMessages(prev => [...prev, newModelMessage]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        
        // SSE 格式是 `data: {...}\n\n`
        const lines = chunk.split('\n\n').filter(line => line.startsWith('data: '));
        for (const line of lines) {
          const jsonString = line.substring(6);
          try {
            const data = JSON.parse(jsonString);
            
            setMessages(prevMessages => prevMessages.map(msg => {
                if (msg.id === newModelMessage.id) {
                    const updatedMsg = { ...msg };
                    if (data.text) {
                        updatedMsg.content += data.text;
                    }
                    if (data.citations) {
                        const existingUrls = new Set(updatedMsg.citations?.map(c => c.url));
                        const newCitations = data.citations.filter((c: Citation) => !existingUrls.has(c.url));
                        updatedMsg.citations = [...(updatedMsg.citations || []), ...newCitations];
                    }
                    return updatedMsg;
                }
                return msg;
            }));

          } catch (e) {
            // 忽略JSON解析错误，可能是流式传输中的部分数据
          }
        }
      }
      
      setMessages(prev => prev.map(msg => msg.id === newModelMessage.id ? { ...msg, isStreaming: false } : msg));

    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
      // 移除失败的用户消息
      setMessages(prev => prev.filter(msg => msg.id !== newUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col w-full h-full max-w-4xl mx-auto shadow-2xl rounded-xl">
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </Card>
  );
}
