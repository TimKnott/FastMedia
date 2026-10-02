import { Copy, Link2, Mail, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type Lang = 'cs' | 'en' | 'de';

interface BlogShareBarProps {
  url: string;
  title: string;
  excerpt: string;
  language: Lang;
}

const t = {
  heading: { cs: 'Sdílet článek', en: 'Share this article', de: 'Artikel teilen' },
  whatsappCopy: { cs: 'Kopírovat text pro WhatsApp', en: 'Copy WhatsApp text', de: 'WhatsApp-Text kopieren' },
  whatsappCopied: { cs: 'Zpráva zkopírována — vložte ji do WhatsAppu.', en: 'Message copied — ready to paste into WhatsApp.', de: 'Nachricht kopiert — in WhatsApp einfügen.' },
  copyLink: { cs: 'Kopírovat odkaz', en: 'Copy link', de: 'Link kopieren' },
  linkCopied: { cs: 'Odkaz zkopírován.', en: 'Link copied.', de: 'Link kopiert.' },
  more: { cs: 'Další aplikace', en: 'More apps', de: 'Weitere Apps' },
  failed: { cs: 'Kopírování se nezdařilo.', en: 'Could not copy.', de: 'Kopieren fehlgeschlagen.' },
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

const BlogShareBar = ({ url, title, excerpt, language }: BlogShareBarProps) => {
  const u = encodeURIComponent(url);
  const ti = encodeURIComponent(title);
  const msg = encodeURIComponent(`${title}\n${url}`);

  const networks = [
    { name: 'WhatsApp', href: `https://api.whatsapp.com/send?text=${msg}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${ti}&url=${u}` },
    { name: 'Messenger', href: `https://www.facebook.com/dialog/send?link=${u}&app_id=291494419107518&redirect_uri=${u}` },
    { name: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${ti}` },
    { name: 'Reddit', href: `https://www.reddit.com/submit?url=${u}&title=${ti}` },
    { name: 'Pinterest', href: `https://pinterest.com/pin/create/button/?url=${u}&description=${ti}` },
    { name: 'Threads', href: `https://www.threads.net/intent/post?text=${msg}` },
    { name: 'Bluesky', href: `https://bsky.app/intent/compose?text=${msg}` },
    { name: 'Tumblr', href: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${u}&title=${ti}` },
    { name: 'Viber', href: `viber://forward?text=${msg}` },
    { name: 'VK', href: `https://vk.com/share.php?url=${u}&title=${ti}` },
  ];

  const copyWhatsApp = async () => {
    const text = `*${title}*\n\n${excerpt}\n\n👉 ${url}`;
    (await copyText(text)) ? toast.success(t.whatsappCopied[language]) : toast.error(t.failed[language]);
  };

  const copyLink = async () => {
    (await copyText(url)) ? toast.success(t.linkCopied[language]) : toast.error(t.failed[language]);
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text: excerpt, url });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <section aria-label={t.heading[language]} className="space-y-4">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <Share2 className="h-4 w-4 text-accent" /> {t.heading[language]}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {networks.map((n) => (
          <li key={n.name}>
            <a
              href={n.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t.heading[language]}: ${n.name}`}
              className="inline-flex h-9 items-center rounded-full border border-border bg-muted/40 px-4 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {n.name}
            </a>
          </li>
        ))}
        <li>
          <a
            href={`mailto:?subject=${ti}&body=${msg}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-muted/40 px-4 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Mail className="h-3.5 w-3.5" /> Email
          </a>
        </li>
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" className="gap-2" onClick={copyWhatsApp}>
          <MessageCircle className="h-4 w-4" /> {t.whatsappCopy[language]} <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" className="gap-2" onClick={copyLink}>
          <Link2 className="h-4 w-4" /> {t.copyLink[language]}
        </Button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button size="sm" variant="outline" className="gap-2" onClick={nativeShare}>
            <Share2 className="h-4 w-4" /> {t.more[language]}
          </Button>
        )}
      </div>
    </section>
  );
};

export default BlogShareBar;
