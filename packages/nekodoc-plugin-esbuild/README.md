# @nekodoc/plugin-esbuild

NekoDoc plugin for using [esbuild](https://github.com/evanw/esbuild) in build process.  
This is built-in plugin of NekoDoc.

## Usage

```javascript
// @ nekodoc.config.js
const ESBuildPlugin = require("@nekodoc/plugin-esbuild");

module.exports = {
  plugins: [new ESBuildPlugin()],
};
```
