"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

export function BlogMarkdown({ content }: { content: string }) {
  return (
    <div className="prose-custom markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 mt-10 text-3xl font-bold tracking-tight first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-4 mt-12 text-2xl font-bold tracking-tight first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 mt-8 text-xl font-semibold">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="my-4 text-base leading-[1.8] text-[var(--color-text-secondary)]">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 list-disc space-y-2 pl-6 text-[var(--color-text-secondary)]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-2 pl-6 text-[var(--color-text-secondary)]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-base leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-2 border-accent pl-6 italic text-[var(--color-text-secondary)]">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent underline underline-offset-4"
            >
              {children}
            </a>
          ),
          pre: ({ children }) => (
            <pre className="my-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[#0b1220] p-4 text-sm leading-6 text-slate-100">
              {children}
            </pre>
          ),
          code: ({ inline, className, children, ...props }: any) =>
            inline ? (
              <code
                className="rounded-md bg-[var(--color-bg-alt)] px-1.5 py-0.5 font-mono text-[0.92em] text-[var(--color-text)]"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            ),
          hr: () => <hr className="my-8 border-[var(--color-border)]" />,
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="min-w-full border-collapse overflow-hidden rounded-xl border border-[var(--color-border)]">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-4 py-3 text-left text-sm font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
