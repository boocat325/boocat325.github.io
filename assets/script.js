// KINGMATE 落地页交互
(function () {
    "use strict";

    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 页脚年份
    document.getElementById("year").textContent = new Date().getFullYear();

    // 顶栏滚动阴影
    var topbar = document.getElementById("topbar");
    if (topbar) {
        var onScroll = function () {
            topbar.classList.toggle("is-scrolled", window.scrollY > 8);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    // 移动端菜单
    var navToggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("nav");
    if (navToggle && nav) {
        var setNav = function (open) {
            navToggle.setAttribute("aria-expanded", String(open));
            navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
            nav.classList.toggle("open", open);
        };

        navToggle.addEventListener("click", function () {
            setNav(navToggle.getAttribute("aria-expanded") !== "true");
        });

        // 点链接关闭
        nav.addEventListener("click", function (e) {
            if (e.target.closest("a")) setNav(false);
        });

        // 点外部关闭
        document.addEventListener("click", function (e) {
            if (!nav.contains(e.target) && !navToggle.contains(e.target)) setNav(false);
        });

        // Esc 关闭
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") setNav(false);
        });
    }

    // 设备判断（User-Agent）
    var isMobileDevice = function () {
        var ua = navigator.userAgent || "";

        if (navigator.userAgentData && typeof navigator.userAgentData.mobile === "boolean") {
            return navigator.userAgentData.mobile ||
                /iPad/i.test(ua) ||
                (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
        }

        return /Mobi|Android|iPhone|iPad|iPod|Windows Phone|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    };

    var WECHAT_ID = "15657866860";
    var QQ_NUMBER = "1057902189";
    var EMAIL = "114628789@qq.com";

    // 获取报价：电脑端弹窗，手机端直接拨号
    var quoteModal = document.getElementById("quote-modal");
    var quoteClose = document.getElementById("quote-modal-close");
    var quoteButtons = document.querySelectorAll("[data-quote]");

    var openQuote = function () {
        if (!quoteModal) return;
        quoteModal.hidden = false;
        document.body.classList.add("no-scroll");
        (quoteClose || quoteModal).focus();
    };

    var closeQuote = function () {
        if (!quoteModal) return;
        quoteModal.hidden = true;
        document.body.classList.remove("no-scroll");
    };

    quoteButtons.forEach(function (el) {
        el.addEventListener("click", function () {
            if (isMobileDevice()) {
                window.location.href = "tel:18668557635";
            } else {
                openQuote();
            }
        });
    });

    if (quoteModal) {
        quoteClose.addEventListener("click", closeQuote);
        quoteModal.addEventListener("click", function (e) {
            if (e.target && e.target.matches("[data-modal-close]")) closeQuote();
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !quoteModal.hidden) closeQuote();
        });
    }

    // 复制到剪贴板（微信/QQ 共用）
    var copyText = function (value, tipEl) {
        var markDone = function () {
            if (!tipEl) return;
            tipEl.textContent = "已复制";
            setTimeout(function () {
                tipEl.textContent = "点击复制";
            }, 1500);
        };
        var fallback = function () {
            var ta = document.createElement("textarea");
            ta.value = value;
            ta.setAttribute("readonly", "");
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand("copy");
            } catch (err) { /* 忽略 */ }
            document.body.removeChild(ta);
            markDone();
        };
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(value).then(markDone, fallback);
        } else {
            fallback();
        }
    };

    // 微信：点击复制
    document.querySelectorAll("[data-wechat]").forEach(function (el) {
        el.addEventListener("click", function (e) {
            e.preventDefault();
            copyText(WECHAT_ID, el.querySelector("[data-copy-tip]"));
        });
    });

    // QQ：点击复制（拉起在不同版本 QQ 上不可靠，统一走复制）
    document.querySelectorAll("[data-qq]").forEach(function (el) {
        el.addEventListener("click", function (e) {
            e.preventDefault();
            copyText(QQ_NUMBER, el.querySelector("[data-qq-tip]"));
        });
    });

    // 邮箱：点击复制 + 保留 mailto 拉起
    document.querySelectorAll("[data-email]").forEach(function (el) {
        el.addEventListener("click", function () {
            copyText(EMAIL, el.querySelector("[data-email-tip]"));
        });
    });

    // 数字滚动
    var statNums = document.querySelectorAll(".stat-num");
    var setFinal = function (el) {
        el.textContent = el.getAttribute("data-count") || el.textContent;
    };

    if (prefersReduced || !("IntersectionObserver" in window)) {
        statNums.forEach(setFinal);
    } else {
        var countIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                countIO.unobserve(el);

                var target = parseInt(el.getAttribute("data-count"), 10) || 0;
                var start = null;
                var duration = 1100;

                var tick = function (ts) {
                    if (start === null) start = ts;
                    var p = Math.min((ts - start) / duration, 1);
                    var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
                    el.textContent = Math.round(target * eased);
                    if (p < 1) {
                        requestAnimationFrame(tick);
                    }
                };

                requestAnimationFrame(tick);
            });
        }, { threshold: 0.5 });

        statNums.forEach(function (el) {
            countIO.observe(el);
        });
    }

    // 当前页导航高亮
    (function () {
        var path = window.location.pathname.split("/").pop() || "index.html";
        var map = { "index.html": "index", "about.html": "about", "services.html": "services", "fleet.html": "fleet", "contact.html": "contact" };
        var key = map[path];
        if (!key) return;
        document.querySelectorAll('a[data-nav]').forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("data-nav") === key);
        });
    })();

    // FAQ 手风琴
    document.querySelectorAll(".faq-item").forEach(function (item) {
        var q = item.querySelector(".faq-q");
        var a = item.querySelector(".faq-a");
        if (!q || !a) return;
        q.addEventListener("click", function () {
            var wasOpen = item.classList.contains("is-open");
            document.querySelectorAll(".faq-item.is-open").forEach(function (other) {
                if (other !== item) {
                    other.classList.remove("is-open");
                    var oa = other.querySelector(".faq-a");
                    if (oa) oa.style.maxHeight = "0";
                }
            });
            if (wasOpen) {
                item.classList.remove("is-open");
                a.style.maxHeight = "0";
            } else {
                item.classList.add("is-open");
                a.style.maxHeight = a.scrollHeight + "px";
            }
        });
    });
})();
