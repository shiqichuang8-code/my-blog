# 墨记 · 个人博客

一个零依赖的静态博客：原生 HTML + CSS + JavaScript，没有构建步骤，没有 npm 包，双击 `index.html` 就能看。

## 目录结构

```
.
├── index.html            首页（文章列表、标签筛选、搜索）
├── about.html            关于页
├── posts/                文章页，一篇一个 HTML 文件
│   ├── why-i-write.html
│   ├── build-a-quiet-blog.html
│   └── on-focus.html
├── assets/
│   ├── style.css         全站样式（含深浅色主题）
│   ├── blog.js           站点配置 + 文章元数据
│   └── app.js            列表渲染、筛选、搜索、主题、阅读进度
├── screenshots/          首页 / 文章页 / 关于页 / 手机端的预览截图
├── .nojekyll             GitHub Pages 用：跳过 Jekyll 处理
├── .gitignore            忽略本地临时文件
└── README.md
```

## 本地预览

**最简单**：直接双击 `index.html`，用浏览器打开。所有资源都是相对路径，`file://` 下可以正常工作。

**更接近线上**：在项目目录起一个静态服务器（`fetch`、绝对路径等行为与线上一致）：

```powershell
# 任选一种
python -m http.server 8080
npx serve .
```

然后访问 <http://localhost:8080>。

## 写一篇新文章

1. 复制任意一个 `posts/*.html`，重命名（例如 `posts/my-new-post.html`）。
2. 改掉文件里的四处内容：
   - `<title>` 和 `<meta name="description">`
   - `<body data-slug="...">` 里的 slug（要和下面第 3 步一致）
   - `<h1>` 标题、`<time>` 日期、导读段落
   - `<div class="prose">` 里的正文
3. 在 `assets/blog.js` 的 `posts` 数组**最前面**加一条记录：

```js
{
  slug: "my-new-post",                       // 与 data-slug 一致
  title: "我的新文章",
  date: "2026-11-20",                        // YYYY-MM-DD
  excerpt: "一句话摘要，会显示在首页卡片上。",
  tags: ["随笔"],
  minutes: 5,                                // 预计阅读时长
  href: "posts/my-new-post.html"
}
```

4. 刷新首页即可。标签筛选、搜索、上/下篇导航会自动更新。

> 正文支持的样式：`<h2>` `<h3>` `<p>` `<ul>` `<ol>` `<blockquote>` `<code>` `<pre><code>` `<a>` `<strong>` `<hr>` `<img>`，这些在 `style.css` 的 `.prose` 部分都有对应样式。

## 改成你自己的站点

| 想改什么 | 改哪里 |
| --- | --- |
| 站点名「墨记」、Logo 里的「墨」 | 所有 HTML 文件里的 `.brand__mark` / `.brand__name` |
| 作者名、个人介绍 | `about.html` |
| 首页大标题、副标题 | `index.html` 的 `.hero` 部分 |
| 导航里的 GitHub 链接 | 各页面的 `.nav` 和页脚 |
| 配色 | `assets/style.css` 顶部的 `:root` 与 `[data-theme="dark"]` 变量 |
| 主题存储键名 | `assets/*.js` 与各页面 `<head>` 中的 `moji-theme` |

批量改名可以用 PowerShell（在当前目录执行）：

```powershell
Get-ChildItem -Recurse -Include *.html | ForEach-Object {
  (Get-Content $_ -Raw -Encoding UTF8) -replace '墨记', '新站名' |
    Set-Content $_ -Encoding UTF8
}
```

## 部署到 GitHub Pages

本站没有构建步骤，`main` 分支根目录就是网站根目录。仓库里已经放好 `.nojekyll`（跳过 Jekyll 处理，避免奇怪的问题），所有链接都是**相对路径**，因此放在 `https://<用户名>.github.io/<仓库名>/` 这样的子路径下也能正常工作。

### 方式 A：网页拖拽上传（不用安装任何工具）

1. 打开 <https://github.com/new>，**Repository name** 填 `my-blog`（想用 `https://<用户名>.github.io` 这种根域名，就填 `<用户名>.github.io`），选 **Public**，不要勾选 "Add a README file"。
2. 创建后进入仓库，点 **Add file → Upload files**。
3. 把项目里的这些内容一起拖进去（**要带上 `posts/`、`assets/` 两个文件夹**，目录结构不能变）：

   ```
   index.html  about.html  README.md  .nojekyll
   posts/  assets/  screenshots/
   ```

4. 下方填一句说明，点 **Commit changes**。
5. 进入 **Settings → Pages**，**Source** 选 **Deploy from a branch**，**Branch** 选 `main`，目录选 **/ (root)**，点 **Save**。
6. 等 1～2 分钟刷新页面，顶部会显示网址：
   - 仓库名不是 `<用户名>.github.io` → `https://<用户名>.github.io/my-blog/`
   - 仓库名是 `<用户名>.github.io` → `https://<用户名>.github.io/`

以后改文章：在仓库里点开对应文件 → 右上角铅笔图标编辑 → Commit，改动一两分钟后自动生效。

### 方式 B：命令行（需要先装 Git）

本机目前没有 Git，可以先装：

```powershell
winget install --id Git.Git -e --source winget
```

装完**重开一个终端**，在项目目录执行：

```powershell
git init -b main
git add .
git commit -m "init: 博客第一版"
git remote add origin https://github.com/<你的用户名>/my-blog.git
git push -u origin main
```

首次推送会弹出浏览器让你登录 GitHub（Git Credential Manager），授权一次即可。之后每次发布只要：

```powershell
git add .
git commit -m "新增文章"
git push
```

推送完成后，同样去 **Settings → Pages** 打开 Pages（分支 `main` / 根目录）。`.gitignore` 已忽略本地预览用的临时目录。

### 常见问题

| 现象 | 原因与处理 |
| --- | --- |
| 打开是 404 | Pages 还没构建完，等 1～2 分钟；或分支/目录选错，要选 `main` + `/ (root)` |
| 页面没有样式 | `assets/` 没传上去，或没和 `index.html` 同级 |
| 文章点进去 404 | `posts/` 目录结构没保留，或文件名大小写不一致（Pages 区分大小写） |
| 改了没生效 | 浏览器缓存，`Ctrl + F5` 强制刷新；或等 Actions 里的部署任务跑完 |
| 想用自己的域名 | Settings → Pages → Custom domain 填域名，再去域名服务商加 CNAME 记录指向 `<用户名>.github.io` |

> 其它平台同理：Vercel / Netlify 导入仓库后构建命令留空、输出目录填 `.`；自己的服务器把整个文件夹拷到 Nginx / Apache 站点目录即可。

## 设计说明


- **配色**：暖白纸感底色 + 陶土色强调色，深色模式单独一套变量，通过 `<html data-theme>` 切换。
- **字体**：系统字体栈（Windows 上走「微软雅黑 / 苹方」），正文 1.075rem、行高 1.9，保证中文长文的阅读舒适度。
- **动效**：卡片悬停微抬升、滚动入场淡入、文章页顶部阅读进度条；全部尊重 `prefers-reduced-motion`。
- **无障碍**：语义化标签、可见焦点样式、按钮带 `aria-label` / `aria-pressed`，深浅色切换不影响对比度。

## 关于示例内容

三篇文章是为演示排版而写的示例文本，封面、摘要、日期都可以直接替换成你自己的内容。
