<script>
async function JoySproutsMain() {
  console.log("🌱 JoySproutsMain initialized — repaired core mode");

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
    }
  ];

  /* ----------------------------------------------------------
     Styles
  -----------------------------------------------------------*/
  const style = document.createElement("style");
  style.textContent = `
    .joysprouts-item {
      transition: opacity .35s ease, transform .35s ease;
    }

    .joysprout-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.75);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      opacity: 0;
      animation: fadeIn .3s forwards;
      padding: 1.25rem;
    }

    @keyframes fadeIn {
      to { opacity: 1; }
    }

    .joysprout-popup {
      background: #fff;
      padding: 2rem 2.25rem;
      border-radius: 16px;
      text-align: center;
      animation: popIn .28s ease forwards;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 22px 45px rgba(15,23,42,0.18);
    }

    @keyframes popIn {
      from { transform: scale(.94) translateY(6px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }

    .joysprouts-countdown {
      text-align: center;
      margin: 60px auto;
      max-width: 520px;
    }

    .joysprouts-countdown-timer {
      font-size: 2rem;
      margin-top: .75rem;
      letter-spacing: .08em;
      font-variant-numeric: tabular-nums;
    }

    .joysprouts-pill {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      padding: .45rem .9rem;
      border-radius: 999px;
      background: rgba(79,198,28,0.08);
      margin-bottom: .75rem;
      font-size: .85rem;
    }

    .joysprouts-reset-btn {
      margin-top: 1rem;
      padding: 10px 18px;
      background: #4FC61C;
      color: #fff;
      border: none;
      border-radius: 999px;
      font-weight: 600;
      cursor: pointer;
    }

    .joysprouts-reset-btn:hover {
      opacity: .92;
    }

    .js-shake {
      animation: jsShake .35s ease;
    }

    @keyframes jsShake {
      0% { transform: translateX(0); }
      20% { transform: translateX(-4px); }
      40% { transform: translateX(4px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
      100% { transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);

  /* ----------------------------------------------------------
     Helpers
  -----------------------------------------------------------*/
  const waitForJoySproutsItems = (timeout = 8000) =>
    new Promise(resolve => {
      const existing = document.querySelectorAll("[data-joysprouts-id]");
      if (existing.length) return resolve(existing);

      const obs = new MutationObserver(() => {
        const found = document.querySelectorAll("[data-joysprouts-id]");
        if (found.length) {
          obs.disconnect();
          resolve(found);
        }
      });

      obs.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        obs.disconnect();
        resolve([]);
      }, timeout);
    });

  const waitForChecks = (timeout = 8000) =>
    new Promise(resolve => {
      const existing = document.querySelectorAll(".js-joysprout-check");
      if (existing.length) return resolve(existing);

      const obs = new MutationObserver(() => {
        const found = document.querySelectorAll(".js-joysprout-check");
        if (found.length) {
          obs.disconnect();
          resolve(found);
        }
      });

      obs.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        obs.disconnect();
        resolve([]);
      }, timeout);
    });

  function getTodayLocalDate() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function getYesterdayLocalDate() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function getMsUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight - now;
  }

  function formatMsAsHHMMSS(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  }

  function parseMaybeArray(value) {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === "string" && value.trim()) {
      return value.split(",").map(v => v.trim()).filter(Boolean).map(String);
    }
    return [];
  }

  function normalizeMemberData(data = {}) {
    return {
      "completed-joysprouts": parseMaybeArray(data["completed-joysprouts"]),
      "last-completion-date": data["last-completion-date"] || null,
      "streak-count": Number(data["streak-count"] || 0),
      "longest-streak": Number(data["longest-streak"] || 0),
      "badges": parseMaybeArray(data["badges"]),
      "cycles-completed": Number(data["cycles-completed"] || 0),
      "lifetime-completions": Number(data["lifetime-completions"] || 0)
    };
  }

  async function getJoySproutsData() {
    const { data } = await window.$memberstackDom.getMemberJSON();
    return normalizeMemberData(data);
  }

  /* ----------------------------------------------------------
     Memberstack sync
  -----------------------------------------------------------*/
  async function pushJoySproutsToMemberstack(updated) {
    const safe = normalizeMemberData(updated);

    await window.$memberstackDom.updateMemberJSON({ json: safe });

    await window.$memberstackDom.updateMember({
      fields: {
        "completed-joysprouts": safe["completed-joysprouts"].join(","),
        "last-completion-date": safe["last-completion-date"] || "",
        "streak-count": String(safe["streak-count"]),
        "longest-streak": String(safe["longest-streak"]),
        "badges": safe["badges"].join(","),
        "cycles-completed": String(safe["cycles-completed"]),
        "lifetime-completions": String(safe["lifetime-completions"])
      }
    });

    console.log("✅ Memberstack sync OK:", safe);
  }

  /* ----------------------------------------------------------
     Fast badges
  -----------------------------------------------------------*/
  async function fastLoadBadges() {
    try {
      const data = await getJoySproutsData();
      const earned = data.badges || [];

      document.querySelectorAll(".js-badge-icon").forEach(icon => {
        const badgeId = icon.getAttribute("data-badge-id");
        const isEarned = earned.includes(badgeId);

        icon.style.filter = isEarned
          ? "grayscale(0%)"
          : "grayscale(100%) opacity(0.5)";

        icon.style.transition = "filter 0.25s ease, transform 0.25s ease";

        icon.onmouseenter = () => {
          if (isEarned) icon.style.transform = "scale(1.15)";
        };

        icon.onmouseleave = () => {
          icon.style.transform = "scale(1)";
        };
      });

      console.log("⚡ Fast badge rollout applied:", earned);
    } catch (e) {
      console.warn("⚠️ Fast badge load skipped:", e);
    }
  }

  await fastLoadBadges();

  /* ----------------------------------------------------------
     Popups
  -----------------------------------------------------------*/
  function showPopup({ title, body, buttonText = "Close", showButton = true }) {
    return new Promise(resolve => {
      const overlay = document.createElement("div");
      overlay.classList.add("joysprout-overlay");

      overlay.innerHTML = `
        <div class="joysprout-popup">
          <h2>${title}</h2>
          <div style="margin-top:.65rem; opacity:.82; line-height:1.55;">${body}</div>
          ${
            showButton
              ? `<button id="js-popup-close"
                  style="margin-top:18px;padding:10px 18px;background:#806555;color:#fff;border:none;border-radius:999px;font-weight:600;">
                  ${buttonText}
                </button>`
              : ""
          }
        </div>
      `;

      document.body.appendChild(overlay);

      if (showButton) {
        document.getElementById("js-popup-close").onclick = () => {
          overlay.remove();
          resolve(true);
        };
      } else {
        resolve({ overlay });
      }
    });
  }

  function showCompletionPopup() {
    const overlay = document.createElement("div");
    overlay.classList.add("joysprout-overlay");

    overlay.innerHTML = `
      <div class="joysprout-popup">
        <h2>🌱 JoySprout Completed!</h2>
        <p style="margin-top:.5rem;">Beautiful work growing your joy today.</p>
        <p style="opacity:.7; margin-top:.2rem;">Taking you back to the garden…</p>
        <button id="js-back-main"
          style="margin-top:18px;padding:10px 18px;background:#4FC61C;color:#fff;border:none;border-radius:999px;font-weight:600;">
          Back to Main View
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("js-back-main").onclick = () => {
      window.location.href = MAIN_VIEW_URL;
    };

    setTimeout(() => {
      window.location.href = MAIN_VIEW_URL;
    }, 2500);
  }

  async function showResetConfirmation() {
    return new Promise(resolve => {
      const overlay = document.createElement("div");
      overlay.classList.add("joysprout-overlay");

      overlay.innerHTML = `
        <div class="joysprout-popup">
          <h2>Begin a new cycle?</h2>
          <p style="margin-top:.75rem; opacity:.85; line-height:1.55;">
            This will clear your current 30-day progress and reset your current streak.
            Your badges, longest streak, lifetime completions, and completed cycles will stay.
          </p>
          <div style="margin-top:1.25rem; display:flex; gap:.75rem; justify-content:center; flex-wrap:wrap;">
            <button id="js-reset-cancel"
              style="padding:10px 18px;border-radius:999px;border:1px solid #ddd;background:#fff;">
              Cancel
            </button>
            <button id="js-reset-confirm"
              style="padding:10px 18px;background:#4FC61C;color:#fff;border:none;border-radius:999px;font-weight:600;">
              Begin New Cycle
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      document.getElementById("js-reset-cancel").onclick = () => {
        overlay.remove();
        resolve(false);
      };

      document.getElementById("js-reset-confirm").onclick = () => {
        overlay.remove();
        resolve(true);
      };
    });
  }

  /* ----------------------------------------------------------
     Views
  -----------------------------------------------------------*/
  function showCountdownUntilMidnight() {
    const wrapper = document.querySelector(".joysprouts-wrapper");
    const list = document.querySelector("[data-joysprouts-list]");

    if (list) list.innerHTML = "";
    if (wrapper) wrapper.style.display = "block";

    const box = document.createElement("div");
    box.classList.add("joysprouts-countdown");
    box.innerHTML = `
      <div class="joysprouts-pill">🌙 Daily JoySprout completed</div>
      <h2>Your next JoySprout unlocks at midnight.</h2>
      <p style="opacity:.85; margin-top:.5rem;">
        Your next card will be available once the new day begins.
      </p>
      <div class="joysprouts-countdown-timer" id="js-joysprouts-countdown-timer">--:--:--</div>
      <p style="margin-top:.5rem; font-size:.9rem; opacity:.7;">Based on your local time.</p>
    `;

    (list || document.body).appendChild(box);

    const timerEl = document.getElementById("js-joysprouts-countdown-timer");

    function update() {
      const ms = getMsUntilMidnight();
      timerEl.textContent = formatMsAsHHMMSS(ms);
      if (ms <= 0) location.reload();
    }

    update();
    setInterval(update, 1000);
  }

  function showSeasonCompleteView(data) {
    const wrapper = document.querySelector(".joysprouts-wrapper");
    const list = document.querySelector("[data-joysprouts-list]");

    if (list) list.innerHTML = "";
    if (wrapper) wrapper.style.display = "block";

    const box = document.createElement("div");
    box.classList.add("joysprouts-countdown");
    box.innerHTML = `
      <div class="joysprouts-pill">🎉 Season Complete</div>
      <h2>🌱 You’ve completed all 30 JoySprouts!</h2>
      <p style="margin-top:.5rem;">You’ve tended to your joy for an entire cycle. Beautiful work.</p>
      <p style="margin-top:.5rem; opacity:.75;">
        Cycles completed: <strong>${data["cycles-completed"]}</strong><br>
        Lifetime completions: <strong>${data["lifetime-completions"]}</strong>
      </p>
      <button id="reset-joysprouts-button" class="joysprouts-reset-btn">
        Begin a New 30-Day Cycle
      </button>
    `;

    (list || document.body).appendChild(box);

    for (let i = 0; i < 40; i++) {
      const piece = document.createElement("div");
      piece.style.position = "fixed";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.top = "-10px";
      piece.style.width = "6px";
      piece.style.height = "14px";
      piece.style.background = ["#4FC61C", "#FFCF33", "#FF6B6B", "#7C5CFF"][Math.floor(Math.random() * 4)];
      piece.style.opacity = "0.9";
      piece.style.transition = "top 1.4s ease-out, opacity 1.4s ease-out";
      piece.style.zIndex = "9998";
      document.body.appendChild(piece);

      requestAnimationFrame(() => {
        piece.style.top = "110vh";
        piece.style.opacity = "0";
      });

      setTimeout(() => piece.remove(), 1500);
    }
  }

  async function hideCompletedJoySprouts(completedIds) {
    const items = await waitForJoySproutsItems();
    if (!items.length) return 0;

    let remaining = 0;

    items.forEach(item => {
      const id = String(item.getAttribute("data-joysprouts-id") || "");
      const isDone = completedIds.includes(id);

      if (isDone) {
        item.style.display = "none";
      } else {
        remaining++;
        item.style.display = "";
      }
    });

    const container = items[0]?.parentElement;
    if (container) {
      container.style.display = "grid";
      container.style.gridTemplateColumns = "repeat(auto-fill, minmax(260px,1fr))";
      container.style.gap = "1.5rem";
    }

    return remaining;
  }

  /* ----------------------------------------------------------
     Main view logic
  -----------------------------------------------------------*/
  async function handleMainView() {
    const data = await getJoySproutsData();
    const completed = data["completed-joysprouts"];
    const totalCompleted = completed.length;
    const today = getTodayLocalDate();

    if (totalCompleted >= TOTAL_JOYSPROUTS) {
      showSeasonCompleteView(data);
      return;
    }

    await hideCompletedJoySprouts(completed);

    if (data["last-completion-date"] === today && totalCompleted > 0) {
      showCountdownUntilMidnight();
    }
  }

  /* ----------------------------------------------------------
     Completion button
  -----------------------------------------------------------*/
  async function bindCompleteButton() {
    const btn = document.getElementById("complete-joysprouts-button");
    if (!btn) return;

    const checks = await waitForChecks();

    function evaluate() {
      if (!checks.length) {
        btn.disabled = false;
        return;
      }
      const allChecked = [...checks].every(c => c.checked);
      btn.disabled = !allChecked;
    }

    checks.forEach(c => c.addEventListener("change", evaluate));
    evaluate();

    function shake() {
      btn.classList.add("js-shake");
      setTimeout(() => btn.classList.remove("js-shake"), 350);
    }

    btn.onclick = async () => {
      try {
        const allChecked = checks.length ? [...checks].every(c => c.checked) : true;

        if (!allChecked) {
          shake();
          await showPopup({
            title: "✨ Almost there",
            body: "Please complete all three steps — <strong>Read</strong>, <strong>Reflect</strong>, and <strong>Grow</strong> — before marking this JoySprout as complete.",
            buttonText: "Got it"
          });
          return;
        }

        const data = await getJoySproutsData();
        const today = getTodayLocalDate();
        const yesterday = getYesterdayLocalDate();
        const id = String(btn.getAttribute("data-joysprouts-id") || "");

        if (!id) return;

        if (data["completed-joysprouts"].includes(id)) {
          await showPopup({
            title: "Already completed",
            body: "This JoySprout is already in your completed garden.",
            buttonText: "Okay"
          });
          return;
        }

        if (data["last-completion-date"] === today) {
          await showPopup({
            title: "Today’s JoySprout is already complete",
            body: "You’ve already completed your JoySprout for today. Your next one unlocks at midnight.",
            buttonText: "Okay"
          });
          return;
        }

        const newCompleted = [...data["completed-joysprouts"], id];

        let newStreak = 1;
        if (data["last-completion-date"] === yesterday) {
          newStreak = data["streak-count"] + 1;
        }

        const newLongestStreak = Math.max(data["longest-streak"], newStreak);
        const newLifetimeCompletions = data["lifetime-completions"] + 1;

        const pct = (newCompleted.length / TOTAL_JOYSPROUTS) * 100;
        const earnedBadges = [...data["badges"]];
        const newlyEarnedLabels = [];

        badgeCheckpoints.forEach(checkpoint => {
          if (pct >= checkpoint.percent && !earnedBadges.includes(checkpoint.badge)) {
            earnedBadges.push(checkpoint.badge);
            newlyEarnedLabels.push(checkpoint.label);
          }
        });

        const updated = {
          ...data,
          "completed-joysprouts": newCompleted,
          "last-completion-date": today,
          "streak-count": newStreak,
          "longest-streak": newLongestStreak,
          "badges": earnedBadges,
          "cycles-completed": data["cycles-completed"],
          "lifetime-completions": newLifetimeCompletions
        };

        btn.disabled = true;
        btn.textContent = "Completing…";

        await pushJoySproutsToMemberstack(updated);
        await fastLoadBadges();

        if (newlyEarnedLabels.length) {
          await showPopup({
            title: "🎉 New badge earned",
            body: newlyEarnedLabels.join("<br>"),
            buttonText: "Continue"
          });
        }

        showCompletionPopup();
      } catch (e) {
        console.error("❌ Completion failed:", e);
        btn.disabled = false;
        btn.textContent = "Complete";
      }
    };
  }

  /* ----------------------------------------------------------
     Reset button
  -----------------------------------------------------------*/
  async function bindResetButton() {
    const resetBtn = document.getElementById("reset-joysprouts-button");
    if (!resetBtn) return;

    resetBtn.onclick = async () => {
      const confirmed = await showResetConfirmation();
      if (!confirmed) return;

      try {
        const data = await getJoySproutsData();

        const updated = {
          ...data,
          "completed-joysprouts": [],
          "last-completion-date": null,
          "streak-count": 0,
          "cycles-completed": data["cycles-completed"] + 1
        };

        resetBtn.disabled = true;
        resetBtn.textContent = "Resetting…";

        await pushJoySproutsToMemberstack(updated);
        window.location.href = MAIN_VIEW_URL;
      } catch (e) {
        console.error("❌ Reset failed:", e);
        resetBtn.disabled = false;
        resetBtn.textContent = "Begin a New 30-Day Cycle";
      }
    };
  }

  /* ----------------------------------------------------------
     Profile stats
  -----------------------------------------------------------*/
  async function displayProfileStats() {
    try {
      const data = await getJoySproutsData();

      const completedEl = document.querySelector("[data-ms-member='completed-joysprouts']");
      const streakEl = document.querySelector("[data-ms-member='streak-count']");
      const longestEl = document.querySelector("[data-ms-member='longest-streak']");
      const badgesEl = document.querySelector("[data-ms-member='badges']");
      const cyclesEl = document.querySelector("[data-ms-member='cycles-completed']");
      const lifetimeEl = document.querySelector("[data-ms-member='lifetime-completions']");

      if (completedEl) completedEl.textContent = data["completed-joysprouts"].length;
      if (streakEl) streakEl.textContent = data["streak-count"];
      if (longestEl) longestEl.textContent = data["longest-streak"];
      if (badgesEl) badgesEl.textContent = data["badges"].length;
      if (cyclesEl) cyclesEl.textContent = data["cycles-completed"];
      if (lifetimeEl) lifetimeEl.textContent = data["lifetime-completions"];
    } catch (e) {
      console.warn("⚠️ Profile stats unavailable:", e);
    }
  }

  /* ----------------------------------------------------------
     Init
  -----------------------------------------------------------*/
  const path = window.location.pathname;
  const isMainView =
    path === MAIN_VIEW_URL ||
    path.endsWith("/joysprouts/app/main") ||
    path.includes("/joysprouts/app/main");

  if (isMainView) {
    await handleMainView();
  }

  await bindCompleteButton();
  await bindResetButton();
  await displayProfileStats();
}

document.addEventListener("DOMContentLoaded", JoySproutsMain);
</script>