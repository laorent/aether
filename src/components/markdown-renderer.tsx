// 文件路径: src/components/markdown-renderer.tsx
// 用途: 一个简单的 Markdown 渲染器，用于显示模型输出。

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderContent = () => {
    // 将代码块替换为 <pre><code> 标签
    const contentWithCodeBlocks = content.replace(
      /```([\s\S]*?)```/g,
      (_, code) => {
        const escapedCode = code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<pre><code class="font-code">${escapedCode.trim()}</code></pre>`;
      }
    );

    // 按段落分割，同时保留 <pre> 块的完整性
    const blocks = contentWithCodeBlocks.split(/(<pre>[\s\S]*?<\/pre>)/);

    return blocks.map((block, index) => {
      if (block.startsWith('<pre>')) {
        return <div key={index} dangerouslySetInnerHTML={{ __html: block }} />;
      }

      const lines = block.trim().split('\n');
      return (
        <div key={index} className="space-y-4">
          {lines.map((line, lineIndex) => {
            // 处理列表项
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              return (
                <p key={lineIndex} className="ml-4 flex">
                  <span className="mr-2"> • </span>
                  <span dangerouslySetInnerHTML={{ __html: formatLine(line.substring(2)) }} />
                </p>
              );
            }
             // 处理加粗和内联代码
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

  return <div className="prose prose-sm dark:prose-invert max-w-none">{renderContent()}</div>;
};

export default MarkdownRenderer;
