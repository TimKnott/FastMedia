import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

type Pin = { id: number; title: string; description: string; alt: string; destination: string; imageUrl: string; date: string; status: 'draft' | 'ready' | 'published' };
const KEY = 'fastmedia-pinterest-drafts-v1';
const topics = [
 ['7 Website Mistakes That Cost You Customers', 'Slow loading, confusing navigation, mobile issues, weak calls to action, missing booking, long forms and disconnected CRM.'],
 ['Your Website Should Win Customers', 'A website should turn interest into enquiries, not just look attractive.'],
 ['5 Signs Your Website Needs a Redesign', 'Outdated design, slow pages, poor mobile experience, unclear services and low enquiries.'],
 ['Turn Website Visitors into Leads', 'Connect clear messaging, trust signals and simple enquiry forms.'],
 ['Why Every Service Business Needs Online Booking', 'Give customers a convenient way to request an appointment.'],
 ['The 3-Second Website First Impression', 'Make your main offer obvious immediately.'],
 ['Make Your Homepage Work Harder', 'Show who you help, what you do and why customers should choose you.'],
 ['Mobile-First Website Checklist', 'Improve navigation, text, forms and call-to-action buttons on phones.'],
 ['What Is a CRM Integration?', 'Send website leads straight into your customer management workflow.'],
 ['Stop Losing Leads in Your Inbox', 'Centralise enquiries and keep track of follow-ups.'],
 ['SEO Basics for Small Businesses', 'Improve titles, page structure, local relevance and internal links.'],
 ['AI Search Optimisation Explained', 'Make business information clear and easy to understand for AI search tools.'],
 ['What Makes a Landing Page Convert?', 'Use one goal, a strong headline, proof and a clear call to action.'],
 ['Website Navigation Mistakes to Avoid', 'Help visitors reach key services and contact details quickly.'],
 ['Booking Forms That Customers Finish', 'Keep forms short, accessible and straightforward.'],
 ['How a Website Connects to a Database', 'Use secure integrations to display and update business information.'],
 ['Online Shop Essentials', 'Start with intuitive categories, search, checkout and clear delivery information.'],
 ['E-commerce Product Page Checklist', 'Make imagery, features, pricing and purchase options easy to understand.'],
 ['How to Improve Website Speed', 'Compress images, reduce unnecessary scripts and test performance.'],
 ['Your Contact Page Is a Sales Tool', 'Offer direct ways to enquire, book and request a quote.'],
 ['The Small Business Website Launch Checklist', 'Test forms, links, mobile views and analytics before launch.'],
 ['Why Calls to Action Matter', 'Make the next step easy to recognise and take.'],
 ['Build Trust on Your Website', 'Show real examples, clear policies and useful contact information.'],
 ['How to Structure Service Pages', 'Explain the problem, approach, benefits and next steps.'],
 ['Website Analytics for Beginners', 'Understand visits, enquiries and conversion rates.'],
 ['Connect Your Booking Calendar', 'Reduce scheduling friction and improve follow-up.'],
 ['5 Ways to Improve an Online Shop', 'Focus on search, product clarity, trust, checkout and support.'],
 ['What Is a Customer Portal?', 'Give customers a secure place to review projects and information.'],
 ['Website Automation Ideas', 'Automatically route leads, notify teams and reduce manual admin.'],
 ['Website Accessibility Basics', 'Use readable text, descriptive links and keyboard-friendly interactions.'],
 ['How to Brief a Website Designer', 'Share your audience, goals, must-have features and examples.'],
 ['Before-and-After Website Improvements', 'Show how clearer content and simpler navigation improve usability.'],
 ['Website SEO vs AI Search', 'Understand how structured useful content supports discovery.'],
 ['A Better Quote Request Form', 'Ask customers for the details needed to make a useful estimate.'],
 ['Choosing a Website Platform', 'Compare editing needs, integrations, maintenance and ownership.'],
 ['Connect Your Website to Your ERP', 'Give customers current information through reliable backend integrations.'],
 ['Why Website Security Matters', 'Protect forms, accounts and integrations through sound practices.'],
 ['7 Common E-commerce Mistakes', 'Avoid confusing categories, missing product details and complicated checkout.'],
 ['What Your Business Homepage Needs', 'Headline, services, benefits, evidence and contact route.'],
 ['Designing Better Mobile Menus', 'Keep menus simple and prioritise important actions.'],
 ['Lead Capture Without Friction', 'Use focused forms with helpful field labels.'],
 ['How to Plan a Website Redesign', 'Review goals, content, users, functionality and testing.'],
 ['Connecting Shopify to Business Systems', 'Plan reliable order, inventory and customer data flows.'],
 ['The Benefits of a Product Catalogue', 'Present searchable product information with accurate updates.'],
 ['Website Maintenance Checklist', 'Check updates, forms, backups, security and broken links.'],
 ['Getting More Enquiries from Local Search', 'Create helpful location-relevant pages and accurate contact details.'],
 ['How to Improve a Services Website', 'Make the offer, booking process and next steps unmistakable.'],
 ['Customer Journey from Pin to Enquiry', 'Give every Pin a useful destination and a clear next action.'],
 ['Pinterest Content Planning for Businesses', 'Build themed visual resources that answer real customer questions.'],
 ['The Connected Business Website', 'Bring together website content, leads, bookings and business data.'],
];
const initial = (): Pin[] => topics.map(([title, description], i) => ({
  id: i + 1, title, description: description + ' Explore practical website and digital growth ideas from FastMedia.Pro.',
  alt: 'FastMedia.Pro visual guide about ' + title.toLowerCase() + '.',
  destination: i === 0 ? 'https://fastmedia.pro/pinterest' : 'https://fastmedia.pro',
  imageUrl: '', date: '', status: 'draft'
}));
const csvEscape = (s: string) => '"' + s.replace(/"/g, '""') + '"';
const download = (name: string, content: string, mime: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
};
const tools = [
  ['Pinterest business', 'https://www.pinterest.com/business/'],
  ['Create Pin', 'https://www.pinterest.com/pin-creation-tool/'],
  ['Analytics', 'https://analytics.pinterest.com/'],
  ['Claim website', 'https://www.pinterest.com/settings/claim/'],
  ['Account settings', 'https://www.pinterest.com/settings/'],
  ['Catalogues', 'https://www.pinterest.com/business/hub/'],
  ['Shopify Pinterest app', 'https://apps.shopify.com/pinterest-1'],
  ['Instagram linking', 'https://www.pinterest.com/settings/claim/'],
];
export default function AdminPinterestFactory() {
  const [pins, setPins] = useState<Pin[]>(() => {
    try { const stored = JSON.parse(localStorage.getItem(KEY) || 'null'); return Array.isArray(stored) && stored.length ? stored : initial(); }
    catch { return initial(); }
  });
  const [selectedId, setSelectedId] = useState(1);
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(pins)); } catch { toast.error('Browser storage unavailable; export a backup.'); } }, [pins]);
  const selected = pins.find(p => p.id === selectedId);
  const visible = useMemo(() => pins.filter(p => (filter === 'all' || p.status === filter) && (p.title + ' ' + p.description).toLowerCase().includes(query.toLowerCase())), [pins, filter, query]);
  const patch = (field: keyof Pin, value: string) => setPins(prev => prev.map(p => p.id === selectedId ? { ...p, [field]: value } : p));
  const schedule = () => {
    if (!startDate) return toast.error('Choose the first publishing date.');
    const base = new Date(startDate + 'T12:00:00');
    if (Number.isNaN(base.getTime())) return toast.error('Invalid start date.');
    setPins(prev => prev.map((p, i) => {
      const d = new Date(base); d.setDate(base.getDate() + Math.floor(i / 5));
      return { ...p, date: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') };
    }));
    toast.success('50 drafts planned over 10 days at five Pins per day; nothing was published.');
  };
  const csv = () => {
    const headers = ['Title','Description','Alt text','Destination URL','Media URL','Planned date','Status'];
    const rows = pins.map(p => [p.title,p.description,p.alt,p.destination,p.imageUrl,p.date,p.status]);
    download('fastmedia-pinterest-50-drafts.csv', [headers,...rows].map(r => r.map(csvEscape).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
    toast.success('Draft spreadsheet exported. Review against Pinterest bulk-upload template before importing.');
  };
  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-sm text-muted-foreground">FastMedia.Pro / Back office</p><h1 className="text-3xl font-bold">Pinterest Content Factory</h1><p className="text-muted-foreground">50 editable concepts • 10-day planning queue • manual publishing workflow</p></div>
      <div className="flex flex-wrap gap-2"><Button onClick={csv}>Export CSV</Button><Button variant="outline" onClick={() => download('fastmedia-pinterest-backup.json',JSON.stringify(pins,null,2),'application/json')}>Back up JSON</Button></div>
    </header>
    <p className="rounded-lg border p-3 text-sm text-muted-foreground">Private admin route. Drafts save only in this browser; they are not synchronised to other devices. Image URLs are placeholders until actual image assets are supplied. CSV is a planning spreadsheet, not a guaranteed Pinterest bulk-upload format. Nothing posts automatically.</p>
    <div className="grid gap-3 sm:grid-cols-3">{[['Drafts',pins.filter(p=>p.status==='draft').length],['Ready for review',pins.filter(p=>p.status==='ready').length],['Recorded as published',pins.filter(p=>p.status==='published').length]].map(([label,value])=><Card key={label}><CardContent className="pt-5"><p className="text-sm text-muted-foreground">{label}</p><p className="text-3xl font-bold">{value}</p></CardContent></Card>)}</div>
    <section className="rounded-xl border p-5 space-y-3"><h2 className="text-lg font-semibold">Plan five Pins per day</h2><div className="flex flex-wrap items-center gap-3"><Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-52" aria-label="Start date"/><Button onClick={schedule}>Fill 10-day queue</Button></div><p className="text-sm text-muted-foreground">Dates are planning targets only. Review text, destination and image before publishing each Pin.</p></section>
    <div className="grid gap-5 lg:grid-cols-[minmax(240px,1fr)_minmax(0,2fr)]">
      <section className="rounded-xl border p-4 space-y-3"><h2 className="font-semibold">Draft library</h2><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search 50 ideas"/><select value={filter} onChange={e=>setFilter(e.target.value)} className="w-full rounded-md border bg-background p-2"><option value="all">All statuses</option><option value="draft">Draft</option><option value="ready">Ready</option><option value="published">Recorded as published</option></select><div className="max-h-[650px] space-y-2 overflow-y-auto">{visible.map(p=><button type="button" key={p.id} onClick={()=>setSelectedId(p.id)} className={'w-full rounded-lg border p-3 text-left text-sm hover:bg-muted ' +(p.id===selectedId?'border-primary bg-muted':'')}><span className="text-xs text-muted-foreground">#{p.id} {p.date ? ' • '+p.date : ''} • {p.status}</span><span className="mt-1 block font-medium">{p.title}</span></button>)}</div></section>
      <section className="rounded-xl border p-5 space-y-4">{selected ? <><h2 className="text-xl font-semibold">Edit Pin #{selected.id}</h2>
        <label className="block text-sm font-medium">Title<Input className="mt-1" value={selected.title} onChange={e=>patch('title',e.target.value)}/></label>
        <label className="block text-sm font-medium">Description<Textarea className="mt-1" rows={4} value={selected.description} onChange={e=>patch('description',e.target.value)}/></label>
        <label className="block text-sm font-medium">Alt text<Textarea className="mt-1" value={selected.alt} onChange={e=>patch('alt',e.target.value)}/></label>
        <label className="block text-sm font-medium">Destination URL<Input className="mt-1" value={selected.destination} onChange={e=>patch('destination',e.target.value)}/></label>
        <label className="block text-sm font-medium">Image URL<Input className="mt-1" value={selected.imageUrl} onChange={e=>patch('imageUrl',e.target.value)} placeholder="Publicly accessible image URL"/></label>
        {selected.imageUrl && <img src={selected.imageUrl} alt={selected.alt || 'Draft Pin image'} className="max-h-80 rounded-lg object-contain" />}
        <label className="block text-sm font-medium">Planned date<Input className="mt-1 max-w-xs" type="date" value={selected.date} onChange={e=>patch('date',e.target.value)}/></label>
        <label className="block text-sm font-medium">Workflow status<select value={selected.status} onChange={e=>patch('status',e.target.value)} className="mt-1 block w-full max-w-sm rounded-md border bg-background p-2"><option value="draft">Draft</option><option value="ready">Ready for manual publication</option><option value="published">Published (manual record only)</option></select></label>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={()=>{void navigator.clipboard.writeText(selected.title+'\n\n'+selected.description+'\n\n'+selected.destination);toast.success('Pin copy copied');}}>Copy Pin text</Button><Button variant="outline" onClick={()=>{void navigator.clipboard.writeText(selected.alt);toast.success('Alt text copied');}}>Copy alt text</Button><Button asChild><a href="https://www.pinterest.com/pin-creation-tool/" target="_blank" rel="noopener noreferrer">Open Pinterest creator</a></Button></div>
        </> : <p>Select a draft.</p>}</section>
    </div>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Pinterest tools & connections</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{tools.map(([label,url])=><a key={label} href={url} target="_blank" rel="noopener noreferrer" className="rounded-lg border p-4 font-medium hover:bg-muted">{label} ↗</a>)}</div><p className="text-sm text-muted-foreground">Website claiming, Instagram linking, catalogues and Shopify require setup in Pinterest or the relevant account. These shortcuts do not connect accounts automatically. <Link className="underline" to="/pinterest">View public resource page</Link>.</p></section>
  </div>;
}
