// 文件路径: src/components/chat/chat-messages.tsx
// 用途: 显示聊天消息列表，并自动滚动到最新消息。

import { Message } from "@/lib/types";
import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { ScrollArea } from "../ui/scroll-area";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 当新消息或加载状态变化时，滚动到底部
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1" viewportRef={viewportRef}>
      <div className="p-4 space-y-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && messages[messages.length-1]?.role === 'user' && (
          <ChatMessage 
            message={{ 
              id: 'loading', 
              role: 'model', 
              content: '', 
              isStreaming: true ,
              parts: [],
            }} 
          />
        )}
      </div>
    </ScrollArea>
  );
}
