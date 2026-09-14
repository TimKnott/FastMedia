import { useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Code2, FileText } from 'lucide-react';

interface EmailBodyProps {
  html?: string | null;
  text?: string | null;
}

/**
 * Renders the real content of a received email: the formatted HTML version when
 * present (sanitised), with the plain-text version as a fallback / toggle.
 */
const EmailBody = ({ html, text }: EmailBodyProps) => {
  const [showText, setShowText] = useState(false);

  const clean = useMemo(() => {
    if (!html) return '';
    return DOMPurify.sanitize(html, {
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'link', 'meta'],
      FORBID_ATTR: ['srcset', 'onerror', 'onload'],
      ALLOW_DATA_ATTR: false,
    });
  }, [html]);

  const plain = (text ?? '').trim();
  const hasHtml = clean.trim().length > 0;

  if (!hasHtml && !plain) {
    return (
      <p className="text-sm text-muted-foreground italic">
        This message arrived without readable content (it may have been image or attachment only).
      </p>
    );
  }

  if (!hasHtml) {
    return <pre className="whitespace-pre-wrap break-words bg-muted/40 p-3 rounded text-xs">{plain}</pre>;
  }

  return (
    <div className="space-y-2">
      {plain && (
        <Button size="sm" variant="ghost" onClick={() => setShowText(v => !v)}>
          {showText ? <Code2 className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
          {showText ? 'Show formatted message' : 'Show plain text'}
        </Button>
      )}
      {showText ? (
        <pre className="whitespace-pre-wrap break-words bg-muted/40 p-3 rounded text-xs">{plain}</pre>
      ) : (
        <div
          className="email-body max-w-full overflow-x-auto rounded border border-border bg-background p-3 text-sm [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_table]:max-w-full"
          // Sanitised above with DOMPurify.
          dangerouslySetInnerHTML={{ __html: clean }}
        />
      )}
    </div>
  );
};

export default EmailBody;
