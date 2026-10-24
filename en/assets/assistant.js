/*
 * The assistant of a documentation site (boards 39-41): a button at the
 * bottom right, a panel to ask a question.
 *
 * Source: docs/assistant/; copied to docs/<site>/assets/ by
 * `make docs-build` (scripts/sync_docs_assistant.py). The site's
 * assets/assistant.json gives its texts, its color and, when the
 * administrator turned it on, the address of the Projecta API.
 *
 * - Without API: the answer is the passages of the site that match the
 *   question (its search index, search.json), with their links. Nothing
 *   leaves the browser.
 * - With API (POST /docs-assistant/ask): those passages and the question
 *   are sent; the model answers from them only. Secrets are masked first.
 */
(() => {
    const script = document.currentScript;
    if (!script || window.projectaDocsAssistant) return;
    window.projectaDocsAssistant = true;
    const ROOT = new URL("..", script.src);

    const MASK = "••••";
    const SECRETS = [
        [/(\b[A-Z0-9_]*(?:PASSWORD|PASSWD|PWD|SECRET|TOKEN|API_?KEY|ACCESS_?KEY|PRIVATE_?KEY)[A-Z0-9_]*\s*[=:]\s*)("[^"]*"|'[^']*'|\S+)/gi, (_, key) => key + MASK],
        [/(\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:)([^\s@]+)(@)/gi, (_, start, __, end) => start + MASK + end],
        [/\bsk-ant-[A-Za-z0-9_-]{10,}/g, () => MASK],
        [/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}/g, () => MASK],
        [/\bAKIA[0-9A-Z]{16}\b/g, () => MASK],
        [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, () => MASK],
        [/\bxox[abprs]-[A-Za-z0-9-]{10,}/g, () => MASK],
        [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, () => MASK],
    ];
    // Small words of a question, French and English (the user guide has both).
    const STOP = new Set(
        "a au aux avec ce ces cet cette comment d dans de des du elle elles en est et etre faire fait il ils je l la le les leur leurs lui ma me mes moi mon ne nous on ou par pas plus pour pourquoi quand que quel quelle qui quoi sa se ses si son sont sur ta te tes toi ton tu un une vos votre vous y peut puis faut dois doit veux voudrais comme ca cela an and are be can could do does from how i in into is it its my of or should the this to what when where which why will with would you your".split(" "),
    );
    /** The texts of the widget, in the language of the site (assistant.json › language). */
    const TEXTS = {
        fr: {
            send: "Envoyer",
            close: "Fermer",
            open: "Ouvrir l’assistant",
            closeAssistant: "Fermer l’assistant",
            masked: "Un secret collé a été masqué (••••) avant l’envoi. Ne collez jamais le fichier .env.",
            useful: "Utile ?",
            thanks: "Merci pour votre avis.",
            yes: "Oui",
            no: "Non",
            searching: "Je cherche dans le site…",
            nothing: "Je ne trouve rien sur cette question dans ce site. Essayez d’autres mots, ou la recherche en haut de la page.",
            found: (path) => `Ce que dit le site, dans **${path}** :`,
            fallback: (reason) => `Le site en parle ici (${reason}) :`,
            unavailable: (reason) => `Pas de réponse pour le moment : ${reason}`,
        },
        en: {
            send: "Send",
            close: "Close",
            open: "Open the assistant",
            closeAssistant: "Close the assistant",
            masked: "A pasted secret was masked (••••) before sending. Never paste the .env file.",
            useful: "Useful?",
            thanks: "Thank you for your feedback.",
            yes: "Yes",
            no: "No",
            searching: "Searching the site…",
            nothing: "I find nothing about this question in this site. Try other words, or the search at the top of the page.",
            found: (path) => `What the site says, in **${path}**:`,
            fallback: (reason) => `The site speaks of it here (${reason}):`,
            unavailable: (reason) => `No answer for now: ${reason}`,
        },
    };
    const ICONS = {
        bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>',
        close: '<path d="M6 6l12 12M18 6 6 18"/>',
        send: '<path d="M4 12 20 4l-4 16-4-7z"/><path d="m12 13 8-9"/>',
        book: '<path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2z"/><path d="M22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z"/>',
        up: '<path d="M7 10v11H4V10z"/><path d="M7 10l4-7a2 2 0 0 1 3 2l-1 5h6a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 17.6 21H7"/>',
        down: '<path d="M17 14V3h3v11z"/><path d="M17 14l-4 7a2 2 0 0 1-3-2l1-5H5a2 2 0 0 1-2-2.3l1.4-7A2 2 0 0 1 6.4 3H17"/>',
        lock: '<rect x="3" y="7" width="18" height="10" rx="5"/><path d="M7 12h.01M10 12h.01M13 12h.01M16 12h.01"/>',
    };

    // -- Helpers ------------------------------------------------------------

    function h(tag, props = {}, ...children) {
        const element = document.createElement(tag);
        for (const [key, value] of Object.entries(props)) {
            if (value == null || value === false) continue;
            if (key === "class") element.className = value;
            else if (key === "text") element.textContent = value;
            else if (key.startsWith("on")) element.addEventListener(key.slice(2).toLowerCase(), value);
            else element.setAttribute(key, value === true ? "" : String(value));
        }
        element.append(...children.filter((child) => child != null && child !== false));
        return element;
    }

    function icon(name, size = 18) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        for (const [key, value] of Object.entries({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" })) svg.setAttribute(key, value);
        svg.innerHTML = ICONS[name];
        return svg;
    }

    /** The question with its secrets replaced by ••••, and whether one was. */
    function maskSecrets(text) {
        let masked = text;
        for (const [pattern, replace] of SECRETS) masked = masked.replace(pattern, replace);
        return { text: masked, masked: masked !== text };
    }

    /** Words of a text: lower case, no accents, no small words, no plural. */
    function words(text) {
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter((word) => word.length > 1 && !STOP.has(word))
            // Plurals: règles, couches, examens → règle, couche, examen (columns → column).
            .map((word) => (word.length > 3 ? word.replace(/[sx]$/, "") : word));
    }

    /** The text of a passage: no diagram source, no drawing. */
    const plain = (html) => {
        const box = document.createElement("div");
        box.innerHTML = html;
        for (const element of box.querySelectorAll(".mermaid, svg, script, style")) element.remove();
        // A Mermaid diagram in the index is a plain <pre>: known by its first word.
        for (const element of box.querySelectorAll("pre")) {
            if (/^\s*(flowchart|graph|sequenceDiagram|classDiagram|erDiagram|stateDiagram(-v2)?|gantt|pie|journey|gitGraph|mindmap|timeline)\b/.test(element.textContent)) element.remove();
        }
        return (box.textContent || "").replace(/\s+/g, " ").trim();
    };

    // -- The search index of the site ----------------------------------------

    let index = null;

    async function loadIndex() {
        if (index) return index;
        const response = await fetch(new URL("search.json", ROOT));
        const data = await response.json();
        const documents = data.items.map((item) => {
            const text = plain(item.text);
            return {
                title: item.title,
                url: new URL(item.location, ROOT).href,
                path: [...(item.path || []), item.title].filter((part, at, all) => all.indexOf(part) === at).join(" › "),
                text,
                titleWords: words(`${item.title} ${(item.path || []).join(" ")}`),
                textWords: words(text),
            };
        });
        const frequency = new Map();
        for (const document of documents) for (const word of new Set([...document.titleWords, ...document.textWords])) frequency.set(word, (frequency.get(word) || 0) + 1);
        index = { documents, frequency };
        return index;
    }

    /** The passages that best match a question, best first. */
    function search({ documents, frequency }, question, count = 5) {
        const query = [...new Set(words(question))];
        if (!query.length) return [];
        const scored = documents.map((document) => {
            let score = 0;
            for (const word of query) {
                const weight = Math.log(1 + documents.length / (frequency.get(word) || 0.5));
                const inTitle = document.titleWords.filter((other) => other === word || (word.length > 4 && other.startsWith(word))).length;
                const inText = document.textWords.filter((other) => other === word || (word.length > 4 && other.startsWith(word))).length;
                score += weight * (inTitle * 4 + Math.min(inText, 6));
            }
            return { document, score };
        });
        return scored
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, count)
            .map((item) => item.document);
    }

    /** The sentences of a passage that hold words of the question, the rarer the better. */
    function excerpt(document, question, length = 320) {
        const query = new Set(words(question));
        const weight = (word) => Math.log(1 + (index?.documents.length ?? 1) / (index?.frequency.get(word) || 0.5));
        const sentences = document.text.split(/(?<=[.!?:;])\s+/);
        const best = sentences
            .map((sentence, at) => ({ at, hits: [...new Set(words(sentence))].filter((word) => query.has(word)).reduce((sum, word) => sum + weight(word), 0) }))
            .sort((a, b) => b.hits - a.hits || a.at - b.at)[0];
        const text = sentences.slice(best?.at ?? 0).join(" ");
        return text.length > length ? `${text.slice(0, length).replace(/\s\S*$/, "")}…` : text;
    }

    // -- Answers ----------------------------------------------------------------

    /** A little Markdown: paragraphs, lists, **bold**, `code`, ``` blocks, [n]. */
    function renderAnswer(markdown, sources) {
        const box = h("div", { class: "pda-answer-text" });
        const inline = (parent, text) => {
            for (const part of text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[\d\])/)) {
                if (/^\*\*[^*]+\*\*$/.test(part)) parent.append(h("strong", { text: part.slice(2, -2) }));
                else if (/^`[^`]+`$/.test(part)) parent.append(h("code", { text: part.slice(1, -1) }));
                else if (/^\[\d\]$/.test(part) && sources[Number(part.slice(1, -1)) - 1]) parent.append(h("a", { class: "pda-ref", href: sources[Number(part.slice(1, -1)) - 1].url, text: part }));
                else parent.append(part);
            }
        };
        const lines = markdown.split(/\r?\n/);
        let list = null;
        for (let at = 0; at < lines.length; at += 1) {
            const line = lines[at];
            if (line.startsWith("```")) {
                const code = [];
                for (at += 1; at < lines.length && !lines[at].startsWith("```"); at += 1) code.push(lines[at]);
                box.append(h("pre", { class: "pda-code" }, h("code", { text: code.join("\n") })));
                list = null;
                continue;
            }
            const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
            const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
            if (ordered || bullet) {
                const tag = ordered ? "ol" : "ul";
                if (!list || list.tagName.toLowerCase() !== tag) box.append((list = h(tag)));
                const item = h("li");
                inline(item, (ordered || bullet)[1]);
                list.append(item);
            } else if (line.trim()) {
                list = null;
                const paragraph = h("p", { class: /^sources\s*:/i.test(line.trim()) ? "pda-cited" : null });
                inline(paragraph, line.replace(/^#+\s*/, ""));
                box.append(paragraph);
            } else {
                list = null;
            }
        }
        return box;
    }

    // -- The widget ---------------------------------------------------------------

    async function start() {
        let config;
        try {
            config = await (await fetch(new URL("assets/assistant.json", ROOT))).json();
        } catch {
            return;
        }
        const T = TEXTS[config.language] ?? TEXTS.fr;
        const storageKey = `projecta-docs-assistant:${config.site}:${config.language || "fr"}`;
        const api = (config.api || "").replace(/\/$/, "");
        let remote = false;
        if (api) {
            try {
                remote = (await (await fetch(`${api}/docs-assistant`)).json()).available === true;
            } catch {
                remote = false;
            }
        }
        let history = [];
        try {
            history = JSON.parse(sessionStorage.getItem(storageKey) || "[]");
        } catch {
            history = [];
        }
        const save = () => {
            try {
                sessionStorage.setItem(storageKey, JSON.stringify(history.slice(-20)));
            } catch {
                // Private mode: the conversation stays on this page.
            }
        };

        document.documentElement.style.setProperty("--pda-color", config.color);
        const messages = h("div", { class: "pda-messages", role: "log", "aria-live": "polite" });
        const input = h("input", { class: "pda-input", placeholder: config.placeholder, "aria-label": config.placeholder, maxlength: "600", autocomplete: "off" });
        const send = h("button", { type: "submit", class: "pda-send", "aria-label": T.send }, icon("send"));
        const form = h("form", { class: "pda-form" }, input, send);
        const panel = h(
            "div",
            { class: "pda-panel", role: "dialog", "aria-labelledby": "pda-title", hidden: true },
            h(
                "div",
                { class: "pda-head" },
                h("span", { class: "pda-badge" }, icon("bot")),
                h("div", { class: "pda-head-text" }, h("strong", { id: "pda-title", text: config.title }), h("span", { text: config.subtitle })),
                h("button", { type: "button", class: "pda-close", "aria-label": T.close, onClick: () => toggle(false) }, icon("close")),
            ),
            messages,
            form,
            h("p", { class: "pda-privacy", text: remote ? config.privacy : config.privacyLocal }),
        );
        const button = h("button", { type: "button", class: "pda-fab", "aria-label": T.open, "aria-expanded": "false", onClick: () => toggle() }, icon("bot", 24));
        document.body.append(panel, button);

        function toggle(open = panel.hidden) {
            panel.hidden = !open;
            button.setAttribute("aria-expanded", String(open));
            button.setAttribute("aria-label", open ? T.closeAssistant : T.open);
            button.replaceChildren(icon(open ? "close" : "bot", open ? 22 : 24));
            if (open) {
                render();
                input.focus();
                loadIndex().catch(() => {});
            }
        }

        function bubbleOf(entry, at) {
            if (entry.role === "user") {
                return h(
                    "div",
                    { class: "pda-turn-user" },
                    h("div", { class: "pda-user", text: entry.text }),
                    entry.masked ? h("p", { class: "pda-masked" }, icon("lock", 16), h("span", { text: T.masked })) : null,
                );
            }
            const vote = async (useful) => {
                entry.vote = useful;
                save();
                render();
                if (remote && entry.id) fetch(`${api}/docs-assistant/feedback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: entry.id, useful }) }).catch(() => {});
            };
            return h(
                "div",
                { class: "pda-bot" },
                renderAnswer(entry.text, entry.sources || []),
                entry.sources?.length
                    ? h("div", { class: "pda-sources" }, ...entry.sources.map((source) => h("a", { class: "pda-source", href: source.url }, icon("book", 13), h("span", { text: source.path }))))
                    : null,
                entry.error
                    ? null
                    : h(
                          "div",
                          { class: "pda-vote" },
                          entry.vote == null ? h("span", { text: T.useful }) : h("span", { text: T.thanks }),
                          entry.vote == null ? h("button", { type: "button", "aria-label": T.yes, onClick: () => vote(true) }, icon("up", 14)) : null,
                          entry.vote == null ? h("button", { type: "button", "aria-label": T.no, onClick: () => vote(false) }, icon("down", 14)) : null,
                      ),
                at === history.length - 1 && entry.pending ? h("span", { class: "pda-pending", text: "…" }) : null,
            );
        }

        function render() {
            const suggestions = h(
                "div",
                { class: "pda-suggestions" },
                ...(config.suggestions || []).map((text) => h("button", { type: "button", class: "pda-suggestion", text, onClick: () => ask(text) })),
            );
            messages.replaceChildren(suggestions, ...history.map(bubbleOf));
            messages.scrollTop = messages.scrollHeight;
        }

        async function ask(raw) {
            const question = raw.trim();
            if (!question || send.disabled) return;
            const { text, masked } = maskSecrets(question);
            history.push({ role: "user", text, masked });
            const answer = { role: "bot", text: T.searching, sources: [], pending: true };
            history.push(answer);
            input.value = "";
            send.disabled = true;
            render();
            try {
                const passages = search(await loadIndex(), text);
                answer.sources = passages.slice(0, 3).map((passage) => ({ url: passage.url, path: passage.path }));
                if (!passages.length) {
                    answer.text = T.nothing;
                } else if (remote) {
                    const response = await fetch(`${api}/docs-assistant/ask`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ site: config.site, language: config.language || "fr", question: text, passages: passages.map((passage) => ({ title: passage.path.slice(0, 200), url: passage.url, text: passage.text.slice(0, 1800) })) }),
                    });
                    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).detail || `HTTP ${response.status}`);
                    const body = await response.json();
                    answer.text = body.answer;
                    answer.id = body.id;
                    answer.sources = passages.map((passage) => ({ url: passage.url, path: passage.path }));
                } else {
                    answer.text = `${T.found(passages[0].path)}\n\n${excerpt(passages[0], text)}`;
                }
            } catch (error) {
                // The model is off or busy: the passages found, at least.
                const passages = index ? search(index, text) : [];
                answer.text = passages.length ? `${T.fallback(error.message)}\n\n${excerpt(passages[0], text)}` : T.unavailable(error.message);
                answer.error = !passages.length;
            } finally {
                answer.pending = false;
                send.disabled = false;
                save();
                render();
            }
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            ask(input.value);
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !panel.hidden) toggle(false);
        });
    }

    // -- The language menu (the user guide: Français / English) -----------------
    // The same page in the other language (the two guides have the same
    // pages), and the choice remembered on this device.

    const LANGUAGE_KEY = "projecta-guide-language";

    function languageMenu() {
        const links = [...document.querySelectorAll("a.md-select__link[hreflang]")];
        if (!links.length) return;
        const page = location.href.startsWith(ROOT.href) ? location.href.slice(ROOT.href.length).split("#")[0] : "";
        const here = document.documentElement.lang?.slice(0, 2) || "fr";
        for (const link of links) {
            // The links of the menu are relative to the page.
            const target = new URL(link.getAttribute("href"), location.href);
            link.href = new URL(page, target).href;
            link.addEventListener("click", () => {
                try {
                    localStorage.setItem(LANGUAGE_KEY, link.hreflang);
                } catch {
                    // Not remembered.
                }
            });
        }
        let saved = null;
        try {
            saved = localStorage.getItem(LANGUAGE_KEY);
        } catch {
            saved = null;
        }
        const other = links.find((link) => link.hreflang === saved);
        if (saved && saved !== here && other && !sessionStorage.getItem(LANGUAGE_KEY)) {
            // Once per visit: the reader may still come back with the menu.
            sessionStorage.setItem(LANGUAGE_KEY, "1");
            location.replace(other.href + location.hash);
        }
    }

    const ready = () => {
        languageMenu();
        start();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
    else ready();
})();
