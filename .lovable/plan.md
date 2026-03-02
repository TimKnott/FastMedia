

## Fix: Visitor Tracking Script Not Initializing

### Problem
The `EmbedCodeInjector` copies script attributes (including `onload`) using `setAttribute()`. However, for dynamically created `<script>` elements, the browser ignores the `onload` **HTML attribute** -- it only responds to the `onload` **JavaScript property**. This means `tracer.js` may download but `init_tracer()` never fires.

### Solution
Update `EmbedCodeInjector.tsx` to detect `onload` (and `onerror`) attributes on script tags and wire them up as actual JS event handlers instead of HTML attributes.

### Changes

**File: `src/components/EmbedCodeInjector.tsx`**

In the script re-creation loop (around line 70-77), after copying attributes, convert `onload`/`onerror` from HTML attributes to JS properties:

```text
Before:
  Array.from(oldScript.attributes).forEach(attr =>
    newScript.setAttribute(attr.name, attr.value)
  );

After:
  Array.from(oldScript.attributes).forEach(attr => {
    if (attr.name === 'onload') {
      newScript.onload = () => new Function(attr.value)();
    } else if (attr.name === 'onerror') {
      newScript.onerror = () => new Function(attr.value)();
    } else {
      newScript.setAttribute(attr.name, attr.value);
    }
  });
```

This ensures that when `tracer.js` finishes loading, the browser calls `init_tracer()` as intended. No database or migration changes needed.
