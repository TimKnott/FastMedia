import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CaseStudyImage } from '@/hooks/useCaseStudies';

interface Props {
  images: CaseStudyImage[];
  brand: string;
  /** Show only the first few thumbnails (homepage). */
  max?: number;
}

/** Thumbnail strip of real screenshots that opens a full-size viewer. */
const CaseStudyGallery = ({ images, brand, max }: Props) => {
  const [index, setIndex] = useState<number | null>(null);
  if (!images.length) return null;
  const shown = max ? images.slice(0, max) : images;
  const current = index !== null ? images[index] : null;
  const step = (d: number) =>
    setIndex((i) => (i === null ? i : (i + d + images.length) % images.length));

  return (
    <>
      <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2" aria-label={`${brand} screenshots`}>
        {shown.map((img, i) => (
          <li key={img.url}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="block w-full aspect-[4/3] overflow-hidden rounded-md border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`View screenshot: ${img.alt}`}
            >
              <img src={img.url} alt={img.alt} loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={current !== null} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogContent className="max-w-5xl p-3 sm:p-4">
          {current && (
            <>
              <DialogTitle className="text-base pr-8">
                {brand} — {index! + 1} / {images.length}
              </DialogTitle>
              <DialogDescription>{current.caption || current.alt}</DialogDescription>
              <img src={current.url} alt={current.alt} className="w-full max-h-[75vh] object-contain rounded-md bg-muted" />
              {images.length > 1 && (
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => step(-1)}>
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => step(1)}>
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CaseStudyGallery;
