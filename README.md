# 📖 PaperLens (论文透镜) - 新一代 macOS 原生学术文献双语精读器

<p align="center">
  <img src="https://raw.githubusercontent.com/lllsp686/translate/main/public/vite.svg" width="96" height="96" alt="PaperLens Logo" />
</p>

<p align="center">
  <strong>专为科研学者与高校师生打造的沉浸式学术文献双语精读工作站</strong><br>
  苹果原生设计语言 (macOS HIG) · 独创 LaTeX 公式占位符零损保护 · 高保真原图图注双语对照 · AI 伴读速读助手 · 本地持久化存储
</p>

<p align="center">
  <a href="https://github.com/lllsp686/translate/releases"><img src="https://img.shields.io/badge/Release-v1.0.0-blue.svg?style=flat-square" alt="Release"></a>
  <a href="https://apple.com"><img src="https://img.shields.io/badge/Platform-macOS%20(Apple%20Silicon%20M1~M4)-black?style=flat-square&logo=apple" alt="macOS"></a>
  <a href="https://electronjs.org"><img src="https://img.shields.io/badge/Electron-34.x-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19"></a>
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License"></a>
</p>

---

## 🌟 为什么选择 PaperLens？

在日常阅读顶会顶刊（CVPR, NeurIPS, ICML, Nature, Science, IEEE, ACM）时，传统翻译工具常面临以下核心痛点：
1. **公式乱码**：直接丢进网页翻译，导致复杂的 LaTeX 积分、矩阵、上下标全被拆解翻译为乱码；
2. **图表丢失**：翻译后原论文的高清矢量插图、流程图和对比曲线被剥离或分辨率极低；
3. **数据易失**：关闭软件或刷新页面后，刚刚精读翻译的数万字文献全被清空，下次打开又要重复花钱重译；
4. **资费盲盒**：无法获知 API 到底花了多少钱，更无法得知官方账户到底还剩多少额度；
5. **生态绑定与高昂年费**：市场上商业软件收费昂贵且常常限制模型、排队等待。

**PaperLens (论文透镜)** 专为解决上述痛点而生——采用 **BYOK (Bring Your Own Key)** 模式，直连官方原厂大模型，无任何中间商加价与抽水；纯客户端离线解析与本地 IndexedDB 数据库引擎，文献隐私 100% 留存在您的 Mac 电脑本地！

---

## ✨ 核心全功能矩阵

### 1. 🍏 极致的 macOS 原生设计美学 (HIG)
- **原生交通灯与视觉融合**：完美继承 macOS 窗口管理规范（红色关闭、黄色最小化、绿色缩放/原生全屏），杜绝任何重影与误触；
- **毛玻璃与暗色模式**：全局采用 Apple SF Pro 字体体系与精致的半透明毛玻璃（Vibrancy）质感，自适应系统深色/浅色模式切换。

### 2. 📑 高保真双栏对照阅读与平滑滚动联动
- **50/50 自由拖拽分栏**：左侧英文论文原版，右侧流畅中文学术译文，支持拖拽中线实时自由调整两栏阅读比例；
- **三种阅读模式一键切换**：
  - `双栏对照`：左右分屏精读；
  - `译文纯享`：单屏纯中文流畅通读；
  - `原文排版`：单屏纯英文文献校对。
- **双向平滑滚动联动**：可随时开启/关闭左右视口联动对齐，在阅读多页长文时，左右两侧按比例丝滑跟随。

### 3. 🧮 独创 LaTeX 数学公式零损保护
- 独创双向占位符隔离引擎（`__MATH_BLOCK_N__` / `__MATH_INLINE_N__`）；
- 在交给大语言模型翻译前将公式提取为安全标桩，模型翻译完毕后自动高精度还原；
- 论文中的所有积分式、矩阵、上下标、希腊字母均通过 **KaTeX** 原生高保真渲染，绝不损坏任何定理推导。

### 4. 🖼️ 高清纯净论文原图与中英双语图注
- **2x Retina 像素级插图采样**：无损呈现论文原图中的每处细节与坐标轴；
- **标准双语图注对照**：图表下方自动排版呈现“【图注译文】”与“【图注原文】”对照展示；
- **Lightbox 原图灯箱**：点击图表即可弹出无损高清大图查看。

### 5. 💾 原生 IndexedDB 本地持久化存储
- 彻底告别“每次打开都要重新导入翻译”！
- 内置浏览器级高效本地持久化数据库，自动静默存储文档结构、全部段落译文、高清插图、阅读进度与阅读批注；
- 重启电脑或重开软件，之前翻译过的文献瞬间毫秒级秒开秒读。

### 6. 📁 文献多维分类与文件夹管理
- 侧边栏支持创建、重命名、删除专属文献分类（如：`精读文献`、`综述论文`、`实验参考` 等）；
- 顶部支持分类胶囊标签一键筛选；
- 文献卡片右键/快捷菜单支持随时跨分类归档转移或一键清理。

### 7. 🤖 AI 论文伴读助手 (Paper Copilot)
- **四维学术速读简报**：点击右侧伴读抽屉，1 秒自动提炼全篇四大核心维度：
  - 🎯 **核心贡献 (Contributions)**：本文的核心突破与创新价值；
  - 🔬 **技术路线 (Methodology)**：核心网络架构、损失函数设计与算法逻辑；
  - 📊 **实验结论 (Results & Benchmarks)**：核心基准测试集与对比指标；
  - ⚠️ **潜在局限 (Limitations)**：算力消耗、数据集偏差与未来方向。
- **全文深度交互对话**：支持针对本篇论文的任何细节（如公式中的具体符号代表什么、与 Baseline 的具体差距）与 AI 进行流式问答。

### 8. 🔍 鼠标划词即时翻译与专属生词本
- 鼠标选中文献中任意英文单词、短语或长难句，瞬间弹出精致的悬浮翻译气泡；
- 包含英美音标发音、词性划分、地道学术释义；
- 支持一键 **“存入生词本”**，打造专属科研高频词汇库。

### 9. 🖍️ 四色荧光笔划线与科研边注
- 支持 **浅黄（核心要点）**、**浅绿（数据支撑）**、**浅蓝（实验结论）**、**浅粉（疑问思考）** 四色学术划线；
- 划线处支持添加个人思考边注，所有划线与批注随文档永久持久化保存。

### 10. 🎛️ 学术翻译语气风格预设
- **地道学术中文（学报标准）**：符合中国科学、计算机学报等顶级期刊规范，用词严谨专业；
- **严谨直译求实（实验推导）**：严格忠实于原文语法从句结构与推导步骤，适合实验复现；
- **通俗易懂通读（快速泛读）**：化繁为简，将复合长难句拆分为自然短句，适合快速泛读。

### 11. 💰 API 账户额度与实时余额查询
- 设置面板直连 **DeepSeek**、**Kimi (Moonshot)**、**OneAPI/聚合服务商** 官方余额接口；
- 点击 **“实时查询余额”**，即刻返回账户可用总余额、现金充值金额与赠送代金券；
- 本地精准记录 **累计翻译字符数**、**预估消耗 Token 数量** 与 **接口调用次数**，资费明细一清二楚。

### 12. 📥 双语精读笔记与 PDF/HTML 一键导出
- **导出双语 Markdown**：包含段落对照、数学公式与结构化大纲，直接兼容 Obsidian、Notion、Logseq；
- **导出独立 HTML 网页**：原生集成打印样式，支持一键 `Command + P` 另存为排版精美的双语对照 PDF 文档。

---

## 🛠️ 全球顶级 AI 模型矩阵支持 (2025-2026 最新阵容)

在软件右上角点击 **设置 (⚙️)**，填入对应厂商的 API Key 即可使用：

| 模型厂商 | 推荐主力模型 | 特性优势 | 官方 API Key 申请地址 |
| :--- | :--- | :--- | :--- |
| **DeepSeek (深度求索)** | `deepseek-chat` / `deepseek-v4` / `deepseek-reasoner` / `deepseek-r1` | 极高性价比、超强中文理解、R1 深度推理 | [DeepSeek Platform](https://platform.deepseek.com) |
| **Kimi (月之暗面)** | `moonshot-v1-auto` / `moonshot-v1-32k` / `kimi-k2` | 强大超长上下文阅读能力，百万字文献轻松解析 | [Moonshot AI 开放平台](https://platform.moonshot.cn) |
| **Anthropic Claude** | `claude-3-7-sonnet-20250219` / `claude-3-5-sonnet-latest` | 全球公认最强学术英文笔译质量与学术文采 | [Anthropic Console](https://console.anthropic.com) |
| **Google Gemini** | `gemini-2.0-flash` / `gemini-2.0-pro-exp-02-05` | 极速响应，超高准确度，免费额度充裕 | [Google AI Studio](https://aistudio.google.com) |
| **阿里通义千问 (Qwen)** | `qwen-plus` / `qwen-max` / `qwen2.5-72b-instruct` | 阿里云百炼大模型矩阵，中文学术表达极佳 | [阿里云百炼平台](https://bailian.console.aliyun.com) |
| **智谱 GLM** | `glm-4-plus` / `glm-4-air` / `glm-zero-preview` | 清华学术底蕴，学术文献专业术语翻译精准 | [智谱开放平台](https://open.bigmodel.cn) |
| **OpenAI** | `gpt-4o` / `gpt-4o-mini` / `o3-mini` | 国际通用工业级标准基准模型 | [OpenAI Platform](https://platform.openai.com) |
| **小米 MiMo / MiniMax** | `mimo-v1` / `abab7-chat` / `MiniMax-Text-01` | 敏捷推理，端云协同高并发响应 | [小米开放平台](https://dev.mi.com) |
| **自定义第三方端点** | 任意兼容 OpenAI 协议模型 (如 OneAPI、自建 Ollama) | 灵活性高，支持企业内网、中转网关与本地部署私有大模型 | 自建或第三方供应商 |

---

## 📦 下载与安装

### 方式一：直接安装桌面客户端（推荐）
1. 前往本仓库的 [Releases 页面](https://github.com/lllsp686/translate/releases) 下载最新的 `PaperLens-1.0.0-arm64.dmg`（支持 Apple Silicon M1/M2/M3/M4 系列芯片）；
2. 双击打开 `.dmg` 镜像，将 **PaperLens** 拖入 **Applications (应用程序)** 文件夹；
3. 打开启动台中的 PaperLens 即可开始您的学术双语阅读！

---

## 💻 开发者本地构建与运行

### 📋 前置环境
- **操作系统**：macOS 12.0+ (Apple Silicon)
- **Node.js**：v18+ (推荐 Node.js v20 或 v22 LTS)
- **包管理器**：`pnpm` (推荐) 或 `npm`

### 1. 克隆源码与安装依赖
```bash
# 克隆仓库
git clone https://github.com/lllsp686/translate.git
cd translate

# 安装全部依赖
pnpm install
```

### 2. 启动开发环境
```bash
# 启动 Web 端热重载开发服务器
pnpm dev
```
浏览器访问 `http://localhost:5173` 即可预览调试前端交互。

### 3. 构建与打包 macOS 原生客户端
```bash
# 编译 TypeScript 与打包 Web 资源
pnpm build

# 编译 Electron 主进程与预加载脚本
pnpm build:electron

# 一键打包生成 macOS arm64 原生 DMG 安装镜像
pnpm build:dmg
```
打包输出路径位于：`release/PaperLens-1.0.0-arm64.dmg`。

---

## 📂 项目工程架构

```text
translate/
├── electron/                   # Electron 桌面端主进程
│   ├── main.cts                # 原生窗口生命周期、隐藏式标题栏、系统菜单与外部链接调度
│   └── preload.cts             # 安全上下文隔离与进程间通信桥接
├── src/
│   ├── components/             # 苹果原生设计风格组件库
│   │   ├── TitleBar.tsx        # 原生交通灯区域、PDF导入、三视口切换、联动滚动与导出菜单
│   │   ├── Sidebar.tsx         # 文献大纲目录、分类标签管理、文献切换与删除
│   │   ├── SplitReader.tsx     # 双栏对照分屏阅读、划词高亮、笔记边注与同步平滑滚动
│   │   ├── FigureViewer.tsx    # 2x Retina 原生高清插图查看器与双语图注对照
│   │   ├── SelectionPopover.tsx# 鼠标划词即时翻译浮窗与生词本快速收录
│   │   ├── AICopilotDrawer.tsx # 4D 论文学术速读卡片与全文流式深度问答抽屉
│   │   └── APISettingsModal.tsx# 多厂商 API Key 管理、语气选择、余额查询与用量统计
│   ├── services/               # 业务逻辑与数据驱动层
│   │   ├── apiService.ts       # 多模型聚合通信网关、LaTeX 公式双向隔离、余额与用量查询
│   │   ├── storageService.ts   # 原生 IndexedDB 本地持久化存储引擎 (PaperLensDB)
│   │   ├── exportService.ts    # 双语 Markdown 导出与独立 HTML (打印为 PDF) 生成引擎
│   │   └── documentParser.ts   # PDF.js 客户端 2x Retina 像素采样离线解析引擎
│   ├── types/                  # 强类型定义体系 (文档模型、批注高亮、余额用量、分类目录)
│   ├── App.tsx                 # 根控制器、全局状态调度与持久化还原
│   └── index.css               # Tailwind CSS 4 与 SF Pro 系统级原生质感样式
├── release/                    # 构建产物 (DMG 安装镜像与解包程序)
├── package.json                # 工程依赖与构建脚本命令
└── vite.config.ts              # Vite 8 超高速构建引擎配置
```

---

## 🔒 隐私与安全性保障

- **零服务端中转**：PaperLens 不设任何中间数据搜集服务器，所有的 PDF 解析均在您的 Mac 本地内存完成；
- **API 密钥本地物理隔离**：您的各厂商 API Key 仅保存在本地设备中，绝不上报云端，直接且仅在您与模型厂商之间进行端到端通信。

---

## 📄 开源许可证

本项目采用 [MIT License](LICENSE) 开源许可证，欢迎学术界与开发者共同参与交流与贡献！

---

<p align="center">
  Made with ❤️ for Researchers & Academics. If PaperLens helps your research, please give it a ⭐️!
</p>
