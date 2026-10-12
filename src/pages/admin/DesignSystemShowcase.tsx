import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const swatches = ['background', 'foreground', 'primary', 'secondary', 'accent', 'muted', 'destructive', 'border', 'card'];

const DesignSystemShowcase = () => (
  <div className="space-y-8 max-w-5xl">
    <div>
      <h1 className="text-3xl font-display font-bold">FastMedia design system</h1>
      <p className="text-muted-foreground">Colours, type and building blocks shared by other projects.</p>
    </div>

    <section className="space-y-3">
      <h2 className="text-xl font-display font-semibold">Colours</h2>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {swatches.map((s) => (
          <div key={s} className="space-y-1">
            <div className="h-14 rounded-md border border-border" style={{ background: `hsl(var(--${s}))` }} />
            <p className="text-xs text-muted-foreground">{s}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl font-display font-semibold">Buttons & badges</h2>
      <div className="flex flex-wrap gap-2">
        <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button><Button variant="destructive">Destructive</Button><Button variant="link">Link</Button>
      </div>
      <div className="flex gap-2"><Badge>Default</Badge><Badge variant="secondary">Secondary</Badge><Badge variant="outline">Outline</Badge><Badge variant="destructive">Alert</Badge></div>
    </section>

    <section className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>Form</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5"><Label htmlFor="ds-name">Name</Label><Input id="ds-name" placeholder="Jan Novák" /></div>
          <div className="space-y-1.5"><Label htmlFor="ds-msg">Message</Label><Textarea id="ds-msg" /></div>
          <Select><SelectTrigger aria-label="Package"><SelectValue placeholder="Choose package" /></SelectTrigger>
            <SelectContent><SelectItem value="a">Starter</SelectItem><SelectItem value="b">Monthly</SelectItem></SelectContent></Select>
          <label className="flex items-center gap-2 text-sm"><Checkbox /> Agree</label>
          <label className="flex items-center gap-2 text-sm"><Switch /> Newsletter</label>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Feedback</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Alert><AlertTitle>Heads up</AlertTitle><AlertDescription>Alerts use semantic tokens.</AlertDescription></Alert>
          <Progress value={60} />
          <Separator />
          <Skeleton className="h-6 w-2/3" />
          <Tabs defaultValue="a"><TabsList><TabsTrigger value="a">One</TabsTrigger><TabsTrigger value="b">Two</TabsTrigger></TabsList>
            <TabsContent value="a" className="text-sm">First tab</TabsContent><TabsContent value="b" className="text-sm">Second tab</TabsContent></Tabs>
          <Accordion type="single" collapsible><AccordionItem value="x"><AccordionTrigger>Question</AccordionTrigger><AccordionContent>Answer</AccordionContent></AccordionItem></Accordion>
        </CardContent>
      </Card>
    </section>
  </div>
);

export default DesignSystemShowcase;
