
    (function() {
        "use strict";
        var KEY = "epresso-theme";
        var MODES = ["light", "dark", "system"];

        function saved() {
            try {
                var s = localStorage.getItem(KEY);
                if (MODES.indexOf(s) !== -1) return s;
            } catch (e) {
            /* unavailable — fall through */ }
            return "system";
        }

        function effective(mode) {
            if (mode !== "system") return mode;
            return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
        }

        function showIcon(b, t) {
            var light = b.querySelector(".icon-light");
            var dark = b.querySelector(".icon-dark");
            if (light) light.style.display = t === "light" ? "block" : "none";
            if (dark) dark.style.display = t === "dark" ? "block" : "none";
        }

        function apply(mode) {
            var t = effective(mode);
            document.documentElement.setAttribute("data-theme", t);
            document.documentElement.setAttribute("data-theme-mode", mode);
            var label = mode === "system" ? "Theme: " + t + " (auto)" : "Theme: " + mode;
            var b = document.getElementById("theme-toggle");
            if (b) {
                b.setAttribute("aria-label", label);
                b.setAttribute("title", label);
                showIcon(b, t);
            }
        }
        apply(saved());
        var btn = document.getElementById("theme-toggle");
        if (btn) btn.addEventListener("click", function() {
            var cur = saved();
            var next = MODES[(MODES.indexOf(cur) + 1) % MODES.length];
            try {
                localStorage.setItem(KEY, next);
            } catch (e) {}
            apply(next);
        });
    })();

;

    (function() {
        "use strict";
        var so = document.getElementById("search-open");
        if (so) so.addEventListener("click", function() {
            var o = document.getElementById("search-overlay");
            if (o) o.classList.add("open");
            var i = document.getElementById("search-input");
            if (i) setTimeout(function() {
                i.focus();
            }, 0);
        });
    })();

;

    (function() {
        "use strict";
        if (window.__epressoSidebarHover) return;
        window.__epressoSidebarHover = true;
        var targets = "a, summary, .tree-head";
        Array.prototype.forEach.call(document.querySelectorAll(".sidebar nav"), function(nav) {
            var hover = nav.querySelector(".tree-hover");
            if (!hover) return;
            nav.classList.add("nav-slide");

            function move(el) {
                var navRect = nav.getBoundingClientRect();
                var elRect = el.getBoundingClientRect();
                hover.style.height = elRect.height + "px";
                hover.style.transform = "translateY(" + (elRect.top - navRect.top) + "px)";
                hover.classList.add("is-visible");
            }

            function hide() {
                hover.classList.remove("is-visible");
            }

            function highlight(event) {
                var el = event.target.closest ? event.target.closest(targets) : null;
                // Hub links live inside a summary/.tree-head row; use the row so
                // the hover highlight matches the active row highlight.
                if (el && el.tagName === "A") {
                    var row = el.closest("summary, .tree-head");
                    if (row) el = row;
                }
                // Never move the sliding highlight onto the active item; it
                // keeps its own (accent) highlight.
                if (el && el.classList.contains("active")) {
                    hide();
                    return;
                }
                if (el && nav.contains(el)) move(el);
                else hide();
            }
            nav.addEventListener("mouseover", highlight);
            nav.addEventListener("focusin", highlight);
            nav.addEventListener("mouseleave", hide);
            nav.addEventListener("focusout", hide);
        });
    })();

    (function() {
        "use strict";
        if (window.__epressoSidebarToggle) return;
        window.__epressoSidebarToggle = true;
        var sidebar = document.getElementById("sidebar-nav");
        var scrim = document.querySelector(".sidebar-scrim");
        if (!sidebar) return;

        function setOpen(open) {
            sidebar.classList.toggle("is-open", open);
            if (scrim) scrim.classList.toggle("is-open", open);
            var btn = document.getElementById("sidebar-toggle");
            if (btn) {
                btn.setAttribute("aria-expanded", open ? "true" : "false");
                btn.setAttribute("aria-label", open ? "Hide navigation" : "Show navigation");
            }
        }
        /* Delegated: the toggle lives in the ToC bar, which is rendered after
           this script. */
        document.addEventListener("click", function(e) {
            var btn = e.target.closest ? e.target.closest("#sidebar-toggle") : null;
            if (btn) setOpen(!sidebar.classList.contains("is-open"));
        });
        if (scrim) scrim.addEventListener("click", function() { setOpen(false); });
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape") setOpen(false);
        });
        sidebar.addEventListener("click", function(e) {
            var a = e.target.closest ? e.target.closest("a") : null;
            if (a && window.matchMedia("(max-width: 860px)").matches) setOpen(false);
        });
    })();

;

    (function() {
        "use strict";
        var copyIcon =
            '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>';
        var checkIcon =
            '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>';

        document.querySelectorAll("pre.highlight").forEach(function(pre) {
            var head = pre.querySelector(".code-head");
            var body = pre.querySelector(".code-body");
            if (!head || !body) return;
            var linesBtn = head.querySelector(".code-lines-btn");
            var copyBtn = head.querySelector(".code-copy");

            if (linesBtn) {
                linesBtn.addEventListener("click", function() {
                    var on = body.classList.toggle("no-numbers");
                    linesBtn.setAttribute("aria-pressed", String(!on));
                    linesBtn.setAttribute("aria-label", on ? "Show line numbers" : "Hide line numbers");
                    linesBtn.setAttribute("title", on ? "Show line numbers" : "Hide line numbers");
                });
            }

            body.addEventListener("click", function(e) {
                var line = e.target.closest(".code-line");
                if (line) line.classList.toggle("selected");
            });

            if (copyBtn) {
                copyBtn.addEventListener("click", function() {
                    var sel = body.querySelectorAll(".code-line.selected");
                    var text = sel.length ?
                    Array.prototype.map.call(sel, function(l) {
                        return l.innerText;
                    }).join("\n") :
                        body.innerText;
                    text = text.replace(/\n$/, "");
                    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
                        .then(function() {
                            copyBtn.innerHTML = checkIcon;
                            copyBtn.classList.add("copied");
                            copyBtn.setAttribute("aria-label", "Copied");
                            setTimeout(function() {
                                copyBtn.innerHTML = copyIcon;
                                copyBtn.classList.remove("copied");
                                copyBtn.setAttribute("aria-label", "Copy code");
                            }, 1600);
                        })
                        .catch(function() {});
                });
            }
        });
    })();

;

    (function() {
        "use strict";
        var overlay = document.getElementById("search-overlay");
        var input = document.getElementById("search-input");
        var results = document.getElementById("search-results");
        var index = null,
            loaded = false,
            allTerms = null;

        function esc(s) {
            return String(s == null ? "" : s).replace(/[&<>"']/g, function(c) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                } [c];
            });
        }

    // Results are injected at runtime, so they never get the scoped
    // data-epresso-* attribute at build time. Copy the container's scope
    // attribute(s) onto every element inside it so the scoped CSS matches.
        function scopeResults() {
            var els = results.querySelectorAll("*");
            for (var i = 0; i < els.length; i++) {
                var el = els[i];
                for (var j = 0; j < results.attributes.length; j++) {
                    var n = results.attributes[j].name;
                    if (n.indexOf("data-epresso-") === 0 && !el.hasAttribute(n)) {
                        el.setAttribute(n, results.attributes[j].value);
                    }
                }
            }
        }

        function tokenize(s) {
            return String(s || "").toLowerCase().match(/[^\W_]+/g) || [];
        }

        function load() {
            if (loaded) return Promise.resolve();
            loaded = true;
            return fetch((window.EPRESSO_BASE || "") + "/search-index.json")
                .then(function(r) {
                    return r.json();
                })
                .then(function(data) {
                    index = data;
                    allTerms = Object.keys(data.index || {});
                })
                .catch(function() {
                    index = null;
                });
        }

    /* Merge the precomputed per-term scores (BM-25 already applied at build
       time). Exact terms match directly; a term also matches index terms that
       start with it (prefix/partial search, e.g. "mark" → "markdown"). */
        function score(term, maxResults) {
            if (!index) return [];
            var toks = tokenize(term);
            var scores = {};
            for (var t = 0; t < toks.length; t++) {
                var tok = toks[t];
                var keys = index.index[tok] ? [tok] : [];
                if (!keys.length) {
                    for (var i = 0; i < allTerms.length; i++) {
                        if (allTerms[i].indexOf(tok) === 0) keys.push(allTerms[i]);
                    }
                }
                for (var m = 0; m < keys.length; m++) {
                    var posts = index.index[keys[m]];
                    for (var p = 0; p < posts.length; p++) {
                        scores[posts[p][0]] = (scores[posts[p][0]] || 0) + posts[p][1];
                    }
                }
            }
            return Object.keys(scores)
                .map(function(i) {
                    return {
                        idx: +i,
                        score: scores[i]
                    };
                })
                .sort(function(a, b) {
                    return b.score - a.score;
                })
                .slice(0, maxResults || 12);
        }

        function snippet(text, term) {
            var toks = tokenize(term),
                hit = -1,
                matched = "";
            for (var i = 0; i < toks.length; i++) {
                var p = text.toLowerCase().indexOf(toks[i]);
                if (p >= 0 && (hit < 0 || p < hit)) {
                    hit = p;
                    matched = toks[i];
                }
            }
            if (hit < 0) {
                var t = text.length > 140 ? text.slice(0, 140) + "…" : text;
                return esc(t);
            }
            var start = Math.max(0, hit - 60);
            var end = Math.min(text.length, hit + matched.length + 60);
            return (start > 0 ? "…" : "") + esc(text.slice(start, hit)) +
            "<mark>" + esc(text.slice(hit, hit + matched.length)) + "</mark>" +
            esc(text.slice(hit + matched.length, end)) + (end < text.length ? "…" : "");
        }

        var current = 0;

        function open() {
            if (!overlay) return;
            current = -1;
            overlay.classList.add("open");
            if (input) {
                input.value = "";
                input.focus();
            }
            if (results) {
                results.innerHTML = '<div class="hint">Type to search the docs…</div>';
                scopeResults();
            }
        }

        function close() {
            if (overlay) overlay.classList.remove("open");
        }

        function moveCurrent(delta) {
            var items = results ? results.querySelectorAll(".search-result") : [];
            if (!items.length) return;
            current = (current + delta + items.length) % items.length;
            items.forEach(function(a, i) {
                a.classList.toggle("active", i === current);
            });
            items[current].scrollIntoView({
                block: "nearest"
            });
        }

        function openCurrent(newTab) {
            var items = results ? results.querySelectorAll(".search-result") : [];
            if (!items.length) return;
            var a = items[current >= 0 ? current : 0];
            if (a) {
                var href = a.getAttribute("href");
                if (newTab) window.open(href, "_blank", "noopener");
                else window.location.href = href;
            }
        }

        function render(q) {
            current = -1;
            var term = q.trim();
            if (!term) {
                results.innerHTML = '<div class="hint">Type to search the docs…</div>';
                scopeResults();
                return;
            }
            if (!index) {
                results.innerHTML = '<div class="no-results">Search index unavailable.</div>';
                scopeResults();
                return;
            }
            var hits = score(term, 12);
            if (!hits.length) {
                results.innerHTML = '<div class="no-results">No results for “' + esc(term) + '”.</div>';
                scopeResults();
                return;
            }
            var html = "";
            hits.forEach(function(h) {
                var u = index.units[h.idx];
                var href = (window.EPRESSO_BASE || "") + u.url + (u.anchor ? "#" + u.anchor : "");
                html += '<a class="search-result" href="' + esc(href) + '">' +
                '<span class="sr-title">' + esc(u.title) + "</span>" +
                (u.section ? '<span class="sr-section">' + esc(u.section) + "</span>" : "") +
                '<span class="sr-snippet">' + snippet(u.text, term) + "</span>" +
                "</a>";
            });
            results.innerHTML = html;
            scopeResults();
            current = 0;
            var first = results.querySelector(".search-result");
            if (first) first.classList.add("active");
        }

        document.addEventListener("keydown", function(e) {
            var isOpen = overlay && overlay.classList.contains("open");
            var k = e.key;
            if ((e.metaKey || e.ctrlKey) && k.toLowerCase() === "k") {
                e.preventDefault();
                open();
                return;
            }
            if (!isOpen) return;
            var hasResults = results && results.querySelectorAll(".search-result").length > 0;
            if (k === "ArrowDown") {
                if (hasResults) {
                    e.preventDefault();
                    moveCurrent(1);
                }
            } else if (k === "ArrowUp") {
                if (hasResults) {
                    e.preventDefault();
                    moveCurrent(-1);
                }
            } else if (k === "Enter") {
                if (current >= 0) {
                    e.preventDefault();
                    openCurrent(e.ctrlKey || e.metaKey);
                } else if (hasResults) {
                    e.preventDefault();
                    moveCurrent(1);
                }
            } else if (k === "Escape") {
                if (input && input.value) {
                    input.value = "";
                    render("");
                } else close();
            }
        });
        if (overlay) overlay.addEventListener("click", function(e) {
            if (e.target === overlay) close();
        });
        if (results) {
            results.addEventListener("mouseover", function(e) {
                var t = e.target;
                var item = t && t.closest ? t.closest(".search-result") : null;
                if (!item) return;
                var items = results.querySelectorAll(".search-result");
                var idx = Array.prototype.indexOf.call(items, item);
                if (idx >= 0 && idx !== current) {
                    current = idx;
                    items.forEach(function(a, i) {
                        a.classList.toggle("active", i === current);
                    });
                }
            });
        }
        if (input) {
            input.addEventListener("input", function() {
                load().then(function() {
                    render(input.value);
                });
            });
        }
    })();

;

    (function() {
        "use strict";
        var lb = document.getElementById("lightbox");
        if (!lb) return;
        var img = lb.querySelector(".lightbox-img");
        var caption = lb.querySelector(".lightbox-caption");
        var closeBtn = lb.querySelector(".lightbox-close");
        var images = Array.prototype.slice.call(document.querySelectorAll(".prose img"));
        var current = -1;

        function open(i) {
            if (i < 0 || i >= images.length) return;
            current = i;
            var src = images[i];
            img.src = src.currentSrc || src.src;
            img.alt = src.alt || "";
            caption.textContent = src.alt || "";
            lb.classList.add("open");
            if (closeBtn) closeBtn.focus();
        }

        function close() {
            lb.classList.remove("open");
            img.src = "";
            current = -1;
        }

        function move(d) {
            if (current < 0 || !images.length) return;
            open((current + d + images.length) % images.length);
        }

        images.forEach(function(im, i) {
            im.addEventListener("click", function(e) {
                e.preventDefault();
                open(i);
            });
        });
        if (closeBtn) closeBtn.addEventListener("click", close);
        lb.addEventListener("click", function(e) {
            if (e.target === lb || e.target === img) close();
        });
        document.addEventListener("keydown", function(e) {
            if (!lb.classList.contains("open")) return;
            if (e.key === "Escape") close();
            else if (e.key === "ArrowLeft") move(-1);
            else if (e.key === "ArrowRight") move(1);
        });
    })();

;

    (function() {
        "use strict";
        if (window.__epressoTocSpy) return;
        window.__epressoTocSpy = true;
        var tocs = Array.prototype.slice.call(document.querySelectorAll(".toc"));
        var links = [];
        var seen = {};
        var headings = [];
        tocs.forEach(function(toc) {
            /* Progressive enhancement: hide the static per-item marker and let the
               shared indicator slide between active items instead. */
            toc.classList.add("toc--animated");
        });
        Array.prototype.forEach.call(document.querySelectorAll(".toc a"), function(a) {
            a.__tocTarget = a.getAttribute("href").slice(1);
            links.push(a);
            if (!seen[a.__tocTarget]) {
                seen[a.__tocTarget] = true;
                var el = document.getElementById(a.__tocTarget);
                if (el) headings.push(el);
            }
        });
        if (!links.length || !headings.length) return;

        function setActive(idx) {
            var target = idx >= 0 && idx < headings.length ? headings[idx].id : null;
            links.forEach(function(a) {
                a.classList.toggle("active", a.__tocTarget === target);
            });
            tocs.forEach(function(toc) {
                var active = toc.querySelector("a.active");
                var current = toc.querySelector(".toc-current");
                if (current) current.textContent = active ? active.textContent : "On this page";
                var indicator = toc.querySelector(".toc-indicator");
                var list = toc.querySelector("ul");
                if (!indicator || !list) return;
                if (!active) {
                    indicator.classList.remove("is-visible");
                    return;
                }
                var tocRect = toc.getBoundingClientRect();
                var listRect = list.getBoundingClientRect();
                var activeRect = active.getBoundingClientRect();
                /* Inset the marker vertically to match the static ::before
                   (4px top/bottom of the link box). */
                indicator.style.left = (listRect.left - tocRect.left) + "px";
                indicator.style.height = Math.max(activeRect.height - 8, 0) + "px";
                indicator.style.transform = "translateY(" + (activeRect.top - tocRect.top + 4) + "px)";
                indicator.classList.add("is-visible");
            });
        }

        function onScroll() {
            var offset = 90; /* sticky header + a little */
            var current = -1;
            headings.forEach(function(h, i) {
                if (h.getBoundingClientRect().top <= offset) current = i;
            });
            setActive(current);
            updateRing();
        }

        /* Reading-progress ring in the inline popover trigger. */
        var RING_C = 47.12388980384689;
        var ring = document.querySelector(".toc--inline .toc-ring-progress");
        var ringBar = document.querySelector(".toc--inline .toc-ring");

        function updateRing() {
            if (!ring) return;
            var art = document.querySelector("article.doc") || document.querySelector("main.content");
            if (!art) return;
            var r = art.getBoundingClientRect();
            var total = r.height - window.innerHeight;
            var p = total > 0 ? Math.min(Math.max(-r.top / total, 0), 1) : (r.top <= 0 ? 1 : 0);
            ring.style.strokeDashoffset = (RING_C * (1 - p)).toFixed(2);
            if (ringBar) ringBar.setAttribute("aria-valuenow", p.toFixed(3));
        }
        window.addEventListener("scroll", onScroll, {
            passive: true
        });
        onScroll();

        /* Collapse the inline popover after choosing a heading, or on an
           outside click. */
        document.addEventListener("click", function(e) {
            var a = e.target.closest ? e.target.closest(".toc--inline a") : null;
            if (a) {
                var d = a.closest("details");
                if (d) d.open = false;
                return;
            }
            Array.prototype.forEach.call(document.querySelectorAll(".toc--inline details[open]"), function(d) {
                if (!d.contains(e.target)) d.open = false;
            });
        });
    })();

;

    (function() {
        "use strict";
        if (window.__epressoNavToggle) return;
        window.__epressoNavToggle = true;
        var btn = document.getElementById("nav-toggle");
        var menu = document.getElementById("nav-menu");
        if (!btn || !menu) return;

        function setOpen(open) {
            menu.classList.toggle("is-open", open);
            btn.setAttribute("aria-expanded", open ? "true" : "false");
            btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        }
        btn.addEventListener("click", function() {
            setOpen(!menu.classList.contains("is-open"));
        });
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape") setOpen(false);
        });
        menu.addEventListener("click", function(e) {
            var a = e.target.closest ? e.target.closest("a") : null;
            if (a) setOpen(false);
        });
        document.addEventListener("click", function(e) {
            if (!menu.classList.contains("is-open")) return;
            if (e.target.closest && (e.target.closest("#nav-toggle") || e.target.closest("#nav-menu"))) return;
            setOpen(false);
        });
    })();
