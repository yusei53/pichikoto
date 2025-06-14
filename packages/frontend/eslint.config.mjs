import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    languageOptions: {
      parser: "@typescript-eslint/parser"
    },
    plugins: {
      "@typescript-eslint": compat.plugins("@typescript-eslint"),
      "unused-imports": compat.plugins("unused-imports"),
      import: compat.plugins("import"),
      prettier: compat.plugins("prettier")
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_" }
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type"
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before"
            }
          ],
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          }
        }
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
          fixStyle: "separate-type-imports"
        }
      ]
    }
  }
];

export default eslintConfig;
