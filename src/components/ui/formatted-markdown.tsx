'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export function FormattedMarkdown({ content, className = '' }: FormattedMarkdownProps) {
  if (!content) return null;

  return (
    <div className={`prose-invert max-w-none space-y-2 text-xs text-slate-200 leading-relaxed font-sans ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          h1: ({ children }) => <h1 className="text-lg font-extrabold text-white mt-3 mb-1 flex items-center gap-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold text-white mt-2.5 mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold text-blue-300 mt-2 mb-1">{children}</h3>,
          h4: ({ children }) => <h4 className="text-xs font-bold text-indigo-300 mt-1.5 mb-1">{children}</h4>,
          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 pl-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 pl-1">{children}</ol>,
          li: ({ children }) => <li className="text-slate-200">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-blue-500 bg-slate-900/60 pl-3 pr-2 py-1.5 rounded-r my-2 italic text-slate-300">
              {children}
            </blockquote>
          ),
          code: ({ children, ...props }) => (
            <code className="bg-slate-950 text-blue-300 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-800" {...props}>
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono my-2 text-slate-200">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-800/90 text-slate-200 border-b border-slate-700">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-slate-800/60">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-slate-800/30 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="p-2 font-semibold text-slate-200">{children}</th>,
          td: ({ children }) => <td className="p-2 text-slate-300">{children}</td>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline font-semibold">
              {children}
            </a>
          ),
          hr: () => <hr className="border-slate-800 my-3" />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
