import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Bold, Italic, List, Link2, Image as ImageIcon, MousePointerClick, Monitor, Smartphone, Heading2, Eraser, Underline, ListOrdered, AlignLeft, AlignCenter, Minus, Undo2, Redo2, Palette, Pilcrow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmailVisualEditorProps {
  /** Current email HTML. */
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

export interface EmailVisualEditorHandle {
  focus: () => void;
}

/** Turns a plain-text AI draft into simple paragraphs the editor can show. */
export function plainTextToEmailHtml(text: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return String(text ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')}</p>`)
    .join('');
}

const exec = (cmd: string, arg?: string) => document.execCommand(cmd, false, arg);

/**
 * Lightweight visual email editor: bold, italic, heading, list, links, images and a CTA button,
 * plus desktop/mobile preview. Output is sanitised again on the server before sending.
 */
export const EmailVisualEditor = forwardRef<EmailVisualEditorHandle, EmailVisualEditorProps>(
  ({ value, onChange, className }, ref) => {
    const area = useRef<HTMLDivElement>(null);
    const [preview, setPreview] = useState<'edit' | 'desktop' | 'mobile'>('edit');

    useImperativeHandle(ref, () => ({ focus: () => area.current?.focus() }));

    useEffect(() => {
      if (preview === 'edit' && area.current && area.current.innerHTML !== value) {
        area.current.innerHTML = value;
      }
    }, [value, preview]);

    const emit = () => area.current && onChange(area.current.innerHTML);
    const run = (cmd: string, arg?: string) => {
      area.current?.focus();
      exec(cmd, arg);
      emit();
    };
    const addLink = () => {
      const url = window.prompt('Link address (https://…)');
      if (url && /^(https?:|mailto:|tel:)/i.test(url)) run('createLink', url);
    };
    const addImage = () => {
      const url = window.prompt('Image address (https://…). Keep to one small image for best inbox placement.');
      if (url && /^https:/i.test(url)) {
        run('insertHTML', `<p><img src="${url.replace(/"/g, '')}" alt="" width="520" style="max-width:100%;height:auto;border-radius:6px" /></p>`);
      }
    };
    const addButton = () => {
      const url = window.prompt('Button link (https://…)', 'https://www.fastmedia.pro/business');
      if (!url || !/^https?:/i.test(url)) return;
      const label = window.prompt('Button text', 'See examples') || 'See examples';
      const safe = label.replace(/[<>"]/g, '');
      run(
        'insertHTML',
        `<p><a href="${url.replace(/"/g, '')}" style="display:inline-block;background:#e8553f;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">${safe}</a></p>`,
      );
    };

    const tool = (label: string, icon: React.ReactNode, onClick: () => void) => (
      <Button type="button" size="sm" variant="ghost" aria-label={label} title={label} onMouseDown={(e) => e.preventDefault()} onClick={onClick}>
        {icon}
      </Button>
    );

    return (
      <div className={cn('rounded-md border border-input bg-background', className)}>
        <div className="flex flex-wrap items-center gap-1 border-b border-border p-1">
          {preview === 'edit' && (
            <>
              {tool('Undo', <Undo2 className="h-4 w-4" />, () => run('undo'))}
              {tool('Redo', <Redo2 className="h-4 w-4" />, () => run('redo'))}
              {tool('Bold', <Bold className="h-4 w-4" />, () => run('bold'))}
              {tool('Italic', <Italic className="h-4 w-4" />, () => run('italic'))}
              {tool('Underline', <Underline className="h-4 w-4" />, () => run('underline'))}
              {tool('Heading', <Heading2 className="h-4 w-4" />, () => run('formatBlock', 'h3'))}
              {tool('Paragraph', <Pilcrow className="h-4 w-4" />, () => run('formatBlock', 'p'))}
              {tool('Bullet list', <List className="h-4 w-4" />, () => run('insertUnorderedList'))}
              {tool('Numbered list', <ListOrdered className="h-4 w-4" />, () => run('insertOrderedList'))}
              {tool('Align left', <AlignLeft className="h-4 w-4" />, () => run('justifyLeft'))}
              {tool('Align centre', <AlignCenter className="h-4 w-4" />, () => run('justifyCenter'))}
              {tool('Brand colour', <Palette className="h-4 w-4" />, () => run('foreColor', '#e8553f'))}
              {tool('Link', <Link2 className="h-4 w-4" />, addLink)}
              {tool('Image', <ImageIcon className="h-4 w-4" />, addImage)}
              {tool('Button', <MousePointerClick className="h-4 w-4" />, addButton)}
              {tool('Divider', <Minus className="h-4 w-4" />, () => run('insertHTML', '<hr style="border:none;border-top:1px solid #dddddd;margin:16px 0" />'))}
              {tool('Clear formatting', <Eraser className="h-4 w-4" />, () => run('removeFormat'))}
            </>
          )}
          <div className="ml-auto flex gap-1">
            <Button type="button" size="sm" variant={preview === 'edit' ? 'secondary' : 'ghost'} onClick={() => setPreview('edit')}>
              Edit
            </Button>
            <Button type="button" size="sm" variant={preview === 'desktop' ? 'secondary' : 'ghost'} aria-label="Desktop preview" onClick={() => setPreview('desktop')}>
              <Monitor className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant={preview === 'mobile' ? 'secondary' : 'ghost'} aria-label="Phone preview" onClick={() => setPreview('mobile')}>
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {preview === 'edit' ? (
          <div
            ref={area}
            role="textbox"
            aria-multiline="true"
            aria-label="Email body"
            contentEditable
            suppressContentEditableWarning
            onInput={emit}
            onBlur={emit}
            className="min-h-[200px] p-3 text-sm leading-relaxed focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_a]:text-accent [&_a]:underline [&_h3]:text-base [&_h3]:font-semibold [&_img]:max-w-full [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
          />
        ) : (
          <div className="bg-muted p-3">
            <div
              className={cn(
                'mx-auto rounded bg-card p-4 text-sm leading-relaxed text-card-foreground shadow-sm [&_a]:underline [&_h3]:font-semibold [&_img]:max-w-full [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5',
                preview === 'mobile' ? 'max-w-[360px]' : 'max-w-[600px]',
              )}
              dangerouslySetInnerHTML={{ __html: value.replace(/<script[\s\S]*?<\/script>/gi, '') }}
            />
          </div>
        )}
      </div>
    );
  },
);
EmailVisualEditor.displayName = 'EmailVisualEditor';
