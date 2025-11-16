<script>
async function JoySproutsMain() {
  console.log("🌱 JoySproutsMain initialized");

  const TOTAL_JOYSPROUTS = 30;
  const MAIN_VIEW_URL = "/joysprouts/app/main";

  const badgeCheckpoints = [
    {
      percent: 25,
      badge: "25-percent-badge",
      img: "https://cdn.prod.website-files.com/659b1f7fc6ff554eb6b9358e/691287131ce73c89cb4a9d9f_js-badge-25.png",
      label: "25% Sprouted! You're on your way to blossoming."
    },
    {
      percent: 50,
      badge: "50-percent-badge",
      img: "https://cdn.prod.website-files.com/659b1f7fc6ff554eb6b9358e/69128713aa4c9c7bf3f3902c_js-badge-50.png",
      label: "50% Sprouted! You're in full bloom."
    },
    {
      percent: 75,
      badge: "75-percent-badge",
      img: "https://cdn.prod.website-files.com/659b1f7fc6ff554eb6b9358e/6912871338c06fec5f382db5_js-badge-75.png",
      label: "75% Sprouted! You're at the peak of your JoySprouts."
    },
    {
      percent: 100,
      badge: "100-percent-badge",
      img: "https://cdn.prod.website-files.com/659b1f7fc6ff554eb6b9358e/691287138c02734c46c37143_js-badge-100.png",
      label: "You've completed all your JoySprouts!"
    },
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
      background:rgba(0,0,0,0.75);
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
      max-width:420px;
      width:90%;
    }
    .joysprout-popup h2 {
      margin-bottom:0.5rem;
    }
    .joysprout-popup p {
      margin:0.25rem 0;
    }
    .joysprout-popup button {
      margin-top:1.2rem;
    }
    @keyframes fadeIn { to { opacity:1; } }
    @keyframes popIn {
      from { transform:scale(.9); opacity:0; }
      to { transform:scale(1); opacity:1; }
    }
  `;
  document.head.appendChild(style);

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
        reject(new Error("Timed out waiting for JoySprouts items"));
      }, timeout);
    });

  function getTodayLocalDate() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  /* ---------- Push to Memberstack (Custom Field + JSON) ---------- */
  async function pushJoySproutsToMemberstack(updated) {
    try {
      const { data: member } = await window.$memberstackDom.getCurrentMember();
      if (!member) return;

      // Update JSON layer (structured data)
      await window.$memberstackDom.updateMemberJSON({ json: updated });

      // Update custom fields (flat strings for Webflow / UI)
      await window.$memberstackDom.updateMember({
        fields: {
          "completed-joysprouts": (updated["completed-joysprouts"] || []).join(","),
          "streak-count": String(updated["streak-count"] || 0),
          "badges": (updated.badges || []).join(","),
        },
      });

      console.log("✅ Synced to Memberstack →", updated);
    } catch (err) {
      console.error("❌ Error syncing JoySprouts → Memberstack:", err);
    }
  }

  /* ---------- Completion Popup with Button + Redirect ---------- */
  function showCompletionPopup() {
    const overlay = document.createElement("div");
    overlay.classList.add("joysprout-overlay");

    overlay.innerHTML = `
      <div class="joysprout-popup">
        <h2>🌱 JoySprout Completed!</h2>
        <p>Great job growing your joy today!</p>
        <p style="font-size:0.9rem; opacity:0.75;">
          You’ll be taken back to your JoySprouts in a moment.
        </p>
        <button id="js-back-main"
          style="
            margin-top:18px;
            padding:10px 18px;
            background:#4FC61C;
            color:#fff;
            border-radius:999px;
            font-size:1rem;
            font-weight:600;
            cursor:pointer;
            border:none;
          ">
          Back to Main View
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Manual: go now
    const backBtn = document.getElementById("js-back-main");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.location.href = MAIN_VIEW_URL;
      });
    } else {
      console.warn("⚠️ Back to Main button not found in popup DOM.");
    }

    // Auto redirect after 3.5s
    setTimeout(() => {
      window.location.href = MAIN_VIEW_URL;
    }, 3500);
  }

  /* ---------- Season Complete View (if everything is done) ---------- */
  function showSeasonCompleteView() {
    const wrapper = document.querySelector(".joysprouts-wrapper");
    const list = document.querySelector("[data-joysprouts-list]");

    if (wrapper) wrapper.style.display = "none";
    if (list) list.innerHTML = "";

    const container = list || document.body;
    const block = document.createElement("div");
    block.classList.add("joysprouts-countdown");
    block.innerHTML = `
      <h2>🌱 You've completed this season of JoySprouts!</h2>
      <p>Keep an eye out for updates on the next season and more exciting content.</p>
      <p>Be sure to subscribe to our newsletter and follow us on social.</p>
      <p style="margin-top:0.5rem; font-weight:600;">
        Bonus: You're now eligible to win a free coaching session from Lindy LaDow!
      </p>
      <div style="margin-top:1.5rem;">
        <!-- Lottie placeholder -->
        <div id="js-lottie-placeholder"
             style="width:220px;height:220px;background:#f3f3f3;border-radius:16px;"></div>
      </div>
      <button style="
        margin-top:1.5rem;
        padding:10px 18px;
        background:#1DA1F2;
        color:#fff;
        border-radius:999px;
        font-size:0.95rem;
        font-weight:600;
        border:none;
        cursor:pointer;
      ">
        Share your progress
      </button>
    `;
    container.appendChild(block);

    // Simple confetti burst
    try {
      const confettiContainer = document.createElement("div");
      confettiContainer.style.position = "fixed";
      confettiContainer.style.inset = "0";
      confettiContainer.style.pointerEvents = "none";
      confettiContainer.style.zIndex = "10000";
      document.body.appendChild(confettiContainer);

      for (let i = 0; i < 80; i++) {
        const piece = document.createElement("div");
        piece.style.position = "absolute";
        piece.style.width = "6px";
        piece.style.height = "14px";
        piece.style.background = ["#4FC61C", "#FFCF33", "#FF6B6B", "#7C5CFF"][Math.floor(Math.random() * 4)];
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.top = "-20px";
        piece.style.opacity = "0.9";
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        piece.style.transition = "transform 1.4s ease-out, top 1.4s ease-out, opacity 1.4s ease-out";

        confettiContainer.appendChild(piece);

        requestAnimationFrame(() => {
          piece.style.top = "110vh";
          piece.style.transform += " translateY(100vh)";
          piece.style.opacity = "0";
        });
      }

      setTimeout(() => confettiContainer.remove(), 1800);
    } catch (e) {
      console.warn("Confetti failed gracefully:", e);
    }
  }

  /* ---------- Hide Completed JoySprouts & Handle 'All Done' ---------- */
  async function hideCompletedJoySprouts() {
    const { data: member } = await window.$memberstackDom.getCurrentMember();
    if (!member) return;

    const { data: memberData } = await window.$memberstackDom.getMemberJSON();
    const completed = (memberData?.["completed-joysprouts"] || []).map(String);

    const items = await waitForJoySproutsItems().catch(() => null);
    if (!items || !items.length) return;

    const container = items[0].parentElement;
    if (!container) return;

    let remaining = 0;

    items.forEach(item => {
      const id = item.getAttribute("data-joysprouts-id");
      if (completed.includes(id)) {
        item.remove();
      } else {
        remaining++;
      }
    });

    if (remaining === 0) {
      showSeasonCompleteView();
      return;
    }

    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fill, minmax(260px, 1fr))";
    container.style.gap = "1.5rem";
    container.style.alignItems = "start";
  }

  /* ---------- Complete Button ---------- */
  async function bindCompleteButton() {
    const btn = document.getElementById("complete-joysprouts-button");
    if (!btn) return;

    // Live gating: button disabled until all checkboxes are checked
    const card = btn.closest("[data-joysprouts-id]");
    const checks = card ? card.querySelectorAll('input[type="checkbox"]') : [];

    function evaluateChecks() {
      if (!checks.length) {
        btn.disabled = false;
        return;
      }
      const allChecked = [...checks].every(c => c.checked);
      btn.disabled = !allChecked;
    }

    checks.forEach(ch => ch.addEventListener("change", evaluateChecks));
    evaluateChecks();

    btn.addEventListener("click", async () => {
      try {
        // Safety: ensure all checks are done
        if (checks.length && ![...checks].every(c => c.checked)) {
          alert("Please complete all three checklist items before marking this JoySprout complete 🌱");
          return;
        }

        const { data: member } = await window.$memberstackDom.getCurrentMember();
        if (!member) {
          alert("Please log in first.");
          return;
        }

        const { data: memberData } = await window.$memberstackDom.getMemberJSON();
        const user = {
          "completed-joysprouts": memberData?.["completed-joysprouts"] || [],
          "last-completion-date": memberData?.["last-completion-date"] || null,
          "streak-count": memberData?.["streak-count"] || 0,
          badges: memberData?.badges || [],
        };

        const id = btn.getAttribute("data-joysprouts-id");
        if (!id) {
          console.warn("⚠️ No data-joysprouts-id on complete button.");
          return;
        }

        if (user["completed-joysprouts"].includes(String(id))) {
          alert("Already completed.");
          return;
        }

        user["completed-joysprouts"].push(String(id));

        const now = new Date();
        const todayStr = getTodayLocalDate();
        const lastDate = user["last-completion-date"]
          ? new Date(user["last-completion-date"])
          : null;

        let newStreak = 1;
        if (lastDate) {
          const lastLocal = new Date(
            lastDate.getFullYear(),
            lastDate.getMonth(),
            lastDate.getDate()
          );
          const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const diffDays = Math.round((todayLocal - lastLocal) / 86400000);
          newStreak = diffDays === 1 ? (user["streak-count"] || 0) + 1 : 1;
        }

        const pct = (user["completed-joysprouts"].length / TOTAL_JOYSPROUTS) * 100;
        const newBadges = [...user.badges];
        badgeCheckpoints.forEach(c => {
          if (pct >= c.percent && !newBadges.includes(c.badge)) {
            newBadges.push(c.badge);
            alert(`🎉 You earned the ${c.label}`);
          }
        });

        const updated = {
          "completed-joysprouts": user["completed-joysprouts"],
          "last-completion-date": todayStr,
          "streak-count": newStreak,
          badges: newBadges,
        };

        await pushJoySproutsToMemberstack(updated);

        // UI updates
        showCompletionPopup();
        btn.disabled = true;
        btn.textContent = "Completed";
        btn.classList.add("completed");

        await hideCompletedJoySprouts();
        await displayProfileStats();
      } catch (e) {
        console.error("❌ Error completing JoySprout:", e);
      }
    });
  }

  /* ---------- Profile Stats (with Grayed-Out Badge Display) ---------- */
  async function displayProfileStats() {
    const { data: member } = await window.$memberstackDom.getCurrentMember();
    if (!member) return;

    const { data } = await window.$memberstackDom.getMemberJSON();
    const completed = data?.["completed-joysprouts"]?.length || 0;
    const streak = data?.["streak-count"] || 0;
    const earnedBadges = data?.badges || [];

    const cEl = document.querySelector("[data-ms-member='completed-joysprouts']");
    const sEl = document.querySelector("[data-ms-member='streak-count']");
    const bEl = document.querySelector("[data-ms-member='badges']");

    if (cEl) cEl.textContent = completed;
    if (sEl) sEl.textContent = streak;

    if (bEl) {
      bEl.innerHTML = "";
      bEl.style.display = "flex";
      bEl.style.flexWrap = "wrap";
      bEl.style.gap = "12px";

      badgeCheckpoints.forEach(badge => {
        const img = document.createElement("img");
        img.src = badge.img;
        img.alt = badge.label;
        img.title = badge.label;
        img.style.width = "60px";
        img.style.height = "60px";
        img.style.objectFit = "contain";
        img.style.transition = "transform 0.3s ease, filter 0.3s ease";

        const earned = earnedBadges.includes(badge.badge);

        img.style.filter = earned ? "grayscale(0%)" : "grayscale(100%) opacity(0.5)";

        img.addEventListener("mouseenter", () => {
          if (earned) img.style.transform = "scale(1.15)";
        });
        img.addEventListener("mouseleave", () => {
          img.style.transform = "scale(1)";
        });

        bEl.appendChild(img);
      });
    }
  }

  /* ---------- Init ---------- */
  await hideCompletedJoySprouts();
  await bindCompleteButton();
  await displayProfileStats();
}

document.addEventListener("DOMContentLoaded", JoySproutsMain);
</script>