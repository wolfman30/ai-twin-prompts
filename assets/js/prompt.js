function goBack() {
  const {body} = document;
  const explicit = body.dataset.backUrl || '';
  if (explicit) { window.location.href = explicit; return; }

  const ref = document.referrer;
  const isCanvaReferrer = ref && ref.includes('canva.com');
  
  // For non-Canva referrers, use history.back() if possible
  if (ref && ref !== location.href && !isCanvaReferrer) {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = ref;
    }
    return;
  }

  // For Canva referrers or no referrer, always use Canva deep link or base URL
  const canvaBase = "https://www.canva.com/design/DAGtoI-rTGs/suzi8xtrpeit_xpwmzWJgw/view?utm_content=DAGtoI-rTGs&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=he24d1b06e2#";
  const pageNum = body.dataset.canvaPage || '';
  const base = body.dataset.baseUrl || '';
  window.location.href = pageNum ? canvaBase + pageNum : base + '/';
}

async function copyIt(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const text = (typeof el.value === 'string') ? el.value : (el.textContent || '');
  if (!text) { showToast('Nothing to copy'); return; }

  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied!');
  } catch (e) {
    let ta = (el.tagName === 'TEXTAREA') ? el : null;
    if (!ta) {
      ta = document.createElement('textarea');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.value = text;
      document.body.appendChild(ta);
    }
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    if (ta !== el) document.body.removeChild(ta);
    showToast('Copied!');
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
