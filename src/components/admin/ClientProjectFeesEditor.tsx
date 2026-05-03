import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

export interface FeeLine {
  label: string;
  amount: number;
  recurrence: 'one_time' | 'monthly' | 'yearly';
  notes?: string;
}

export interface ProjectFees {
  currency: string;
  dev_fee: number;
  hosting_fee_yearly: number;
  ai_token_ratio: number;
  ai_cost_per_unit: number;
  ai_units_per_user: number;
  deposit_pct: number;
  late_penalty_pct_per_day: number;
  fee_line_items: FeeLine[];
}

interface Props {
  value: ProjectFees;
  onChange: (next: ProjectFees) => void;
}

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0);

export const calcTotals = (f: ProjectFees) => {
  const lineOneOff = (f.fee_line_items || [])
    .filter((l) => l.recurrence === 'one_time')
    .reduce((s, l) => s + Number(l.amount || 0), 0);
  const lineMonthly = (f.fee_line_items || [])
    .filter((l) => l.recurrence === 'monthly')
    .reduce((s, l) => s + Number(l.amount || 0), 0);
  const lineYearly = (f.fee_line_items || [])
    .filter((l) => l.recurrence === 'yearly')
    .reduce((s, l) => s + Number(l.amount || 0), 0);

  const oneOffTotal = Number(f.dev_fee || 0) + lineOneOff;
  const yearlyTotal = Number(f.hosting_fee_yearly || 0) + lineYearly + lineMonthly * 12;
  const depositAmount = Math.round(oneOffTotal * (Number(f.deposit_pct || 0) / 100));
  const balanceDue = oneOffTotal - depositAmount;

  // AI worked example for 100 users
  const aiUsers = 100;
  const rawUnits = aiUsers * Number(f.ai_units_per_user || 1);
  const billedUnits = rawUnits * Number(f.ai_token_ratio || 3);
  const aiCost100 = billedUnits * Number(f.ai_cost_per_unit || 0);

  return { oneOffTotal, yearlyTotal, depositAmount, balanceDue, aiCost100, aiUsers, billedUnits };
};

export const ClientProjectFeesEditor = ({ value, onChange }: Props) => {
  const totals = useMemo(() => calcTotals(value), [value]);
  const set = <K extends keyof ProjectFees>(k: K, v: ProjectFees[K]) => onChange({ ...value, [k]: v });

  const addLine = () =>
    set('fee_line_items', [...(value.fee_line_items || []), { label: '', amount: 0, recurrence: 'one_time' }]);
  const updateLine = (i: number, patch: Partial<FeeLine>) => {
    const next = [...(value.fee_line_items || [])];
    next[i] = { ...next[i], ...patch };
    set('fee_line_items', next);
  };
  const removeLine = (i: number) =>
    set('fee_line_items', (value.fee_line_items || []).filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <Label>Currency</Label>
          <select
            value={value.currency}
            onChange={(e) => set('currency', e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="CZK">CZK</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <Label>Development fee (one-off)</Label>
          <Input type="number" min={0} value={value.dev_fee} onChange={(e) => set('dev_fee', Number(e.target.value))} />
        </div>
        <div>
          <Label>Hosting fee (per year)</Label>
          <Input
            type="number"
            min={0}
            value={value.hosting_fee_yearly}
            onChange={(e) => set('hosting_fee_yearly', Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Deposit %</Label>
          <Input
            type="number"
            min={0}
            max={100}
            step="0.5"
            value={value.deposit_pct}
            onChange={(e) => set('deposit_pct', Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Late penalty % / day</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={value.late_penalty_pct_per_day}
            onChange={(e) => set('late_penalty_pct_per_day', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-md border border-border p-3 bg-muted/30">
        <p className="text-xs font-medium text-foreground mb-2">AI Service Units pricing</p>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Markup ratio (Service : raw)</Label>
            <Input
              type="number"
              min={1}
              step="0.5"
              value={value.ai_token_ratio}
              onChange={(e) => set('ai_token_ratio', Number(e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">Cost per Service Unit ({value.currency})</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={value.ai_cost_per_unit}
              onChange={(e) => set('ai_cost_per_unit', Number(e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">Avg raw units / end-user</Label>
            <Input
              type="number"
              min={0}
              step="0.1"
              value={value.ai_units_per_user}
              onChange={(e) => set('ai_units_per_user', Number(e.target.value))}
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Worked example: <strong>{totals.aiUsers}</strong> end-users ×{' '}
          <strong>{value.ai_units_per_user}</strong> raw units ×{' '}
          <strong>{value.ai_token_ratio}:1</strong> markup ={' '}
          <strong>{totals.billedUnits.toFixed(0)}</strong> Service Units ≈{' '}
          <strong>{fmt(totals.aiCost100, value.currency)}</strong>
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Custom fee line items</Label>
          <Button size="sm" variant="outline" onClick={addLine} type="button">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add line
          </Button>
        </div>
        {(value.fee_line_items || []).length === 0 ? (
          <p className="text-xs text-muted-foreground">No additional line items.</p>
        ) : (
          <div className="space-y-2">
            {value.fee_line_items.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                <Input
                  className="col-span-5"
                  placeholder="Description (e.g. Logo redesign)"
                  value={line.label}
                  onChange={(e) => updateLine(i, { label: e.target.value })}
                />
                <Input
                  className="col-span-3"
                  type="number"
                  min={0}
                  placeholder="Amount"
                  value={line.amount}
                  onChange={(e) => updateLine(i, { amount: Number(e.target.value) })}
                />
                <select
                  className="col-span-3 h-10 rounded-md border border-input bg-background px-2 text-sm"
                  value={line.recurrence}
                  onChange={(e) => updateLine(i, { recurrence: e.target.value as FeeLine['recurrence'] })}
                >
                  <option value="one_time">One-off</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <Button
                  size="icon"
                  variant="ghost"
                  className="col-span-1"
                  onClick={() => removeLine(i)}
                  type="button"
                  aria-label="Remove line"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border border-primary/30 bg-primary/5 p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">One-off total</p>
          <p className="font-semibold text-foreground">{fmt(totals.oneOffTotal, value.currency)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Deposit ({value.deposit_pct}%)
          </p>
          <p className="font-semibold text-primary">{fmt(totals.depositAmount, value.currency)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Balance on launch</p>
          <p className="font-semibold text-foreground">{fmt(totals.balanceDue, value.currency)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Recurring / year</p>
          <p className="font-semibold text-foreground">{fmt(totals.yearlyTotal, value.currency)}</p>
        </div>
      </div>
    </div>
  );
};
