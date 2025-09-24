// src/components/auth/password-gate.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '../icons';

interface PasswordGateProps {
  onAuthSuccess: () => void;
}

// 从环境变量中获取密码
const correctPassword = process.env.NEXT_PUBLIC_AETHER_PASSWORD;

export function PasswordGate({ onAuthSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = () => {
    setIsLoading(true);

    if (password === correctPassword) {
      toast({
        title: '认证成功',
        description: '欢迎使用 Aether。',
      });
      onAuthSuccess();
    } else {
      toast({
        title: '认证失败',
        description: '密码错误，请重试。',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Aether</CardTitle>
        <CardDescription>需要密码才能访问此应用</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="password"
          placeholder="请输入访问密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <Button onClick={handleLogin} disabled={isLoading} className="w-full">
          {isLoading ? <Icons.spinner className="animate-spin" /> : '进入'}
        </Button>
      </CardContent>
    </Card>
  );
}
