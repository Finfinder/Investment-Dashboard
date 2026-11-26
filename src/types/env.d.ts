/**
 * Minimal typings for the Vite environment.
 *
 * Declared locally instead of referencing `vite/client` so that the existing
 * module declarations in `src/types/css.d.ts` are not duplicated.
 */
interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
