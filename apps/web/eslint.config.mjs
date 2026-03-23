// ESLint configuration for @stylesnap/web
import rootConfig from '@stylesnap/config-eslint';

export default [
  ...rootConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
