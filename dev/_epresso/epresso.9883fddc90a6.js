
    (function() {
        "use strict";
        if (window.__epressoNavToggle) return;
        window.__epressoNavToggle = true;
        var btn = document.getElementById("nav-toggle");
        var menu = document.getElementById("nav-menu");
        var scrim = document.querySelector(".nav-scrim");
        if (!btn || !menu) return;
        var mq = window.matchMedia("(max-width: 768px)");

        function setOpen(open) {
            menu.classList.toggle("is-open", open);
            if (scrim) scrim.classList.toggle("is-open", open);
            /* Keep closed off-canvas content out of the tab order. */
            menu.inert = mq.matches && !open;
            btn.setAttribute("aria-expanded", open ? "true" : "false");
            btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
            if (open && window.epressoPanelOpened) window.epressoPanelOpened("menu");
        }
        /* Only one overlay at a time (search / sidebar). */
        document.addEventListener("epresso:panel-open", function(e) {
            if (e.detail !== "menu") setOpen(false);
        });
        btn.addEventListener("click", function() {
            setOpen(!menu.classList.contains("is-open"));
        });
        if (scrim) scrim.addEventListener("click", function() { setOpen(false); });
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape") setOpen(false);
        });
        menu.addEventListener("click", function(e) {
            var a = e.target.closest ? e.target.closest("a") : null;
            if (a) setOpen(false);
        });
        document.addEventListener("click", function(e) {
            if (!menu.classList.contains("is-open")) return;
            if (e.target.closest && (e.target.closest("#nav-toggle") || e.target.closest("#nav-menu") || e.target.closest(".nav-scrim"))) return;
            setOpen(false);
        });

        function syncState() {
            if (!mq.matches && menu.classList.contains("is-open")) setOpen(false);
            menu.inert = mq.matches && !menu.classList.contains("is-open");
        }
        syncState();
        if (mq.addEventListener) mq.addEventListener("change", syncState);
    })();

;

    (function() {
        "use strict";

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
                            copyBtn.classList.add("copied");
                            copyBtn.setAttribute("aria-label", "Copied");
                            setTimeout(function() {
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
        if (window.__epressoSidebarToggle) return;
        window.__epressoSidebarToggle = true;
        var sidebar = document.getElementById("sidebar-nav");
        var scrim = document.querySelector(".sidebar-scrim");
        if (!sidebar) return;

        var mq = window.matchMedia("(max-width: 1024px)");
        var FOCUSABLE = 'a[href], button:not([disabled]), summary, input, [tabindex]:not([tabindex="-1"])';

        function setOpen(open) {
            sidebar.classList.toggle("is-open", open);
            if (scrim) scrim.classList.toggle("is-open", open);
            document.body.classList.toggle("nav-open", open);
            /* Keep closed off-canvas content out of the tab order. */
            sidebar.inert = mq.matches && !open;
            var triggers = document.querySelectorAll(".sidebar-toggle");
            Array.prototype.forEach.call(triggers, function(b) {
                b.setAttribute("aria-expanded", open ? "true" : "false");
                b.setAttribute("aria-label", open ? "Hide navigation" : "Show navigation");
            });
            if (open) {
                var first = sidebar.querySelector(FOCUSABLE);
                if (first) first.focus();
            } else if (triggers.length && sidebar.contains(document.activeElement)) {
                triggers[0].focus();
            }
            if (open && window.epressoPanelOpened) window.epressoPanelOpened("sidebar");
        }
        /* Only one overlay at a time (search / menu). */
        document.addEventListener("epresso:panel-open", function(e) {
            if (e.detail !== "sidebar") setOpen(false);
        });

        function syncState() {
            if (!mq.matches && sidebar.classList.contains("is-open")) setOpen(false);
            sidebar.inert = mq.matches && !sidebar.classList.contains("is-open");
        }
        syncState();
        if (mq.addEventListener) mq.addEventListener("change", syncState);
        /* Delegated: the toggle lives in the ToC bar, which is rendered after
           this script. */
        document.addEventListener("click", function(e) {
            var btn = e.target.closest ? e.target.closest(".sidebar-toggle") : null;
            if (btn) setOpen(!sidebar.classList.contains("is-open"));
        });
        if (scrim) scrim.addEventListener("click", function() { setOpen(false); });
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape") { setOpen(false); return; }
            /* Trap focus inside the open drawer. */
            if (e.key !== "Tab" || !sidebar.classList.contains("is-open")) return;
            var f = sidebar.querySelectorAll(FOCUSABLE);
            if (!f.length) return;
            var first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        });
        sidebar.addEventListener("click", function(e) {
            var a = e.target.closest ? e.target.closest("a") : null;
            if (a && mq.matches) setOpen(false);
        });
    })();

    /* Scroll fades (see `.sidebar nav` mask-image): publish how much of the
       tree is scrolled out of view at each edge, so the gradient stops can
       track it. Recomputed on scroll, resize, and section open/close. */
    (function() {
        "use strict";
        if (window.__epressoSidebarFade) return;
        window.__epressoSidebarFade = true;
        var fadeNav = document.querySelector(".sidebar nav");
        if (fadeNav) {
            var publishFades = function() {
                var max = Math.max(0, fadeNav.scrollHeight - fadeNav.clientHeight);
                var top = Math.min(Math.max(fadeNav.scrollTop, 0), max);
                fadeNav.style.setProperty("--scroll-area-overflow-y-start", top + "px");
                fadeNav.style.setProperty("--scroll-area-overflow-y-end", (max - top) + "px");
            };
            fadeNav.addEventListener("scroll", publishFades, {
                passive: true
            });
            window.addEventListener("resize", publishFades);
            document.addEventListener("toggle", publishFades, true); /* <details> open/close */
            publishFades();
        }
    })();

;

    (function() {
        "use strict";
        if (window.__epressoPageCopy) return;
        window.__epressoPageCopy = true;
        var btn = document.getElementById("page-copy");
        if (!btn) return;
        var timer;

        /* The page's markdown is a static sibling file (see the route builder
           in pages/[...slug].ep), so copying is just fetch + clipboard. No
           DOM-derived fallback: the fetch only fails where the page isn't
           being served, which the docs never promise. */
        function copyPage() {
            var md = btn.getAttribute("data-md");
            if (!md) return;
            fetch(md)
                .then(function(r) {
                    if (!r.ok) throw new Error(String(r.status));
                    return r.text();
                })
                .then(function(text) { return navigator.clipboard.writeText(text); })
                .then(function() {
                    btn.classList.add("is-done");
                    btn.setAttribute("aria-label", "Copied");
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        btn.classList.remove("is-done");
                        btn.setAttribute("aria-label", "Copy page");
                    }, 1600);
                })
                .catch(function() {
                    /* fetch or clipboard unavailable: leave the label as it is */
                });
        }

        btn.addEventListener("click", copyPage);

        var menu = document.getElementById("page-menu");
        var mdBtn = document.getElementById("page-copy-md");
        if (mdBtn) mdBtn.addEventListener("click", copyPage);
        /* Choosing anything closes the menu, the new-tab link included. */
        if (menu) {
            menu.addEventListener("click", function(e) {
                if (e.target.closest && e.target.closest("a, button")) menu.open = false;
            });
        }

        /* Close the menu on outside click or Escape (native <details> gives the
           open/close and keyboard behaviour for free). */
        if (!menu) return;
        document.addEventListener("click", function(e) {
            if (menu.open && !menu.contains(e.target)) menu.open = false;
        });
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape" && menu.open) {
                menu.open = false;
                var s = menu.querySelector("summary");
                if (s) s.focus();
            }
        });
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
        var PHRASE_BOOST = 1000; /* real BM-25 sums here run low single/double digits */
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
            /* BM-25 is bag-of-words: "components" + "are" scored independently
               can't outrank a unit that merely repeats "are" over one that
               actually contains "components are" as written. A literal phrase
               match is a much stronger signal, so it jumps to the front. */
            var phrase = term.trim().toLowerCase();
            if (toks.length > 1) {
                Object.keys(scores).forEach(function(i) {
                    var u = index.units[+i];
                    var hay = (u.title + " " + u.section + " " + u.text).toLowerCase();
                    if (hay.indexOf(phrase) !== -1) scores[i] += PHRASE_BOOST;
                });
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
            var lower = text.toLowerCase();
            var t = term.trim().toLowerCase();
            var hit = -1,
                len = 0;
            /* Prefer highlighting the whole phrase you typed — fall back to the
               earliest single token only when the phrase itself isn't there. */
            if (t) {
                var p = lower.indexOf(t);
                if (p >= 0) {
                    hit = p;
                    len = t.length;
                }
            }
            if (hit < 0) {
                var toks = tokenize(term);
                for (var i = 0; i < toks.length; i++) {
                    var p2 = lower.indexOf(toks[i]);
                    if (p2 >= 0 && (hit < 0 || p2 < hit)) {
                        hit = p2;
                        len = toks[i].length;
                    }
                }
            }
            if (hit < 0) {
                var t2 = text.length > 140 ? text.slice(0, 140) + "…" : text;
                return esc(t2);
            }
            var start = Math.max(0, hit - 60);
            var end = Math.min(text.length, hit + len + 60);
            return (start > 0 ? "…" : "") + esc(text.slice(start, hit)) +
            "<mark>" + esc(text.slice(hit, hit + len)) + "</mark>" +
            esc(text.slice(hit + len, end)) + (end < text.length ? "…" : "");
        }

        /* Unlike snippet() (one hit + surrounding context), a title is short
           and shown in full — mark every occurrence of the phrase, or of each
           token when the phrase itself isn't present. */
        function highlightAll(text, term) {
            var lower = text.toLowerCase();
            var ranges = [];

            function findAll(needle) {
                if (!needle) return;
                var from = 0,
                    p;
                while ((p = lower.indexOf(needle, from)) !== -1) {
                    ranges.push([p, p + needle.length]);
                    from = p + needle.length;
                }
            }
            findAll(term.trim().toLowerCase());
            if (!ranges.length) tokenize(term).forEach(findAll);
            if (!ranges.length) return esc(text);

            ranges.sort(function(a, b) {
                return a[0] - b[0];
            });
            var merged = [ranges[0]];
            ranges.slice(1).forEach(function(r) {
                var last = merged[merged.length - 1];
                if (r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
                else merged.push(r);
            });
            var out = "",
                cursor = 0;
            merged.forEach(function(r) {
                out += esc(text.slice(cursor, r[0])) + "<mark>" + esc(text.slice(r[0], r[1])) + "</mark>";
                cursor = r[1];
            });
            return out + esc(text.slice(cursor));
        }

        var current = 0;

        function open() {
            if (!overlay) return;
            /* Close any other overlay first (sidebar / menu). */
            if (window.epressoPanelOpened) window.epressoPanelOpened("search");
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
                // A page without a <title> falls back to its section, so a
                // result never starts with an empty heading line.
                var title = u.title || u.section;
                var section = u.title ? u.section : "";
                var head = title ? '<span class="sr-title">' + highlightAll(title, term) + "</span>" : "";
                // Location line: breadcrumb › on-page section, both in the same
                // dimmed style — whichever of the two is present.
                var crumbParts = [];
                if (u.crumb) crumbParts.push(esc(u.crumb));
                if (section) crumbParts.push('<span class="sr-section">' + esc(section) + "</span>");
                var crumb = crumbParts.length ? '<div class="sr-crumb">' + crumbParts.join(' <span class="sr-sep">&gt;</span> ') + "</div>" : "";
                html += '<a class="search-result" href="' + esc(href) + '">' + head + crumb +
                '<span class="sr-snippet">' + snippet(u.text, term) + "</span>" +
                "</a>";
            });
            results.innerHTML = html;
            scopeResults();
            current = 0;
            var first = results.querySelector(".search-result");
            if (first) first.classList.add("active");
        }

        /* Ctrl/⌘K is bound in ShortcutsOverlay.ep (the single owner of global
           shortcuts); it broadcasts "search". Everything below is the open
           dialog's own navigation. */
        document.addEventListener("epresso:shortcut", function(e) {
            if (e.detail === "search") open();
        });

        document.addEventListener("keydown", function(e) {
            var isOpen = overlay && overlay.classList.contains("open");
            var k = e.key;
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

        /* The header's search button opens this overlay: owned here so the panel
           can coordinate with the other overlays. */
        document.addEventListener("click", function(e) {
            var btn = e.target.closest ? e.target.closest("#search-open") : null;
            if (btn) open();
        });

        /* Only one overlay at a time. */
        document.addEventListener("epresso:panel-open", function(e) {
            if (e.detail !== "search") close();
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

        /* The heading whose section is under the header right now. Shared by
           the scroll-spy and the </> jump keys so both agree on "current". */
        function currentIndex() {
            var offset = 90; /* sticky header + a little */
            var idx = -1;
            headings.forEach(function(h, i) {
                if (h.getBoundingClientRect().top <= offset) idx = i;
            });
            /* A run of short trailing sections can be squeezed into less
               room than the 90px crossing test needs, so none of their
               headings ever reaches it — the page simply runs out of room
               to scroll them that far up. Once we've scrolled past the
               *midpoint* to the next heading, hand "current" to it anyway;
               repeat for a whole run of squeezed sections. */
            while (idx + 1 < headings.length) {
                var a = idx >= 0 ? headings[idx].getBoundingClientRect().top : -Infinity;
                var b = headings[idx + 1].getBoundingClientRect().top;
                if (offset < (a + b) / 2) break;
                idx += 1;
            }
            return idx;
        }

        function onScroll() {
            setActive(currentIndex());
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

        /* Comma/period jump to the previous / next heading, from wherever
           currentIndex() says we are — the same "current" the scroll-spy
           highlights. */
        function jump(delta) {
            var target = currentIndex() + delta;
            if (target < 0) target = 0;
            if (target > headings.length - 1) target = headings.length - 1;
            var el = headings[target];
            if (!el || !el.id) return;
            el.scrollIntoView({
                block: "start"
            });
            /* Keep the URL shareable without spamming history. */
            if (window.history && history.replaceState) history.replaceState(null, "", "#" + el.id);
        }

        /* Comma/period step through headings. The key binding itself lives in
           ShortcutsOverlay.ep, with the other global shortcuts. */
        document.addEventListener("epresso:shortcut", function(e) {
            if (e.detail === "section-prev") jump(-1);
            else if (e.detail === "section-next") jump(1);
        });

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
        if (window.__epressoShortcuts) return;
        window.__epressoShortcuts = true;
        var overlay = document.getElementById("shortcuts-overlay");
        if (!overlay) return;
        var panel = overlay.querySelector(".shortcuts-box");

        function isOpen() {
            return overlay.classList.contains("open");
        }

        /* Never steal the key while the user is typing (docs search box,
           a form, a contenteditable). */
        function isTyping(el) {
            if (!el) return false;
            var tag = el.tagName;
            return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable === true;
        }

        function open() {
            /* Close any other overlay first (search / sidebar / menu). */
            if (window.epressoPanelOpened) window.epressoPanelOpened("shortcuts");
            overlay.classList.add("open");
            overlay.focus();
        }

        function close() {
            overlay.classList.remove("open");
        }

        /* Every global binding lives here, so the modifier and "not while
           typing" rules exist once. Each entry broadcasts epresso:shortcut and
           the component that owns the action listens for its own name. Bare
           keys (?, [, ], ,, .) are ignored while typing; modified ones (Ctrl/⌘K)
           work anywhere, as they do in most editors. */
        /* Actions needing another component's state are broadcast (see the
           search overlay and the ToC); ones that are just "follow a link" are
           done here, off the hooks the pager exposes. */
        function follow(attr) {
            var link = document.querySelector("[" + attr + "]");
            var href = link && link.getAttribute("href");
            if (href) location.href = href;
        }

        var KEYS = [
            {code: "KeyK", mod: true, action: "search"},
            {code: "BracketLeft", run: function() { follow("data-pager-prev"); }},
            {code: "BracketRight", run: function() { follow("data-pager-next"); }},
            {code: "Comma", action: "section-prev"},
            {code: "Period", action: "section-next"}
        ];

        function fire(action) {
            document.dispatchEvent(new CustomEvent("epresso:shortcut", {detail: action}));
        }

        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape") {
                if (isOpen()) close();
                return;
            }
            var mod = e.ctrlKey || e.metaKey;
            /* "?" is Shift+/ on most layouts — e.key already accounts for it. */
            if (e.key === "?") {
                if (mod || e.altKey || isTyping(e.target)) return;
                e.preventDefault();
                if (isOpen()) close();
                else open();
                return;
            }
            for (var i = 0; i < KEYS.length; i++) {
                var k = KEYS[i];
                if (e.code !== k.code) continue;
                if (k.mod) {
                    if (!mod || e.altKey) continue;
                } else if (mod || e.altKey || isTyping(e.target)) {
                    continue;
                }
                e.preventDefault();
                if (k.run) k.run();
                else fire(k.action);
                return;
            }
        });

        overlay.addEventListener("click", function(e) {
            /* Click on the backdrop (not the panel) closes. */
            if (e.target === overlay) close();
        });

        var closeBtn = document.getElementById("shortcuts-close");
        if (closeBtn) closeBtn.addEventListener("click", close);

        /* Only one overlay at a time. */
        document.addEventListener("epresso:panel-open", function(e) {
            if (e.detail !== "shortcuts") close();
        });
    })();
