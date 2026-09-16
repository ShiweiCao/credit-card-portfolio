# CardPortfolio

[English](README.md)

一个轻量级 React 应用，用于管理个人信用卡组合。你可以在一个以浏览器为中心的私密工作区中记录开卡日期、年费、产品转换、发卡行规则以及 Chase 5/24 状态。

**在线访问：** [shiweicao.github.io/credit-card-portfolio](https://shiweicao.github.io/credit-card-portfolio/)

## 功能介绍

- 管理活跃和已关闭的个人卡、商业卡。
- 跟踪年费、自定义年费续费日期、即将到期的年费及年度总额。
- 记录降级、升级和其他产品转换，同时保留原始账户时间线。
- 查看可视化账户时间线和按时间排序的产品转换记录。
- 查看 Chase 5/24 资格以及其他与发卡行相关的开卡规则提示。
- 按开卡日期、年费、下次年费到期日或发卡行搜索、筛选和排序卡片。
- 将卡片组合导入或导出为本地 JSON 文件。
- 使用私有 GitHub Gist 手动备份数据，并在其他浏览器中恢复。

## 数据与隐私

卡片组合数据默认保存在浏览器 localStorage 中，键名为 `credit_card_tracker_portfolio_v1`。应用本身没有后端，也不会主动将数据发送到服务器。

可选的云同步功能使用你的 GitHub Personal Access Token 创建或更新一个私有 Gist，备份文件名为 `credit_card_portfolio.json`。Token 和 Gist ID 只会保存在当前浏览器的 localStorage 中。请使用带有 `gist` 权限范围的 classic token，或拥有 Gists 读写权限的 fine-grained token。

## 本地开发

### 前置要求

- Node.js 18 或更高版本
- npm

### 安装与运行

```bash
git clone https://github.com/ShiweiCao/credit-card-portfolio.git
cd credit-card-portfolio
npm install
npm run dev
```

Vite 会在 `http://localhost:3000/credit-card-portfolio/` 启动本地开发服务器。

### 常用命令

```bash
# 启动开发服务器
npm run dev

# TypeScript 类型检查
npm run lint

# 构建生产版本，输出到 dist/
npm run build

# 在本地预览生产构建
npm run preview

# 删除生成的构建文件
npm run clean
```

## 技术栈

- React + TypeScript
- Vite
- Tailwind CSS
- Lucide 图标库
