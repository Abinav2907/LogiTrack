import { defineConfig, globalIgnores } from "eslint/config";
import coreWebVitals from "eslint-config-next/core-web-vitals.js";
import typescript from "eslint-config-next/typescript.js";

export default defineConfig([
  coreWebVitals,
  typescript,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
