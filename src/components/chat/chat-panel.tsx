// 文件路径: src/components/chat/chat-panel.tsx
// 用途: 管理聊天界面的主面板，包括消息状态和与 API 的交互。

"use client";

import { useState } from "react";
import { Message, Citation } from "@/lib/types";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";
import { Icons } from "../icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// 这是一个 polyfill，因为 some Vercel Edge Runtimes 可能没有 crypto.randomUUID
const getUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return uuidv4();
};

interface ChatPanelProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onClearChat: () => void;
}

export function ChatPanel({ messages, setMessages, onClearChat }: ChatPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isClearAlertOpen, setClearAlertOpen] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (
    content: string,
    image?: { data: string; type: string }
  ) => {
    setIsLoading(true);

    const newUserMessage: Message = {
      id: getUUID(),
      role: "user",
      content: content,
      parts: [{ text: content }],
      ...(image && {
        image: {
          url: `data:${image.type};base64,${image.data}`,
          mimeType: image.type,
        },
      }),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.slice(0, -1), // 发送历史消息
          userMessage: { content, image }, // 单独发送当前消息内容
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "服务器发生错误");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法读取响应流");
      }

      const decoder = new TextDecoder();
      let newModelMessage: Message = {
        id: getUUID(),
        role: "model",
        content: "",
        isStreaming: true,
        citations: [],
        parts: [],
      };
      setMessages((prev) => [...prev, newModelMessage]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });

        // SSE 格式是 `data: {...}\n\n`
        const lines = chunk
          .split("\n\n")
          .filter((line) => line.startsWith("data: "));
        for (const line of lines) {
          const jsonString = line.substring(6);
          try {
            const data = JSON.parse(jsonString);

            setMessages((prevMessages) =>
              prevMessages.map((msg) => {
                if (msg.id === newModelMessage.id) {
                  const updatedMsg = { ...msg };
                  if (data.text) {
                    updatedMsg.content += data.text;
                  }
                  if (data.citations) {
                    const existingUrls = new Set(
                      updatedMsg.citations?.map((c) => c.url)
                    );
                    const newCitations = data.citations.filter(
                      (c: Citation) => !existingUrls.has(c.url)
                    );
                    updatedMsg.citations = [
                      ...(updatedMsg.citations || []),
                      ...newCitations,
                    ];
                  }
                  return updatedMsg;
                }
                return msg;
              })
            );
          } catch (e) {
            // 忽略JSON解析错误，可能是流式传输中的部分数据
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === newModelMessage.id) {
            const finalParts = [{ text: msg.content }];
            if(msg.citations && msg.citations.length > 0) {
              // Note: This is a simplified representation.
              // For full accuracy, tool outputs should be captured separately.
            }
            return {
              ...msg,
              isStreaming: false,
              parts: finalParts,
            };
          }
          return msg;
        })
      );
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
      // 移除失败的用户消息和模型的空消息
      setMessages((prev) => prev.filter((msg) => msg.id !== newUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col w-full h-full max-w-4xl mx-auto shadow-2xl rounded-xl">
       <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <CardTitle className="text-xl font-bold">
          Aether
        </CardTitle>
        <AlertDialog open={isClearAlertOpen} onOpenChange={setClearAlertOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icons.moreVertical className="h-5 w-5" />
                <span className="sr-only">更多选项</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialogTrigger asChild>
                <DropdownMenuItem disabled={messages.length === 0}>
                  <Icons.trash className="mr-2" />
                  清除聊天
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确定要清除聊天记录吗？</AlertDialogTitle>
              <AlertDialogDescription>
                此操作无法撤销。所有聊天记录将被永久删除。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onClearChat();
                  setClearAlertOpen(false);
                }}
              >
                确认清除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </Card>
  );
}
