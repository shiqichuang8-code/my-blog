/* =========================================================
   站点交互逻辑
   —— 主题切换 / 文章列表 / 搜索与筛选 / 阅读进度
   ========================================================= */

(function () {
  "use strict";

  var BLOG = window.BLOG || { posts: [] };
  var posts = Array.isArray(BLOG.posts) ? BLOG.posts : [];
  var root = document.documentElement;

  /* ---------------- 工具函数 ---------------- */

  function escapeHTML(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[ch];
    });
  }

  function formatDate(iso) {
    var parts = String(iso || "").split("-");
    if (parts.length !== 3) return iso || "";
    return (
      Number(parts[0]) + " 年 " + Number(parts[1]) + " 月 " + Number(parts[2]) + " 日"
    );
  }

  /* ---------------- 深浅色主题 ---------------- */

  var THEME_KEY = "moji-theme";
  var toggle = document.getElementById("themeToggle");

  function syncToggle(theme) {
    if (!toggle) return;
    var dark = theme === "dark";
    toggle.setAttribute("aria-label", dark ? "切换到浅色模式" : "切换到深色模式");
    toggle.setAttribute("title", dark ? "切换到浅色模式" : "切换到深色模式");
    toggle.setAttribute("aria-pressed", dark ? "true" : "false");
  }

  function setTheme(theme, persist) {
    root.dataset.theme = theme;
    syncToggle(theme);
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (err) {
        /* 隐私模式下无法持久化，忽略即可 */
      }
    }
  }

  syncToggle(root.dataset.theme);

  if (toggle) {
    toggle.addEventListener("click", function () {
      setTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });
  }

  // 用户没有手动选择过时，跟随系统变化
  if (window.matchMedia) {
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    var onSystemChange = function (event) {
      var saved = null;
      try {
        saved = localStorage.getItem(THEME_KEY);
      } catch (err) {
        saved = null;
      }
      if (!saved) setTheme(event.matches ? "dark" : "light", false);
    };
    if (media.addEventListener) media.addEventListener("change", onSystemChange);
    else if (media.addListener) media.addListener(onSystemChange);
  }

  /* ---------------- 头部滚动分隔线 ---------------- */

  var header = document.querySelector(".site-header");
  if (header) {
    var onScrollHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  /* ---------------- 入场动画 ---------------- */

  var observer = null;

  function observeReveal(elements) {
    if (!elements || !elements.length) return;

    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(elements, function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    if (!observer) {
      observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
      );
    }

    Array.prototype.forEach.call(elements, function (el, index) {
      el.style.transitionDelay = Math.min(index, 8) * 45 + "ms";
      observer.observe(el);
    });
  }

  /* ---------------- 首页：文章列表 ---------------- */

  var grid = document.getElementById("postList");

  if (grid) {
    var chipsBox = document.getElementById("tagFilters");
    var searchInput = document.getElementById("searchInput");
    var emptyState = document.getElementById("emptyState");
    var countEl = document.getElementById("resultCount");

    var activeTag = "全部";
    var keyword = "";

    var tags = ["全部"].concat(
      posts.reduce(function (acc, post) {
        (post.tags || []).forEach(function (tag) {
          if (acc.indexOf(tag) === -1) acc.push(tag);
        });
        return acc;
      }, [])
    );

    function cardHTML(post) {
      var tagsHTML = (post.tags || [])
        .map(function (tag) {
          return "<span>" + escapeHTML(tag) + "</span>";
        })
        .join("");

      return (
        '<a class="post-card" href="' +
        escapeHTML(post.href) +
        '">' +
        '<div class="post-card__meta">' +
        "<time datetime=\"" +
        escapeHTML(post.date) +
        '">' +
        formatDate(post.date) +
        "</time>" +
        '<span class="post-card__dot" aria-hidden="true"></span>' +
        "<span>" +
        escapeHTML(post.minutes || 5) +
        " 分钟阅读</span>" +
        "</div>" +
        '<h2 class="post-card__title">' +
        escapeHTML(post.title) +
        "</h2>" +
        '<p class="post-card__excerpt">' +
        escapeHTML(post.excerpt) +
        "</p>" +
        '<div class="post-card__tags">' +
        tagsHTML +
        "</div>" +
        "</a>"
      );
    }

    function matches(post) {
      var byTag =
        activeTag === "全部" || (post.tags || []).indexOf(activeTag) !== -1;
      if (!byTag) return false;
      if (!keyword) return true;

      var haystack = [post.title, post.excerpt, (post.tags || []).join(" ")]
        .join(" ")
        .toLowerCase();

      return haystack.indexOf(keyword) !== -1;
    }

    function render(animate) {
      var list = posts.filter(matches);

      grid.innerHTML = list
        .map(function (post) {
          var html = cardHTML(post);
          return animate ? html.replace("<a ", '<a data-reveal ') : html;
        })
        .join("");

      // 首次渲染才做入场动画，筛选后立即显示，避免闪烁
      if (animate) observeReveal(grid.children);

      if (emptyState) emptyState.hidden = list.length !== 0;

      if (countEl) {
        countEl.textContent = list.length
          ? "共 " + list.length + " 篇文章"
          : "";
      }
    }

    function renderChips() {
      if (!chipsBox) return;

      chipsBox.innerHTML = tags
        .map(function (tag) {
          return (
            '<button type="button" class="chip" data-tag="' +
            escapeHTML(tag) +
            '" aria-pressed="' +
            (tag === activeTag) +
            '">' +
            escapeHTML(tag) +
            "</button>"
          );
        })
        .join("");
    }

    if (chipsBox) {
      chipsBox.addEventListener("click", function (event) {
        var chip = event.target.closest(".chip");
        if (!chip) return;

        activeTag = chip.dataset.tag || "全部";
        Array.prototype.forEach.call(chipsBox.children, function (el) {
          el.setAttribute("aria-pressed", String(el === chip));
        });
        render(false);
      });
    }

    if (searchInput) {
      var timer = null;
      searchInput.addEventListener("input", function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          keyword = searchInput.value.trim().toLowerCase();
          render(false);
        }, 120);
      });
    }

    renderChips();
    render(true);
  }

  /* ---------------- 文章页 ---------------- */

  var isPostPage = document.body && document.body.dataset.page === "post";

  if (isPostPage) {
    var slug = document.body.dataset.slug;
    var base = document.body.dataset.root || "";

    var current = null;
    var currentIndex = -1;
    posts.forEach(function (post, index) {
      if (post.slug === slug) {
        current = post;
        currentIndex = index;
      }
    });

    // 阅读时长
    var readtimeEl = document.querySelector("[data-readtime]");
    if (readtimeEl && current) {
      readtimeEl.textContent = (current.minutes || 5) + " 分钟阅读";
    }

    // 标签
    var tagsEl = document.querySelector("[data-post-tags]");
    if (tagsEl && current) {
      tagsEl.innerHTML = (current.tags || [])
        .map(function (tag) {
          return "<span>" + escapeHTML(tag) + "</span>";
        })
        .join("");
    }

    // 上一篇 / 下一篇（按数组顺序：前面是较新的）
    var navEl = document.getElementById("postNav");
    if (navEl && currentIndex !== -1) {
      // 文章页在 posts/ 子目录下，链接需要去掉一层目录
      var hrefFor = function (post) {
        var href = String(post.href || "");
        return base === "../" ? href.replace(/^posts\//, "") : href;
      };

      var items = [];

      if (currentIndex > 0) {
        var newer = posts[currentIndex - 1];
        items.push(
          '<a class="post-nav__item" href="' +
            escapeHTML(hrefFor(newer)) +
            '">' +
            '<span class="post-nav__label">较新的一篇</span>' +
            '<span class="post-nav__title">' +
            escapeHTML(newer.title) +
            "</span>" +
            "</a>"
        );
      }

      if (currentIndex < posts.length - 1) {
        var older = posts[currentIndex + 1];
        items.push(
          '<a class="post-nav__item post-nav__item--next" href="' +
            escapeHTML(hrefFor(older)) +
            '">' +
            '<span class="post-nav__label">较早的一篇</span>' +
            '<span class="post-nav__title">' +
            escapeHTML(older.title) +
            "</span>" +
            "</a>"
        );
      }

      navEl.innerHTML = items.join("");
    }

    // 阅读进度
    var bar = document.getElementById("progressBar");
    if (bar) {
      var onProgress = function () {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        bar.style.width = (ratio * 100).toFixed(2) + "%";
      };
      onProgress();
      window.addEventListener("scroll", onProgress, { passive: true });
      window.addEventListener("resize", onProgress);
    }
  }

  /* ---------------- 年份 ---------------- */

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-year]"),
    function (el) {
      el.textContent = new Date().getFullYear();
    }
  );

  /* ---------------- 其余入场元素 ---------------- */

  observeReveal(document.querySelectorAll("[data-reveal]"));
})();
