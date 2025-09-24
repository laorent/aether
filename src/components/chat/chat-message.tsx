// 文件路径: src/components/chat/chat-message.tsx
// 用途: 渲染单条聊天消息，包括用户和模型的消息，并处理引用和加载状态。

import { Message, Citation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import MarkdownRenderer from "../markdown-renderer";
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-4", isUser ? "justify-end" : "")}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <Icons.bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[80%] space-y-2 rounded-lg px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card"
        )}
      >
        {message.image && (
          <div className="mb-2 overflow-hidden rounded-md">
            <Image
              src={message.image.url}
              alt="用户上传的图片"
              width={300}
              height={200}
              className="object-cover"
            />
          </div>
        )}
        <div className="text-sm">
          {message.isStreaming && !message.content ? (
            <div className="flex items-center gap-2">
              <Icons.spinner className="h-4 w-4 animate-spin" />
              <span>正在生成...</span>
            </div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
          {message.isStreaming && message.content && (
            <span className="animate-pulse">▍</span>
          )}
        </div>
        {message.citations && message.citations.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">引用来源:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {message.citations.map((citation) => (
                <a
                  key={citation.index}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardHeader className="p-3">
                      <CardTitle className="text-xs font-medium line-clamp-2">
                         [{citation.index}] {citation.title}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <Icons.user className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
