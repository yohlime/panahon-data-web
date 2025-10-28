/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_PANAHON_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
