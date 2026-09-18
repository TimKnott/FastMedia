import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface CourseRichTextProps {
  html?: string | null;
  className?: string;
}

/**
 * Renders admin-authored course copy. Links (internal and external) are kept and
 * styled; scripts and embedded frames are stripped — course embeds have their own
 * dedicated field and renderer.
 */
const CourseRichText = ({ html, className }: CourseRichTextProps) => {
  const clean = useMemo(() => {
    if (!html) return '';
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
        'a', 'h2', 'h3', 'h4', 'blockquote', 'span', 'code', 'hr',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'title'],
      ALLOW_DATA_ATTR: false,
    });
    // External links open in a new tab safely; internal ones stay in the app.
    return sanitized.replace(/<a\s+([^>]*href="https?:\/\/[^"]*"[^>]*)>/g, (match, attrs: string) => {
      if (attrs.includes('target=')) return match;
      return `<a ${attrs} target="_blank" rel="noopener noreferrer">`;
    });
  }, [html]);

  if (!clean.trim()) return null;

  return (
    <div
      className={
        className ??
        'space-y-4 text-muted-foreground leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1'
      }
      // Sanitised above with DOMPurify.
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default CourseRichText;
