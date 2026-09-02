# 📖 PaperLens (论文透镜) - macOS 原生风学术文献翻译器

[![macOS](https://img.shields.io/badge/Platform-macOS%20(Apple%20Silicon%20M1%2FM2%2FM3%2FM4)-000000?logo=apple&logoColor=white)](https://apple.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 一款专为科研人员打造的高保真、苹果原生设计风格（macOS HIG）的双栏中英对照学术论文翻译器。体验媲美小绿鲸，支持用户**自带 API Key (BYOK)**，支持 Kimi、小米 MiMo、智谱 GLM、通义千问 Qwen、DeepSeek 等国内外主流大模型。

---

## ✨ 核心特性

- 🍏 **极致 macOS 原生视觉体验**：
  - 采用 Apple Human Interface Guidelines（HIG）设计规范，拥有 SF Pro 优雅排版、Traffic Lights 标题栏与细腻的毛玻璃（Vibrancy）半透明质感；
  - 完美适配系统级深色/浅色模式（Dark Mode）。
- 📑 **高保真双栏对照阅读（小绿鲸同款体验）**：
  - 原文与译文左右自适应 50/50 分割分栏排版，支持任意拖拽调节分栏比例；
  - 智能段落同步定位与流式阅读体验。
- 🤖 **多大模型矩阵（BYOK 模式）**：
  - 预设 **Kimi (Moonshot)**、**小米 MiMo**、**智谱 GLM**、**阿里通义千问 (Qwen)**、**DeepSeek**、**OpenAI (ChatGPT)**、**Anthropic Claude**、**Google Gemini**；
  - 支持任何标准 OpenAI 兼容的第三方自建或聚合端点；
  - 内置毫秒级 API 连通性测试与延迟反馈面板。
- 🧮 **LaTeX 数学公式硬核保护**：
  - 采用独创的占位符隔离保护算法（`__MATH_BLOCK_N__` / `__MATH_INLINE_N__`）；
  - 翻译过程中绝对不会破坏论文中的数学定理、上下标、积分式与 KaTeX 渲染结构。
- 🖼️ **高清纯净图表与双语图注对照**：
  - 保持论文原图 100% 原始清晰度无损展示，无任何多余色块遮挡；
  - 支持点击放大查看原图（Lightbox 模态大图）；
  - 图下方自动生成标准中英双语图注对照（图注译文 / 图注原文）。
- ⚡ **高性能本地解析**：
  - 纯客户端 2x Retina 像素采样 PDF 深度解析引擎，文件全程留在本地，零隐私泄露风险。
- 💾 **IndexedDB 本地持久化存储**：
  - 关闭软件再打开不再丢失文献与翻译！全篇译文、进度状态与图表数据全程自动静默持久化于本地数据库，无需反复导入与翻译。
- 📁 **多维分类与文件夹管理**：
  - 侧边栏支持自由新建、删除分类文件夹，多标签胶囊栏快速筛选，文献可随时跨分类移动或一键清理。
- 📥 **双语精读笔记一键导出**：
  - 顶部工具栏支持一键导出标准 Markdown 双语排版笔记，完美保留 LaTeX 公式、段落中英对照与图表结构，无缝接入 Notion、Obsidian、Word。

---

## 🛠️ 支持的模型配置指南

在软件右上角点击 **设置 (⚙️)**，选择对应厂商并填入您的 API Key 即可使用：

| 模型厂商 | 推荐默认模型 | 官方 API Key 申请地址 |
| :--- | :--- | :--- |
| **DeepSeek** | `deepseek-chat` / `deepseek-reasoner` | [DeepSeek Platform](https://platform.deepseek.com) |
| **Kimi (Moonshot)** | `moonshot-v1-8k` / `moonshot-v1-32k` | [Moonshot AI 开放平台](https://platform.moonshot.cn) |
| **小米 MiMo** | `mimo-v1` | [小米开放平台](https://dev.mi.com) |
| **智谱 GLM** | `glm-4-flash` / `glm-4` | [智谱开放平台](https://open.bigmodel.cn) |
| **阿里通义千问 (Qwen)** | `qwen-plus` / `qwen-turbo` | [阿里云百炼平台](https://bailian.console.aliyun.com) |
| **OpenAI** | `gpt-4o` / `gpt-4o-mini` | [OpenAI Platform](https://platform.openai.com) |
| **Claude** | `claude-3-5-sonnet-20241022` | [Anthropic Console](https://console.anthropic.com) |
| **Google Gemini** | `gemini-1.5-flash` / `gemini-2.0-flash` | [Google AI Studio](https://aistudio.google.com) |
| **自定义端点** | 自定义兼容模型 | 任何兼容 OpenAI `v1/chat/completions` 的服务商 |

---

## 🚀 快速开始与本地开发

### 环境要求
- **macOS**：推荐 macOS 12+ (Apple Silicon M1/M2/M3/M4 芯片最佳)
- **Node.js**：v18+ (推荐 v20 或 v24)
- **包管理器**：`pnpm` (推荐) 或 `npm`

### 1. 克隆项目与安装依赖
```bash
# 克隆仓库
git clone https://github.com/your-username/paperlens.git
cd paperlens

# 安装依赖
pnpm install
```

### 2. 启动本地开发服务
```bash
pnpm dev
```
打开浏览器访问 `http://localhost:5173/` 即可进入应用。

### 3. 构建生产 Web 静态产物
```bash
pnpm build
```

---

## 📦 打包为 macOS 原生 `.dmg` 安装包

本项目支持直接打包为适用于苹果电脑 M 系列芯片的原生桌面客户端 `.dmg`：

```bash
# 打包生成适用于 Apple Silicon (arm64) 的 macOS .dmg 安装包
pnpm build:dmg
```

打包完成后，安装包将输出在 `release/` 目录下：
- 文件名示例：`PaperLens-1.0.0-arm64.dmg`
- 双击该 `.dmg` 文件，将 PaperLens 拖拽至 `Applications`（应用程序）文件夹即可畅享原生桌面客户端！

---

## 📂 项目工程架构

```text
paperlens/
├── electron/                 # Electron 桌面端主进程与原生桥接
│   ├── main.ts               # 窗口管理、macOS 标题栏与系统级菜单
│   └── preload.ts            # 安全上下文隔离与进程间通信
├── src/
│   ├── components/           # UI 组件库 (苹果原生风格)
│   │   ├── TitleBar.tsx      # macOS 交通灯控制与顶部工具栏
│   │   ├── Sidebar.tsx       # 侧边栏文献大纲与文档库
│   │   ├── SplitReader.tsx   # 双栏中英对照分屏核心阅读器
│   │   ├── FigureViewer.tsx  # 原生高保真插图与双语图注查看器
│   │   ├── TableViewer.tsx   # 科学表格中英双语对照组件
│   │   ├── MathRenderer.tsx  # KaTeX 实时数学公式渲染引擎
│   │   └── APISettingsModal.tsx # 多厂商 API Key 配置面板
│   ├── services/
│   │   ├── apiService.ts     # 多厂商大模型聚合网关与公式占位符保护
│   │   └── documentParser.ts # PDF.js 客户端 2x Retina 采样解析引擎
│   ├── types/                # TypeScript 类型体系定义
│   ├── App.tsx               # 根应用控制器与状态流
│   └── index.css             # Tailwind CSS 4 与 SF Pro 系统样式
├── package.json              # 依赖管理与构建脚本
└── vite.config.ts            # Vite 8 构建配置与别名映射
```

---

## 📄 开源许可证

本项目基于 [MIT 许可证](LICENSE) 开源。欢迎 Star、Fork 与提 Issue 贡献代码！
