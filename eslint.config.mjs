import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["node_modules/**"],
  },
  {
    rules: {
      // localStorage hydration in useEffect is a standard Next.js pattern
      // and cannot be done with lazy initializers due to SSR
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
