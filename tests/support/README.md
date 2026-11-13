# Test support bundle

`linkedom.mjs` is a generated single-file bundle of [linkedom](https://github.com/WebReflection/linkedom) and its dependencies. It is checked in so `npm test` only needs to read one small module and does not depend on a full browser test environment.

Regenerate it after changing the `linkedom` dev dependency:

```bash
npx esbuild node_modules/linkedom/esm/index.js \
  --bundle --platform=node --format=esm --target=node20 \
  --outfile=tests/support/linkedom.mjs
```

Licenses of the bundled packages are preserved at the end of the generated file. linkedom itself is MIT licensed; its transitive dependencies retain their respective licenses (including Apache-2.0 notices for CSS parsing code).
