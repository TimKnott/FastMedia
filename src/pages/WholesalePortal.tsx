import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { wholesalePortal as page } from '@/data/wholesalePortal';

const parts = [
  { sku: 'BRG-6202', name: 'Sealed bearing', pence: 480 },
  { sku: 'FLT-12', name: 'Inline filter', pence: 1250 },
];
const currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

export default function WholesalePortal() {
  const [sku, setSku] = useState(parts[0].sku);
  const [quantity, setQuantity] = useState('1');
  const part = parts.find(item => item.sku === sku.trim().toUpperCase());
  const count = Number(quantity);
  const valid = Number.isSafeInteger(count) && count >= 1 && count <= 9999;
  const unit = part && valid ? Math.round(part.pence * (count >= 10 ? 0.95 : 1)) : 0;
  return <>
    <SEOHead title={page.title} description={page.description} pagePath={page.path} />
    <Navbar />
    <main lang="en" className="container mx-auto max-w-3xl space-y-6 px-6 py-24">
      <h1 className="text-4xl font-bold">{page.h1}</h1>
      {page.contentBlocks.map(text => <p key={text}>{text}</p>)}
      <section className="space-y-4 rounded-xl border p-6">
        <h2 className="text-2xl font-semibold">Try a sample quote</h2>
        <p>Enter BRG-6202 or FLT-12 and a quantity from 1 to 9,999.</p>
        <label className="block">Stock code <input className="rounded border p-2" value={sku} onChange={e => setSku(e.target.value)} /></label>
        <label className="block">Quantity <input className="rounded border p-2" type="number" min="1" max="9999" value={quantity} onChange={e => setQuantity(e.target.value)} /></label>
        <output aria-live="polite">{!part ? 'No matching stock code.' : !valid ? 'Enter a whole quantity from 1 to 9,999.' :
          `${part.name} · ${count} × ${currency.format(unit / 100)} = ${currency.format(unit * count / 100)} excluding VAT.`}</output>
      </section>
      <Link className="underline" to="/en/contact">Discuss your catalogue and ordering process</Link>
    </main>
    <Footer />
  </>;
}
