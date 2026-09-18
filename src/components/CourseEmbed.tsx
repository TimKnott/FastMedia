import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface CourseEmbedProps {
  /** Direct share link to the course (e.g. a Mini Course Generator link). */
  url?: string | null;
  /** Full embed snippet pasted from the course provider. */
  html?: string | null;
  title: string;
}

/**
 * Renders the course itself. Prefers a pasted embed snippet (sanitised, iframes
 * allowed) and falls back to building an iframe from a plain share link.
 */
const CourseEmbed = ({ url, html, title }: CourseEmbedProps) => {
  const clean = useMemo(() => {
    if (!html?.trim()) return '';
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['iframe', 'div', 'p', 'a', 'span', 'script'],
      ALLOWED_ATTR: [
        'src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen',
        'loading', 'referrerpolicy', 'title', 'style', 'class', 'href', 'target', 'rel',
      ],
      FORBID_TAGS: ['script'],
      ALLOW_DATA_ATTR: false,
    });
  }, [html]);

  if (clean.trim()) {
    return (
      <div
        className="course-embed w-full overflow-hidden rounded-xl border border-border bg-card [&_iframe]:w-full [&_iframe]:min-h-[640px] [&_iframe]:border-0"
        // Sanitised above with DOMPurify.
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  if (url?.trim()) {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
        <iframe
          src={url.trim()}
          title={title}
          loading="lazy"
          className="w-full min-h-[640px] border-0"
          allow="fullscreen; clipboard-write"
        />
      </div>
    );
  }

  return null;
};

export default CourseEmbed;
