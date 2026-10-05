import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Pencil } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { caseField, resolvePdfUrl, statLabel, type CaseStudy } from '@/hooks/useCaseStudies';
import { buildCaseStudyPdf, caseStudyPdfFilename } from '@/lib/caseStudyPdf';
import CaseStudyGallery from '@/components/CaseStudyGallery';

interface Props {
  item: CaseStudy;
  /** Compact layout for the homepage summary. */
  compact?: boolean;
  canEdit?: boolean;
  onEdit?: (item: CaseStudy) => void;
}

const CaseStudyCard = ({ item, compact = false, canEdit = false, onEdit }: Props) => {
  const { language } = useLanguage();
  const isEnglish = language !== 'cs';
  const [busy, setBusy] = useState(false);

  const openPdf = async (download: boolean) => {
    setBusy(true);
    try {
      const url = await resolvePdfUrl(item);
      if (url) {
        if (download) {
          const link = document.createElement('a');
          link.href = url;
          link.download = caseStudyPdfFilename(item);
          link.rel = 'noopener';
          link.target = '_blank';
          link.click();
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
        return;
      }
      const doc = await buildCaseStudyPdf(item, language);
      if (download) doc.save(caseStudyPdfFilename(item));
      else window.open(doc.output('bloburl') as unknown as string, '_blank', 'noopener,noreferrer');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {(item.thumbnail_url || item.gallery_images[0]?.url) && (
        <div className={compact ? 'aspect-[16/10] overflow-hidden' : 'aspect-[16/9] overflow-hidden'}>
          <img
            src={item.thumbnail_url || item.gallery_images[0].url}
            alt={item.thumbnail_url ? item.brand : item.gallery_images[0].alt}
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {caseField(item, 'tag', language) && (
          <Badge variant="secondary" className="w-fit">{caseField(item, 'tag', language)}</Badge>
        )}
        <h3 className={compact ? 'text-lg font-bold' : 'text-xl font-bold'}>{item.brand}</h3>
        <p className="text-sm text-muted-foreground">{caseField(item, 'summary', language)}</p>

        {!compact && caseField(item, 'body', language) && (
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{caseField(item, 'body', language)}</p>
        )}

        {!compact && item.gallery_images.length > 1 && (
          <CaseStudyGallery images={item.gallery_images} brand={item.brand} />
        )}


        {item.stats.length > 0 && (
          <div className="grid grid-cols-3 gap-3 pt-1">
            {item.stats.map((stat, i) => (
              <div key={`${stat.value}-${i}`}>
                <div className="text-base md:text-lg font-bold text-primary">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground leading-snug">{statLabel(stat, language)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-auto pt-3">
          <Button size="sm" variant="default" disabled={busy} onClick={() => openPdf(false)}>
            <FileText className="w-4 h-4" />
            {isEnglish ? 'Open PDF' : 'Otevřít PDF'}
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => openPdf(true)}>
            <Download className="w-4 h-4" />
            {isEnglish ? 'Download' : 'Stáhnout'}
          </Button>
          {canEdit && (
            <Button size="sm" variant="ghost" onClick={() => onEdit?.(item)}>
              <Pencil className="w-4 h-4" />
              {isEnglish ? 'Edit' : 'Upravit'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CaseStudyCard;
