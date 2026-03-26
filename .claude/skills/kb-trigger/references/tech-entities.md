# 技术名词识别库

本文档定义 kb-trigger Skill 支持识别的技术名词列表。

---

## 前端框架

| 技术名 | 别名 |
|--------|------|
| Vue | vue, vue.js, vuejs, Vue.js, VueJS, vue2, vue3, Vue 3, Vue 2 |
| React | react, react.js, reactjs, React.js, ReactJS, react18, React 18 |
| Angular | angular, angular.js, angularjs, Angular.js, AngularJS |
| Svelte | svelte, Svelte |
| Next.js | next, next.js, Next, Next.js, nextjs |
| Nuxt | nuxt, nuxt.js, Nuxt.js, nuxtjs |

---

## 后端技术

| 技术名 | 别名 |
|--------|------|
| Node.js | node, nodejs, Node, Node.js, NodeJS |
| Python | python, Python, py, Django, Flask, FastAPI |
| Java | java, Java, Spring, Spring Boot, SpringBoot |
| Go | go, Go, golang, Golang |
| Rust | rust, Rust |

---

## 数据库

| 技术名 | 别名 |
|--------|------|
| MySQL | mysql, MySQL, MariaDB |
| PostgreSQL | postgresql, PostgreSQL, postgres, psql |
| MongoDB | mongodb, MongoDB, mongo |
| Redis | redis, Redis |
| SQLite | sqlite, SQLite, sqlite3 |

---

## 云平台与 DevOps

| 技术名 | 别名 |
|--------|------|
| Docker | docker, Docker, 容器化 |
| Kubernetes | kubernetes, Kubernetes, k8s, K8s |
| AWS | aws, AWS, Amazon Web Services |
| Vercel | vercel, Vercel |
| Netlify | netlify, Netlify |

---

## 开发工具

| 技术名 | 别名 |
|--------|------|
| Git | git, Git |
| Webpack | webpack, Webpack |
| Vite | vite, Vite |
| TypeScript | typescript, TypeScript, ts, TS, typeScript |
| ESLint | eslint, ESLint |
| Prettier | prettier, Prettier |

---

## 测试工具

| 技术名 | 别名 |
|--------|------|
| Jest | jest, Jest |
| Vitest | vitest, Vitest |
| Cypress | cypress, Cypress |
| Playwright | playwright, Playwright |

---

## CSS 相关

| 技术名 | 别名 |
|--------|------|
| Tailwind CSS | tailwind, Tailwind, tailwindcss, Tailwind CSS |
| Sass | sass, Sass, scss, SCSS |
| Less | less, Less |
| PostCSS | postcss, PostCSS |

---

## UI 组件库

| 技术名 | 别名 |
|--------|------|
| Ant Design | antd, Ant Design, ant-design |
| Material UI | mui, Material UI, material-ui, @mui |
| Chakra UI | chakra, Chakra UI, chakra-ui |
| Radix UI | radix, Radix UI, radix-ui |

---

## 状态管理

| 技术名 | 别名 |
|--------|------|
| Redux | redux, Redux, react-redux |
| Zustand | zustand, Zustand |
| Pinia | pinia, Pinia |
| Vuex | vuex, Vuex |

---

## 移动端

| 技术名 | 别名 |
|--------|------|
| React Native | react native, React Native, react-native, RN |
| Flutter | flutter, Flutter |

---

## AI 相关

| 技术名 | 别名 |
|--------|------|
| OpenAI | openai, OpenAI, GPT, gpt, gpt-4, GPT-4 |
| Anthropic | anthropic, Anthropic, Claude, claude |
| LangChain | langchain, LangChain |

---

## 其他热门技术

| 技术名 | 别名 |
|--------|------|
| GraphQL | graphql, GraphQL |
| REST API | rest, REST, RESTful, REST API |
| gRPC | grpc, gRPC |
| WebSocket | websocket, WebSocket, ws |
| JWT | jwt, JWT, JSON Web Token |
| OAuth | oauth, OAuth, OAuth2, oauth2 |

---

## 添加新技术名词

编辑 `.claude/scripts/kb-checker.js` 中的 `TECH_ENTITIES` 数组：

```javascript
const CONFIG = {
  TECH_ENTITIES: [
    {
      name: '新技术名',
      aliases: ['别名 1', '别名 2', '别名 3']
    },
    // ...
  ]
};
```

---

*最后更新：2026-03-25*
