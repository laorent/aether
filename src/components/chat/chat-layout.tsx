// 文件路径: src/components/chat/chat-layout.tsx
// 用途: 聊天界面的整体布局，包含侧边栏和主聊天面板。

"use client";

import { useState } from "react";
import { ChatPanel } from "./chat-panel";
import { Message } from "@/lib/types";

export function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="w-full h-full p-4">
      <ChatPanel
        messages={messages}
        setMessages={setMessages}
        onClearChat={handleClearChat}
      />
    </div>
  );
}
