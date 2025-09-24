
'use client';
import { ChatLayout } from "@/components/chat/chat-layout";
import { PasswordGate } from "@/components/auth/password-gate";
import { useState, useEffect } from "react";

// 从服务器端环境变量中获取密码
const aetherPassword = process.env.NEXT_PUBLIC_AETHER_PASSWORD;

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(!aetherPassword);

  // 如果设置了密码，检查 sessionStorage 中是否有认证标志
  useEffect(() => {
    if (aetherPassword) {
      const sessionAuth = sessionStorage.getItem('aether-auth');
      if (sessionAuth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleAuthSuccess = () => {
    sessionStorage.setItem('aether-auth', 'true');
    setIsAuthenticated(true);
  };

  return (
    <main className="flex h-screen flex-col items-center justify-center">
      {isAuthenticated ? (
        <ChatLayout />
      ) : (
        <PasswordGate onAuthSuccess={handleAuthSuccess} />
      )}
    </main>
  );
}
