# @nekodoc/config-loader

Provide configuration system that supporting `nekodoc.config.js`, `nekodoc.config.mjs`, and `nekodoc.config.cjs`.

## Usage

```bash
$ touch nekodoc.config.js
# or
$ yarn run nekodoc init
```

## JavaScript Configuration

If you specify `type: module` in `package.json`, you can use ESModule for writing configuration.

```javascript
import path from "path";
import { defineConfig } from "nekodoc";

// use defineConfig helper
export default defineConfig(async ({ command }) => {
  return { ... };
})

// use default export
export default { ... };
```

otherwise; you should write configuration in CommonJS style (not recommended).

```javascript
const path = require("path");

// use default export
module.exports = { ... };
```
