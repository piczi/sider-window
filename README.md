# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# 侧边栏浏览器

一个基于Chrome侧边栏API的网页浏览器扩展，允许用户在不离开当前标签页的情况下浏览其他网页。

## 功能

- **侧边栏网页浏览**: 在Chrome浏览器侧边栏中嵌入一个网页浏览器
- **地址栏**: 支持输入URL或搜索关键词
- **书签功能**:
  - 保存常用网页到书签
  - 快速访问已保存的书签
  - 书签数据跨设备同步

## 技术栈

- Vite
- React
- TypeScript
- Chakra UI
- Chrome Extension API

## 安装方法

1. 克隆或下载此仓库
2. 安装依赖: `pnpm install`
3. 构建项目: `pnpm run build`
4. 打开Chrome浏览器，进入扩展管理页面 (chrome://extensions)
5. 开启"开发者模式"
6. 点击"加载已解压的扩展程序"，选择项目的`dist`文件夹

## 开发指南

- 开发模式: `pnpm run dev`
- 构建生产版本: `pnpm run build`

## 注意事项

- 在使用此扩展之前，你需要创建图标文件:
  - `public/icons/icon16.png` (16x16)
  - `public/icons/icon48.png` (48x48)
  - `public/icons/icon128.png` (128x128)

## 待添加功能

- 历史记录功能
- 前进/后退按钮
- 主题切换
- 更多快捷键支持
