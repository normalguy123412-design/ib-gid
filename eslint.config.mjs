import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    /*
      Почтовый сервис — не часть приложения Next.js, а отдельная
      программа, которую запускает хостинг: `node index.js`. Панель
      запускает её как CommonJS, потому что рядом нет package.json с
      "type": "module", и код на import там падает с SyntaxError.
      Поэтому здесь require — не небрежность, а требование площадки,
      и правило, запрещающее его, к этим файлам не относится.
    */
    files: ["mail-service/**/*.js", "mail-service/**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
