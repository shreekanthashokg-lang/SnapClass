/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_REPO_URL?: string;
  readonly VITE_AUTHOR_GITHUB?: string;
  readonly VITE_AUTHOR_LINKEDIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
