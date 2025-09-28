function resolveTargetSectionId() {
  const cfg = window.promptPageConfig || {};
  const pageType = (cfg.type || "").toLowerCase();
  if (pageType !== "kling" && pageType !== "seedance") return null;

  const hash = (window.location.hash || "").replace(/^#/, "").toLowerCase();
  if (hash === "negative" || hash === "kling-negative" || hash === "seedance-negative") return "prompt-negative";

  const params = new URLSearchParams(window.location.search || "");
  const querySection = (
    params.get("section") ||
    params.get("prompt") ||
    params.get("target") ||
    params.get("focus") ||
    ""
  ).toLowerCase();
  if (querySection === "negative" || querySection === "kling-negative" || querySection === "seedance-negative") return "prompt-negative";

  const configSection = (cfg.defaultSection || cfg.focusSection || "").toLowerCase();
  if (configSection === "negative" || configSection === "kling-negative" || configSection === "seedance-negative") return "prompt-negative";

  return null;
}

function focusTargetSection() {
  const sectionId = resolveTargetSectionId();
  if (!sectionId) return;

  const sectionEl = document.getElementById(sectionId);
  if (!sectionEl) return;

  const margin = 32;

  requestAnimationFrame(() => {
    sectionEl.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" });
    requestAnimationFrame(() => {
      let rect = sectionEl.getBoundingClientRect();

      if (rect.top < margin) {
        window.scrollBy({ top: rect.top - margin, behavior: "auto" });
        rect = sectionEl.getBoundingClientRect();
      }

      const overflowBottom = rect.bottom - (window.innerHeight - margin);
      if (overflowBottom > 0) {
        window.scrollBy({ top: overflowBottom, behavior: "auto" });
      }
    });
  });
}

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);
}
function escapeRegex(str) {
  return (str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function setPromptDisplay(fieldId, text, highlightValue, cfg) {
  const display = document.getElementById(`${fieldId}__display`);
  if (!display) return;

  const pageType = (cfg && cfg.type ? String(cfg.type) : "").toLowerCase();
  const tokenClass = pageType === "seedance" ? "highlight-token seedance" : "highlight-token";

  let html = escapeHtml(text || "");
  const highlight = highlightValue || "";

  if (highlight) {
    const pattern = escapeRegex(highlight);
    if (pattern) {
      const highlightHtml = `<span class="${tokenClass}">${escapeHtml(highlight)}</span>`;
      html = html.replace(new RegExp(pattern, "g"), highlightHtml);
    }
  }

  display.innerHTML = html;
}

function initTriggerWord() {
  const cfg = window.promptPageConfig || {};
  const trigger = cfg.triggerConfig || null;
  const mainFieldId = cfg.mainFieldId || "content_main";
  const textarea = document.getElementById(mainFieldId);
  const baseTemplate = cfg.promptTemplate || (textarea ? textarea.value : "");

  if (textarea && !textarea.value) {
    textarea.value = baseTemplate;
  }

  if (!trigger) {
    setPromptDisplay(mainFieldId, textarea ? textarea.value : baseTemplate, null, cfg);
    return;
  }

  const triggerId = trigger.id || "trigger-word-input";
  const input = document.getElementById(triggerId);
  if (!input) {
    setPromptDisplay(mainFieldId, textarea ? textarea.value : baseTemplate, null, cfg);
    return;
  }

  const placeholder = trigger.placeholder || "give your trigger word";
  const defaultValue = trigger.defaultValue || trigger.default || placeholder;
  const token = trigger.token || "(your-trigger-word)";

  const applyValue = () => {
    const entry = (input.value || "").trim();
    const replacement = entry || defaultValue;
    const source = input._triggerTemplateBase || baseTemplate;
    const updated = source ? source.split(token).join(replacement) : replacement;
    if (textarea) textarea.value = updated;
    setPromptDisplay(mainFieldId, updated, replacement, cfg);
  };

  input.addEventListener("input", applyValue);
  input._applyTriggerToPrompt = applyValue;
  input._targetPromptField = mainFieldId;
  input._triggerDefault = defaultValue;
  input._triggerToken = token;
  input._triggerTemplateBase = baseTemplate;

  applyValue();
}
function copyPromptWithTrigger(inputId, fieldId) {
  const cfg = window.promptPageConfig || {};
  const input = document.getElementById(inputId);
  if (!input) return;

  const mainFieldId = fieldId || input._targetPromptField || cfg.mainFieldId || "content_main";
  const textarea = document.getElementById(mainFieldId);
  const trigger = cfg.triggerConfig || {};

  const defaultValue = input._triggerDefault || trigger.defaultValue || trigger.default || trigger.placeholder || "give your trigger word";
  const token = input._triggerToken || trigger.token || "(your-trigger-word)";
  const baseTemplate = input._triggerTemplateBase || cfg.promptTemplate || (textarea ? textarea.value : "");

  let value = (input.value || "").trim();
  if (!value && defaultValue) value = defaultValue;

  if (!value) {
    showToast("Please provide a value first");
    input.focus();
    return;
  }

  if (value !== input.value) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  } else if (typeof input._applyTriggerToPrompt === "function") {
    input._applyTriggerToPrompt();
  }

  const updated = baseTemplate ? baseTemplate.split(token).join(value) : value;
  if (textarea) textarea.value = updated;
  setPromptDisplay(mainFieldId, updated, value, cfg);

  if (!updated.trim()) {
    showToast("Nothing to copy");
    return;
  }

  copyTextContent(updated, "Prompt copied!");
}

document.addEventListener("DOMContentLoaded", () => {
  focusTargetSection();
  initTriggerWord();
  initializeStaticDisplays();
});

function initializeStaticDisplays() {
  const cfg = window.promptPageConfig || {};
  const inputs = document.querySelectorAll('.content-input');
  inputs.forEach((ta) => {
    const id = ta.id;
    if (!id) return;
    const display = document.getElementById(`${id}__display`);
    if (!display) return;
    if (display.innerHTML && display.innerHTML.trim()) return;
    setPromptDisplay(id, ta.value || "", null, cfg);
  });
}
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

function copyTextContent(text, successMessage) {
  const msg = successMessage || "Copied!";
  if (!text) {
    showToast("Nothing to copy");
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(msg))
      .catch(() => fallbackCopyText(text, msg));
  } else {
    fallbackCopyText(text, msg);
  }
}

function fallbackCopyText(text, successMessage) {
  const ta = document.createElement("textarea");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  ta.value = text;
  document.body.appendChild(ta);
  ta.focus();
  ta.select();

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (_) {
    ok = false;
  }

  document.body.removeChild(ta);
  showToast(ok ? successMessage : "Copy failed");
}

function copyIt(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const text = (typeof el.value === "string") ? el.value : (el.textContent || "");
  copyTextContent(text, "Copied!");
}

let tid;
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  if (msg) t.textContent = msg;
  t.classList.add("show");
  clearTimeout(tid);
  tid = setTimeout(() => t.classList.remove("show"), 1200);
}

