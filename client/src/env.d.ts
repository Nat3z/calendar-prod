/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />


interface ImportMetaEnv {
  NODE_ENV: 'development' | 'production',
  SCHOOL_ASSIGNMENT: string,
  HOSTER: string,
  FLEX_CLIENT_ID: string,
  FLEX_CLIENT_SECRET: string,
}