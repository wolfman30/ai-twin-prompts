function goBack() {
  const explicit = "{{ page.back_url | default: '' }}";
  if (explicit) { window.location.href = explicit; return; }

  const canvaBase = "https://www.canva.com/design/DAGtoI-rTGs/suzi8xtrpeit_xpwmzWJgw/view?utm_content=DAGtoI-rTGs&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=he24d1b06e2#";
  const pageNum = "{{ page.canva_page | default: '' }}";
  const deepCanva = pageNum ? canvaBase + pageNum : "{{ site.baseurl }}/";

  const ref = document.referrer || "";
  const isCanva = /(^https?:\/\/)?([^\/]+\.)?canva\.com(\/|$)/i.test(ref);

  if (!isCanva && ref && ref !== location.href && window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = deepCanva;
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