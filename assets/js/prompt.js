function resolveTargetSectionId() {
  const cfg = window.promptPageConfig || {};
  if ((cfg.type || "").toLowerCase() !== "kling") return null;

  const hash = (window.location.hash || "").replace(/^#/, "").toLowerCase();
  if (hash === "negative" || hash === "kling-negative") return "prompt-negative";

  const params = new URLSearchParams(window.location.search || "");
  const querySection = (
    params.get("section") ||
    params.get("prompt") ||
    params.get("target") ||
    params.get("focus") ||
    ""
  ).toLowerCase();
  if (querySection === "negative" || querySection === "kling-negative") return "prompt-negative";

  const configSection = (cfg.defaultSection || cfg.focusSection || "").toLowerCase();
  if (configSection === "negative" || configSection === "kling-negative") return "prompt-negative";

  return null;
}

document.addEventListener("DOMContentLoaded", () => {
  const sectionId = resolveTargetSectionId();
  if (!sectionId) return;

  const sectionEl = document.getElementById(sectionId);
  if (!sectionEl) return;

  requestAnimationFrame(() => {
    sectionEl.scrollIntoView({ behavior: "auto", block: "start" });
  });
});
function goBack() {
  const cfg = window.promptPageConfig || {};

  const explicit = cfg.backUrl || "";
  if (explicit) {
    window.location.href = explicit;
    return;
  }

  const canvaBase = "https://www.canva.com/design/DAGtoI-rTGs/suzi8xtrpeit_xpwmzWJgw/view?utm_content=DAGtoI-rTGs&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=he24d1b06e2#";
  const pageNum = cfg.canvaPage || "";
  const siteBase = cfg.siteBase || "/";

  const ref = document.referrer || "";
  const isCanva = /(^https?:\/\/)?([^\/]+\.)?canva\.com(\/|$)/i.test(ref);

  if (!isCanva && ref && ref !== location.href && window.history.length > 1) {
    window.history.back();
    return;
  }

  const fallback = pageNum ? canvaBase + pageNum : siteBase;
  window.location.href = fallback;
}

async function copyIt(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const text = (typeof el.value === "string") ? el.value : (el.textContent || "");
  if (!text) { showToast("Nothing to copy"); return; }

  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied!");
  } catch (e) {
    let ta = (el.tagName === "TEXTAREA") ? el : null;
    if (!ta) {
      ta = document.createElement("textarea");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      ta.value = text;
      document.body.appendChild(ta);
    }
    ta.focus();
    ta.select();
    try { document.execCommand("copy"); } catch(_) {}
    if (ta !== el) document.body.removeChild(ta);
    showToast("Copied!");
  }
}

let tid;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  if (msg) t.textContent = msg;
  t.classList.add('show');
  clearTimeout(tid);
  tid = setTimeout(() => t.classList.remove('show'), 1200);
}

