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

function focusTargetSection() {
  const sectionId = resolveTargetSectionId();
  if (!sectionId) return;

  const sectionEl = document.getElementById(sectionId);
  if (!sectionEl) return;

  requestAnimationFrame(() => {
    sectionEl.scrollIntoView({ behavior: "auto", block: "start" });
  });
}

function initTriggerWord() {
  const cfg = window.promptPageConfig || {};
  const trigger = cfg.triggerConfig || null;
  if (!trigger) return;

  const template = cfg.promptTemplate || "";
  const mainFieldId = cfg.mainFieldId || "content_main";
  const triggerId = trigger.id || "trigger-word-input";

  const input = document.getElementById(triggerId);
  const textarea = document.getElementById(mainFieldId);
  if (!input || !textarea || !template) return;

  const token = trigger.token || "(your-trigger-word)";
  const placeholder = trigger.placeholder || "give your trigger word";

  const applyValue = () => {
    const entry = input.value.trim();
    const replacement = entry || placeholder;
    const updated = template.split(token).join(replacement);
    textarea.value = updated;
  };

  input.addEventListener("input", applyValue);
  input._applyTriggerToPrompt = applyValue;
  input._targetPromptField = mainFieldId;

  applyValue();
}

function copyPromptWithTrigger(inputId, fieldId) {
  const cfg = window.promptPageConfig || {};
  const input = document.getElementById(inputId);
  if (!input) return;

  const mainFieldId = fieldId || input._targetPromptField || cfg.mainFieldId || "content_main";
  const textarea = document.getElementById(mainFieldId);

  const value = input.value.trim();
  if (!value) {
    showToast("Enter a trigger word first");
    input.focus();
    return;
  }

  if (value !== input.value) {
    input.value = value;
  }

  const template = cfg.promptTemplate || "";
  const trigger = cfg.triggerConfig || {};
  const token = trigger.token || "(your-trigger-word)";
  const placeholder = trigger.placeholder || "give your trigger word";

  let finalPrompt = "";
  if (template) {
    const replacement = value || placeholder;
    finalPrompt = template.split(token).join(replacement);
  } else if (textarea) {
    finalPrompt = textarea.value || "";
  }

  if (!finalPrompt.trim()) {
    showToast("Nothing to copy");
    return;
  }

  if (textarea && textarea.value !== finalPrompt) {
    textarea.value = finalPrompt;
  }

  copyTextContent(finalPrompt, "Prompt copied!");
}

document.addEventListener("DOMContentLoaded", () => {
  focusTargetSection();
  initTriggerWord();
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
  const t = document.getElementById('toast');
  if (!t) return;
  if (msg) t.textContent = msg;
  t.classList.add('show');
  clearTimeout(tid);
  tid = setTimeout(() => t.classList.remove('show'), 1200);
}
