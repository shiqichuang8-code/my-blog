/* =========================================================
   博客内容配置
   改站点信息、加文章，只需要动这个文件
   ========================================================= */

window.BLOG = {
  title: "墨记",
  tagline: "关于代码、设计与生活的记录",
  author: "陈墨",
  intro: "一个安静的角落，存放那些值得被写下来的想法。",

  // 数组顺序即首页展示顺序：最新的放最前面
  posts: [
    {
      slug: "why-i-write",
      title: "为什么我又开始写博客了",
      date: "2026-10-12",
      excerpt:
        "不是为了让更多人看见，而是为了把散落在各处的想法收拢起来。写作是一种缓慢的整理术。",
      tags: ["随笔", "写作"],
      minutes: 5,
      href: "posts/why-i-write.html",
    },
    {
      slug: "build-a-quiet-blog",
      title: "用原生 HTML 和 CSS 搭一个安静的博客",
      date: "2026-09-28",
      excerpt:
        "没有框架、没有构建、没有依赖——只有几个文件和一点耐心。聊聊为什么「做减法」反而更难。",
      tags: ["前端", "技术"],
      minutes: 8,
      href: "posts/build-a-quiet-blog.html",
    },
    {
      slug: "on-focus",
      title: "关于专注：把注意力还给当下",
      date: "2026-09-05",
      excerpt:
        "我们不是没有时间，而是把时间切得太碎了。一次只做一件事，听起来简单，做起来像修行。",
      tags: ["思考", "生活"],
      minutes: 6,
      href: "posts/on-focus.html",
    },
  ],
};
