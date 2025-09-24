// 文件路径: src/components/chat/chat-input.tsx
// 用途: 提供用户输入文本、上传图片和发送消息的界面。

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "../icons";
import { useRef, useState, ChangeEvent } from "react";
import Image from 'next/image';
import { Card, CardContent } from "../ui/card";
import { X } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string, image?: { data: string, type: string }) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<{ preview: string; data: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if ((!message.trim() && !image) || isLoading) return;
    onSendMessage(message, image ? { data: image.data, type: image.type } : undefined);
    setMessage("");
    setImage(null);
    textAreaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage({
          preview: URL.createObjectURL(file),
          data: base64String.split(",")[1], // 移除 data URI 前缀
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
    // 重置 input 的 value，以便可以重新上传同一张图片
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative p-4 border-t bg-card">
      {image && (
        <div className="mb-2 relative w-32">
            <Image
              src={image.preview}
              alt="图片预览"
              width={128}
              height={128}
              className="rounded-md object-cover w-32 h-32"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/75 text-white"
              onClick={() => setImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            ref={textAreaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息或上传图片..."
            className="pr-20 min-h-[40px] max-h-48 resize-none"
            rows={1}
            disabled={isLoading}
          />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          aria-label="上传图片"
        >
          <Icons.image className="h-5 w-5" />
        </Button>
        <Button onClick={handleSendMessage} disabled={isLoading || (!message.trim() && !image)}>
          {isLoading ? (
            <Icons.spinner className="h-5 w-5 animate-spin" />
          ) : (
            <Icons.send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
