// 文件路径: src/components/markdown-renderer.tsx
// 用途: 一个简单的 Markdown 渲染器，用于显示模型输出，并支持代码块复制。

import React, { useState } from 'react';
import { Icons } from './icons';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const { toast } = useToast();
  const [copiedBlocks, setCopiedBlocks] = useState<Record<number, boolean>>({});

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedBlocks(prev => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setCopiedBlocks(prev => ({ ...prev, [index]: false }));
      }, 2000);
    }).catch(() => {
      toast({
        title: "复制失败",
        description: "无法将代码复制到剪贴板。",
        variant: "destructive",
      });
    });
  };

  const renderContent = () => {
    let codeBlockIndex = 0;
    
    // 将代码块替换为带有复制按钮的 <pre><code> 标签
    const contentWithCodeBlocks = content.replace(
      /```(?:[a-zA-Z]*)?\n([\s\S]*?)```/g,
      (match, code) => {
        const cleanedCode = code.trim();
        const currentIndex = codeBlockIndex++;
        
        const escapedCode = cleanedCode
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        return `
          <div class="relative group my-4">
            <button 
              class="copy-button absolute top-2 right-2 p-1.5 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" 
              data-code="${encodeURIComponent(cleanedCode)}"
              data-index="${currentIndex}"
            >
              <!-- Icon will be injected via dangerouslySetInnerHTML placeholder -->
              <span id="icon-placeholder-${currentIndex}"></span>
            </button>
            <pre><code class="font-code">${escapedCode}</code></pre>
          </div>
        `;
      }
    );

    // 按段落分割，同时保留 <pre> 块的完整性
    const blocks = contentWithCodeBlocks.split(/(<div class="relative group my-4">[\s\S]*?<\/div>)/);
    
    return blocks.map((block, index) => {
      if (block.startsWith('<div class="relative group')) {
        return (
          <div 
            key={index} 
            dangerouslySetInnerHTML={{ __html: block }} 
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const button = target.closest('.copy-button');
              if (button) {
                const codeToCopy = decodeURIComponent(button.getAttribute('data-code') || '');
                const idx = parseInt(button.getAttribute('data-index') || '0', 10);
                handleCopy(codeToCopy, idx);
              }
            }}
          />
        );
      }

      const lines = block.trim().split('\n');
      return (
        <div key={index} className="space-y-4">
          {lines.map((line, lineIndex) => {
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              return (
                <p key={lineIndex} className="ml-4 flex">
                  <span className="mr-2"> • </span>
                  <span dangerouslySetInnerHTML={{ __html: formatLine(line.substring(2)) }} />
                </p>
              );
            }
            return <p key={lineIndex} dangerouslySetInnerHTML={{ __html: formatLine(line) }} />;
          })}
        </div>
      );
    });
  };
  
  const formatLine = (line: string) => {
    return line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 加粗
      .replace(/`(.*?)`/g, '<code class="font-code bg-muted px-1 py-0.5 rounded">$1</code>'); // 内联代码
  };

  const PostRenderedContent = () => {
    const rendered = renderContent();
    
    // This is a bit of a hack to replace placeholders with React components
    // after dangerouslySetInnerHTML has done its job.
    React.useEffect(() => {
      document.querySelectorAll('.copy-button').forEach(button => {
        const index = parseInt(button.getAttribute('data-index') || '0', 10);
        const iconPlaceholder = button.querySelector(`#icon-placeholder-${index}`);
        if(iconPlaceholder) {
            // This part is tricky because we can't just inject a React component.
            // We'll manage it with innerHTML. It's not ideal but works for simple icons.
            const Icon = copiedBlocks[index] ? Icons.check : Icons.copy;
            
            // A simplified SVG representation to avoid full React component rendering
            if (copiedBlocks[index]) {
                 iconPlaceholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
            } else {
                 iconPlaceholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
            }
        }
      });
    }, [rendered, copiedBlocks]);

    return <>{rendered}</>;
  }

  // Final render logic adjusted
  const blocks = content.split(/(```[\s\S]*?```)/);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {blocks.map((block, index) => {
        if (block.startsWith('```')) {
          const match = block.match(/```(?:[a-zA-Z]*)?\n([\s\S]*?)```/);
          const code = match ? match[1].trim() : '';
          const isCopied = copiedBlocks[index] === true;
          return (
            <div key={index} className="relative group my-4 rounded-md bg-zinc-900 text-white">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                onClick={() => handleCopy(code, index)}
              >
                {isCopied ? <Icons.check className="h-4 w-4" /> : <Icons.copy className="h-4 w-4" />}
              </Button>
              <pre className="p-4 overflow-x-auto"><code className="font-code">{code}</code></pre>
            </div>
          );
        }

        // Process non-code blocks
        const lines = block.trim().split('\n');
        return (
          <div key={index} className="space-y-4">
            {lines.map((line, lineIndex) => {
               if (line.trim() === '') return null; // Skip empty lines between blocks
               if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                return (
                  <p key={lineIndex} className="ml-4 flex leading-relaxed">
                    <span className="mr-2"> • </span>
                    <span dangerouslySetInnerHTML={{ __html: formatLine(line.substring(2)) }} />
                  </p>
                );
              }
              return <p key={lineIndex} dangerouslySetInnerHTML={{ __html: formatLine(line) }} className="leading-relaxed" />;
            })}
          </div>
        );
      })}
    </div>
  );
};

export default MarkdownRenderer;