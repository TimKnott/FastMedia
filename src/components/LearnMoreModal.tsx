import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface LearnMoreModalProps {
  title: string;
  explanation: string;
  benefits: string[];
  mediaUrl?: string;
  mediaAlt?: string;
  triggerSize?: 'sm' | 'md';
  className?: string;
}

const LearnMoreModal = ({
  title,
  explanation,
  benefits,
  mediaUrl,
  mediaAlt,
  triggerSize = 'sm',
  className = '',
}: LearnMoreModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Learn more about ${title}`}
        className={`inline-flex items-center justify-center rounded-full bg-accent/20 text-accent hover:bg-accent/30 transition-colors ${
          triggerSize === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
        } ${className}`}
      >
        <Info className={triggerSize === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[101] w-auto sm:w-full sm:max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <Info className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground">{title}</h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <p className="text-muted-foreground text-sm leading-relaxed">{explanation}</p>

                {mediaUrl && (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img src={mediaUrl} alt={mediaAlt || title} className="w-full h-auto" loading="lazy" />
                  </div>
                )}

                {benefits.length > 0 && (
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">Benefits</p>
                    <ul className="space-y-1.5">
                      {benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="text-accent mt-0.5">✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-5">
                <Button onClick={() => setOpen(false)} className="w-full" size="sm">
                  Got it
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default LearnMoreModal;
