import { it, expect } from 'vitest';
import { getAllRoutes } from '../../scripts/seo-routes';

it('feature pages use Service schema, never merchant Product markup', async () => {
  const features = (await getAllRoutes()).filter(r => r.path.startsWith('/feature/'));
  expect(features.length).toBeGreaterThan(0);
  for (const r of features) expect((r.jsonLd as { '@type': string })['@type']).toBe('Service');
}, 60000);
