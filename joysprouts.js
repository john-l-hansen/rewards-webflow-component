<script>
async function JoySproutsMain() {
  console.log("JoySproutsMain initialized");

  const TOTAL_JOYSPROUTS = 30;
  const badgeCheckpoints = [
    { percent: 25, badge: "25-percent-badge", img: "https://cdn.prod.website-files.com/659b1f7fc6ff554eb6b9358e/690fb1606d763f89037ec684_badge-50.png", label: "25% Sprouted!" },
    { percent: 50, badge: "50-percent-badge", img: "https://cdn.prod.website-files.com/659b1f7fc6ff554eb6b9358e/690fb1606d763f89037ec684_badge-50.png", label: "Amazing! You've sprouted half your JoySprouts." },
    { percent: 75, badge: "75-percent-badge", img: "https://cdn.prod.website-files.com/659b1f7fc6ff554eb6b9358e/690fb1606d763f89037ec684_badge-50.png", label: "75% Sprouted!" },
    { percent: 100, badge: "100-percent-badge", img: "https://cdn.prod.website-files.com/659b1f7fc6ff554eb6b9358e/690fb1606d763f89037ec684_badge-50.png", label: "All JoySprouts Complete!" },
  ];

  /* ---------- Styles ---------- */
  const style = document.createElement("style");
  style.textContent = `
    .joysprouts-item {
      transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
      transform-origin: center center;
      position: relative;
      will-change: transform, opacity;
    }
    .joysprouts-item.removing {
      opacity: 0;
      transform: scale(0.9) translateY(25px);
      pointer-events: none;
      animation: dazzle 0.45s ease-in-out forwards;
    }
    .joysprouts-item.entering {
      animation: slideIn 0.6s ease-in-out forwards;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes dazzle {
      0% { box-shadow: 0 0 0 rgba(255,255,255,0); }
      40% { box-shadow: 0 0 30px rgba(255,255,200,0.9); }
      100% { box-shadow: 0 0 0 rgba(255,255,255,0); }
    }

    /* Achievement popup */
    .joysprout-badge-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0,0,0,0.6);
      z-index: 99999;
      animation: fadeIn .3s ease forwards;
    }
    .joysprout-badge-popup {
      background: #fff;
      border-radius: 20px;
      padding: 2rem 3rem;
      text-align: center;
      max-width: 360px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      animation: popIn 0.45s ease forwards;
    }
    .joysprout-badge-popup img {
      width: 100px;
      height: 100px;
      margin-bottom: 1rem;
    }
    .joysprout-badge-popup h3 {
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #333;
    }
    .joysprout-badge-popup p {
      color: #666;
      font-size: 1rem;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .joysprouts-countdown {
      text-align:center;
      margin:60px auto;
      font-size:1.25rem;
      font-weight:500;
      color:#333;
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:1.25rem;
    }

    .progress-ring { width:120px; height:120px; transform:rotate(-90deg); }
    .progress-ring circle {
      fill:none;
      stroke-width:8;
      stroke-linecap:round;
      transition:stroke-dashoffset .5s linear, stroke .5s linear;
    }
    .progress-ring__bg { stroke:#e7e7e7; }
    .progress-ring__fg { stroke:#4fc61c; }

    .joysprout-overlay {
      position:fixed;
      inset:0;
      background:rgba(0,0,0,0.5);
      display:flex;
      justify-content:center;
      align-items:center;
      z-index:9999;
      opacity:0;
      animation:fadeIn .3s forwards;
    }
    .joysprout-popup {
      background:#fff;
      padding:2rem 3rem;
      border-radius:16px;
      text-align:center;
      box-shadow:0 10px 30px rgba(0,0,0,0.2);
      animation:popIn .3s ease forwards;
    }
  `;
  document.head.appendChild(style);

  let countdownInterval = null;

  /* ---------- Helpers ---------- */
  const waitForJoySproutsItems = (timeout = 8000) =>
    new Promise((resolve, reject) => {
      const existing = document.querySelectorAll("[data-joysprouts-id]");
      if (existing.length) return resolve(existing);

      const observer = new MutationObserver(() => {
        const found = document.querySelectorAll("[data-joysprouts-id]");
        if (found.length) {
          observer.disconnect();
          resolve(found);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        const fallback = document.querySelectorAll("[data-joysprouts-id]");
        if (fallback.length) resolve(fallback);
        else reject(new Error("Timed out waiting for JoySprouts items"));
      }, timeout);
    });

  /* ---------- Popup for completion ---------- */
  function showCompletionPopup() {
    const overlay = document.createElement("div");
    overlay.classList.add("joysprout-overlay");
    overlay.innerHTML = `
      <div class="joysprout-popup">
        <h2 class="heading-style-h>🌱 JoySprout Blossomed</h2>
        <p class="text-size-large>Softly and surely, your joy is unfolding.</p>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 3000);
  }

  /* ---------- Badge Popup ---------- */
  function showBadgePopup(imgUrl, labelText) {
    const overlay = document.createElement("div");
    overlay.className = "joysprout-badge-overlay";
    overlay.innerHTML = `
      <div class="joysprout-badge-popup">
        <img src="${imgUrl}" alt="${labelText}">
        <h3>${labelText}</h3>
        <p>You've reached a new milestone in your JoySprout journey!</p>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 4000);
  }

  /* ---------- Hide Completed JoySprouts ---------- */
  async function hideCompletedJoySprouts() {
    try {
      const { data: member } = await window.$memberstackDom.getCurrentMember();
      if (!member) return;

      const { data: memberData } = await window.$memberstackDom.getMemberJSON();
      const completed = (memberData?.["completed-joysprouts"] || []).map(String);

      const items = await waitForJoySproutsItems();
      const container = items[0]?.parentElement;
      if (!container) return;

      const startRects = new Map();
      items.forEach(el => startRects.set(el, el.getBoundingClientRect()));

      const active = [], done = [];
      items.forEach(item => {
        const id = item.getAttribute("data-joysprouts-id");
        if (completed.includes(id)) done.push(item);
        else active.push(item);
      });

      done.forEach((item, i) => {
        item.classList.add("removing");
        item.style.pointerEvents = "none";
        setTimeout(() => {
          if (item.parentElement) item.remove();
        }, 550 + i * 40);
      });

      // // Smooth FLIP layout reflow
      // requestAnimationFrame(() => {
      //   const endRects = new Map();
      //   active.forEach(el => endRects.set(el, el.getBoundingClientRect()));
      //   active.forEach(el => {
      //     const first = startRects.get(el);
      //     const last = endRects.get(el);
      //     if (!first || !last) return;
      //     const dx = first.left - last.left;
      //     const dy = first.top - last.top;
      //     el.style.transform = `translate(${dx}px, ${dy}px)`;
      //     el.style.transition = "transform 0s";
      //     requestAnimationFrame(() => {
      //       el.style.transition = "transform 0.6s ease-in-out";
      //       el.style.transform = "";
      //     });
      //   });
      // });

      container.style.display = "grid";
      container.style.gridTemplateColumns = "repeat(auto-fill, minmax(260px, 1fr))";
      container.style.gap = "1.5rem";
      container.style.alignItems = "start";
    } catch (err) {
      console.error("❌ Error hiding completed JoySprouts:", err);
    }
  }

  /* ---------- Complete Button ---------- */
  async function bindCompleteButton() {
    const btn = document.getElementById("complete-joysprouts-button");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      try {
        const card = btn.closest("[data-joysprouts-id]");
        const checks = card ? card.querySelectorAll('input[type="checkbox"]') : [];
        if (checks.length) {
          const allChecked = [...checks].every(c => c.checked);
          if (!allChecked) {
            alert("Please complete all three checklist items before marking this JoySprout complete 🌱");
            return;
          }
        }

        const { data: member } = await window.$memberstackDom.getCurrentMember();
        if (!member) { alert("Please log in first."); return; }

        const { data: memberData } = await window.$memberstackDom.getMemberJSON();
        const user = {
          "completed-joysprouts": memberData?.["completed-joysprouts"] || [],
          "last-completion-date": memberData?.["last-completion-date"] || null,
          "last-completion-timestamp": memberData?.["last-completion-timestamp"] || null,
          "streak-count": memberData?.["streak-count"] || 0,
          badges: memberData?.badges || [],
        };

        const id = btn.getAttribute("data-joysprouts-id");
        const now = new Date();

        if (user["completed-joysprouts"].includes(String(id))) {
          alert("Already completed.");
          return;
        }

        user["completed-joysprouts"].push(String(id));

        const lastDate = user["last-completion-date"]
          ? new Date(user["last-completion-date"]) : null;
        const diffDays = lastDate ? Math.round((now - lastDate) / 86400000) : 0;
        const newStreak = diffDays === 1 ? user["streak-count"] + 1 : 1;

        const pct = (user["completed-joysprouts"].length / TOTAL_JOYSPROUTS) * 100;
        const newBadges = [...user.badges];
        badgeCheckpoints.forEach(c => {
          if (pct >= c.percent && !newBadges.includes(c.badge)) {
            newBadges.push(c.badge);
            showBadgePopup(c.img, c.label);
          }
        });

        const updated = {
          "completed-joysprouts": user["completed-joysprouts"],
          "last-completion-date": now.toISOString().split("T")[0],
          "last-completion-timestamp": now.toISOString(),
          "streak-count": newStreak,
          badges: newBadges,
        };

        await window.$memberstackDom.updateMemberJSON({ json: updated });
        console.log("✅ Member updated:", updated);

        await window.$memberstackDom.updateMember({
          "completed-joysprouts": updated["completed-joysprouts"],
          "last-completion-date": updated["last-completion-date"],
          "streak-count": updated["streak-count"],
        });
        

        showCompletionPopup();

        btn.disabled = true;
        btn.textContent = "Completed";
        btn.classList.add("completed");

        await hideCompletedJoySprouts();
        await displayProfileStats();

        setTimeout(() => showCountdownForNextAvailable(now), 3000);
      } catch (e) {
        console.error("❌ Error completing JoySprout:", e);
      }
    });
  }

  /* ---------- Countdown + Progress Ring ---------- */
  async function showCountdownForNextAvailable(lastCompletion) {
    const wrapper = document.querySelector(".joysprouts-wrapper");
    if (wrapper) wrapper.style.display = "none";

    const container = document.querySelector("[data-joysprouts-list]");
    if (!container) return;
    container.innerHTML = "";

    const msg = document.createElement("div");
    msg.classList.add("joysprouts-countdown");
    msg.innerHTML = `
      <svg class="progress-ring" viewBox="0 0 120 120">
        <circle class="progress-ring__bg" cx="60" cy="60" r="54"></circle>
        <circle class="progress-ring__fg" cx="60" cy="60" r="54"
          stroke-dasharray="${2 * Math.PI * 54}"
          stroke-dashoffset="${2 * Math.PI * 54}"></circle>
      </svg>
      <p>🌱 You've completed your JoySprout for today.<br>
      Come back in <span id="countdown-timer"></span> to sprout another!</p>
    `;
    container.appendChild(msg);

    const next = new Date(lastCompletion.getTime() + 24 * 60 * 60 * 1000);
    const circle = msg.querySelector(".progress-ring__fg");
    const radius = 54, circ = 2 * Math.PI * radius;

    function lerpColor(a, b, t) {
      const ah = parseInt(a.replace('#', ''), 16),
            ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff,
            bh = parseInt(b.replace('#', ''), 16),
            br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff,
            rr = ar + t * (br - ar),
            rg = ag + t * (bg - ag),
            rb = ab + t * (bb - ab);
      return `rgb(${rr|0},${rg|0},${rb|0})`;
    }

    function updateCountdown() {
      const diff = next - new Date();
      if (diff <= 0) { location.reload(); return; }
      const total = 24 * 60 * 60 * 1000;
      const progress = 1 - diff / total;
      circle.style.strokeDashoffset = circ * (1 - progress);
      circle.style.stroke = lerpColor("#E7E7E7", "#4FC61C", progress);
      const h = Math.floor(diff / 36e5),
            m = Math.floor((diff / 6e4) % 60),
            s = Math.floor((diff / 1000) % 60);
      document.getElementById("countdown-timer").textContent =
        `${h}h ${m}m ${s}s`;
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  /* ---------- Profile Stats ---------- */
  async function displayProfileStats() {
    const { data: member } = await window.$memberstackDom.getCurrentMember();
    if (!member) return;
    const { data: data } = await window.$memberstackDom.getMemberJSON();
    const c = data?.["completed-joysprouts"]?.length || 0;
    const d = data?.["last-completion-date"] || "—";
    const s = data?.["streak-count"] || 0;
    const cEl = document.querySelector("[data-ms-member='completed-joysprouts']");
    const dEl = document.querySelector("[data-ms-member='last-completion-date']");
    const sEl = document.querySelector("[data-ms-member='streak-count']");
    if (cEl) cEl.textContent = c;
    if (dEl) dEl.textContent = d;
    if (sEl) sEl.textContent = s;
  }

  /* ---------- Init ---------- */
  await hideCompletedJoySprouts();
  await bindCompleteButton();
  await displayProfileStats();
}
document.addEventListener("DOMContentLoaded", JoySproutsMain);
</script>