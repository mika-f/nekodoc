# @nekodoc/plugin-config-ts

NekoDoc plugin for supporting TypeScript in `nekodoc.config.js`.

## Usage

```bash
$ yarn add @nekodoc/plugin-config-ts --dev
```

and

```bash
$ mv nekodoc.config.js nekodoc.config.ts
```

## TypeScript Configuration

```typescript
import path from "path";
import { defineConfig } from "nekodoc";

// use defineConfig helper
export default defineConfig(async ({ command }) => {
  return { ... };
});

// use default export
export default { ... };
```
