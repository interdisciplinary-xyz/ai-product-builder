/** Non-markdown sources (JSON, Python) are shown verbatim, as one code block. */
export function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="prose prose--wide">
      <pre>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
