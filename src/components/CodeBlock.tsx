import { useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import type { Language } from '../types';

// Prevent Prism's automatic highlightAll on page load; we highlight per block.
(Prism as unknown as { manual: boolean }).manual = true;

const LANG_MAP: Record<Language, string> = {
  js: 'javascript',
  ts: 'typescript',
  tsx: 'tsx',
  sql: 'sql',
  bash: 'bash',
  css: 'css', // bundled in Prism core
  html: 'markup', // bundled in Prism core
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function CodeBlock({ code, language }: { code: string; language: Language }) {
  const html = useMemo(() => {
    const lang = LANG_MAP[language];
    const grammar = Prism.languages[lang];
    return grammar ? Prism.highlight(code, grammar, lang) : escapeHtml(code);
  }, [code, language]);
  return (
    <pre className="code-block">
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}
