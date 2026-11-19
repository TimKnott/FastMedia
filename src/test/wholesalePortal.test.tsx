import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import WholesalePortal from '@/pages/WholesalePortal';

vi.mock('@/components/Navbar', () => ({ default: () => null }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/SEOHead', () => ({ default: () => null }));

it('quotes a matching SKU at the quantity break and rejects invalid input', () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const setInput = (input: HTMLInputElement, value: string) => act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  try {
    act(() => root.render(<MemoryRouter><WholesalePortal /></MemoryRouter>));
    const [code, quantity] = host.querySelectorAll('input');
    const output = host.querySelector('output');
    expect(output).toHaveTextContent('£4.80');
    setInput(quantity, '10');
    expect(output).toHaveTextContent('£45.60');
    setInput(quantity, '0');
    expect(output).toHaveTextContent('Enter a whole quantity');
    setInput(code, 'missing');
    expect(output).toHaveTextContent('No matching stock code');
  } finally {
    act(() => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
