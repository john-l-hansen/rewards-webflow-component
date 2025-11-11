<script>
async function JoySproutsMain() {
  console.log("🌱 JoySproutsMain initialized");

  const TOTAL_JOYSPROUTS = 30;
  const badgeCheckpoints = [
    { percent: 25, badge: "25-percent-badge", label: "25% Sprouted! You're on your way to blossoming." },
    { percent: 50, badge: "50-percent-badge", label: "50% Sprouted! You're in full bloom." },
    { percent: 75, badge: "75-percent-badge", label: "75% Sprouted! You're at the peak of your JoySprouts." },
    { percent: 100, badge: "100-percent-badge", label: "You've completed all your JoySprouts!" },
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
    @keyframes dazzle {
      0% { box-shadow: 0 0 0 rgba(255,255,255,0); }
      40% { box-shadow: 0 0 30px rgba(255,255,200,0.9); }
      100% { box-shadow: 0 0 0 rgba(255,255,255,0); }
    }

    /* ----- Badge visuals ----- */
    .js-badge-icon {
      width: 70px;
      height: 70px;
      object-fit: contain;
      transition: filter 0.6s ease, opacity 0.6s ease, transform 0.3s ease;
      filter: grayscale(100%) brightness(0.6) contrast(0.8);
      opacity: 0.5;
    }
    .js-badge-icon.unlocked {
      filter: none;
      opacity: 1;
      animation: badgeGlow 0.8s ease-in-out;
    }
    .js-badge-icon.unlocked:hover {
      transform: scale(1.1);
    }
    @keyframes badgeGlow {
      0% { box-shadow: 0 0 0 rgba(255,255,255,0); }
      50% { box-shadow: 0 0 18px rgba(255,255,200,0.8); }
      100% { box-shadow: 0 0 0 rgba(255,255,255,0); }
    }

    .joysprout-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,1);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      opacity: 0;
      animation: fadeIn .3s forwards;
    }
    .joysprout-popup {
      background: #fff;
      padding: 2rem 3rem;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      animation: popIn .3s ease forwards;
    }
    @keyframes fadeIn { to { opacity: 1; } }
    @keyframes popIn { from { transform: scale(.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `;
  document.head.appendChild(style);

  /* ---------- Push to Memberstack (JSON + Custom Fields) ---------- */
  async function pushJoySproutsToMemberstack(updatedCompleted, badges, streakCount) {
    try {
      const { data: member } = await window.$memberstackDom.getCurrentMember();
      if (!member) return;

      const { data: memberData } = await window.$memberstackDom.getMemberJSON();
      const updated = {
        ...memberData,
        "completed-joysprouts": updatedCompleted,
        "badges": badges,
        "streak-count": streakCount,
      };

      await window.$memberstackDom.updateMemberJSON({ json: updated });
      await window.$memberstackDom.updateMember({
        fields: { 
          "completed-joysprouts": updatedCompleted.join(","),
          "streak-count": String(streakCount),
        },
      });

      console.log("✅ Synced to Memberstack →", updatedCompleted, badges, streakCount);
    } catch (err) {
      console.error("❌ Error syncing JoySprouts → Memberstack:", err);
    }
  }

  function showCompletionPopup() {
    const overlay = document.createElement("div");
    overlay.classList.add("joysprout-overlay");
    overlay.innerHTML = `
      <div class="joysprout-popup">
        <h2>🌱 JoySprout Completed!</h2>
        <p>Great job growing your joy today!</p>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 3000);
  }

  /* ---------- Hide Completed JoySprouts ---------- */
  async function hideCompletedJoySprouts() {
    try {
      const { data: memberData } = await window.$memberstackDom.getMemberJSON();
      const completed = (memberData?.["completed-joysprouts"] || []).map(String);
      const items = document.querySelectorAll("[data-joysprouts-id]");
      items.forEach(item => {
        const id = item.getAttribute("data-joysprouts-id");
        if (completed.includes(id)) {
          item.classList.add("removing");
          setTimeout(() => item.remove(), 500);
        }
      });
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
        if (checks.length && ![...checks].every(c => c.checked)) {
          alert("Please complete all three checklist items before marking this JoySprout complete 🌱");
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
        const now = new Date();
        if (user["completed-joysprouts"].includes(String(id))) return;

        user["completed-joysprouts"].push(String(id));

        const lastDate = user["last-completion-date"]
          ? new Date(user["last-completion-date"])
          : null;
        const diffDays = lastDate ? Math.round((now - lastDate) / 86400000) : 0;
        const newStreak = diffDays === 1 ? user["streak-count"] + 1 : 1;

        const pct = (user["completed-joysprouts"].length / TOTAL_JOYSPROUTS) * 100;
        const newBadges = [...user.badges];

        badgeCheckpoints.forEach(c => {
          if (pct >= c.percent && !newBadges.includes(c.badge)) {
            newBadges.push(c.badge);
            alert(`🎉 You earned the ${c.label}`);
          }
        });

        await pushJoySproutsToMemberstack(
          user["completed-joysprouts"],
          newBadges,
          newStreak
        );

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

  /* ---------- Profile Stats + Badge Display ---------- */
  async function displayProfileStats() {
    const { data: memberData } = await window.$memberstackDom.getMemberJSON();
    const completed = memberData?.["completed-joysprouts"]?.length || 0;
    const streak = memberData?.["streak-count"] || 0;
    const badges = memberData?.badges || [];

    const completedEl = document.querySelector("[data-ms-member='completed-joysprouts']");
    const streakEl = document.querySelector("[data-ms-member='streak-count']");
    if (completedEl) completedEl.textContent = completed;
    if (streakEl) streakEl.textContent = streak;

    // Reset all badges to grayscale first
    document.querySelectorAll(".js-badge-icon").forEach(icon => {
      icon.classList.remove("unlocked");
    });

    // Unlock those that have been earned
    badges.forEach(badgeId => {
      const icon = document.querySelector(`.js-badge-icon[data-badge-id='${badgeId}']`);
      if (icon) icon.classList.add("unlocked");
    });
  }

  /* ---------- Init ---------- */
  await hideCompletedJoySprouts();
  await bindCompleteButton();
  await displayProfileStats();
}

document.addEventListener("DOMContentLoaded", JoySproutsMain);
</script>