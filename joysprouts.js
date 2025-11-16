<script>
async function JoySproutsMain() {
  console.log("🌱 JoySproutsMain initialized — FAST BADGE MODE");

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

  /* ----------------------------------------------------------
     FAST BADGE UPDATE — Runs ASAP before any other UI loads
  -----------------------------------------------------------*/
  async function fastLoadBadges() {
    try {
      const { data } = await window.$memberstackDom.getMemberJSON();
      const earned = data?.badges || [];

      document.querySelectorAll(".js-badge-icon").forEach(icon => {
        const badgeId = icon.getAttribute("data-badge-id");
        const isEarned = earned.includes(badgeId);

        icon.style.filter = isEarned
          ? "grayscale(0%)"
          : "grayscale(100%) opacity(0.5)";

        icon.style.transition = "filter 0.25s ease, transform 0.25s ease";

        icon.addEventListener("mouseenter", () => {
          if (isEarned) icon.style.transform = "scale(1.15)";
        });
        icon.addEventListener("mouseleave", () => {
          icon.style.transform = "scale(1)";
        });
      });

      console.log("⚡ Fast badge rollout applied:", earned);
    } catch (e) {
      console.warn("⚠️ Fast badge load skipped:", e);
    }
  }

  await fastLoadBadges(); // SUPER EARLY ACHIEVEMENT UPDATE


  /* ----------------------------------------------------------
     Styles
  -----------------------------------------------------------*/
  const style = document.createElement("style");
  style.textContent = `
    .joysprouts-item { transition: opacity .6s, transform .6s; }
    .joysprouts-item.removing {
      opacity: 0; transform: scale(.9) translateY(25px);
      pointer-events:none;
      animation: dazzle .45s forwards;
    }
    @keyframes dazzle {
      0% { box-shadow:0 0 0 rgba(255,255,255,0);}
      40%{ box-shadow:0 0 30px rgba(255,255,200,.9);}
      100%{ box-shadow:0 0 0 rgba(255,255,255,0);}
    }
    .joysprout-overlay {
      position:fixed; inset:0;
      background:rgba(0,0,0,.75);
      display:flex; justify-content:center; align-items:center;
      z-index:9999; opacity:0; animation:fadeIn .3s forwards;
    }
    @keyframes fadeIn { to { opacity:1; } }
    .joysprout-popup {
      background:#fff; padding:2rem 3rem;
      border-radius:16px; text-align:center;
      animation:popIn .3s ease forwards;
      max-width:420px; width:90%;
    }
    @keyframes popIn {
      from { transform:scale(.9); opacity:0; }
      to { transform:scale(1); opacity:1; }
    }
  `;
  document.head.appendChild(style);


  /* ----------------------------------------------------------
     Helpers
  -----------------------------------------------------------*/
  const waitForJoySproutsItems = (timeout = 8000) =>
    new Promise((resolve, reject) => {
      const existing = document.querySelectorAll("[data-joysprouts-id]");
      if (existing.length) return resolve(existing);
      const obs = new MutationObserver(() => {
        const found = document.querySelectorAll("[data-joysprouts-id]");
        if (found.length) { obs.disconnect(); resolve(found); }
      });
      obs.observe(document.body, { childList:true, subtree:true });
      setTimeout(() => { obs.disconnect(); reject("⏳ No JoySprouts loaded"); }, timeout);
    });

  function getTodayLocalDate() {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
  }


  /* ----------------------------------------------------------
     Push to Memberstack
  -----------------------------------------------------------*/
  async function pushJoySproutsToMemberstack(updated) {
    try {
      await window.$memberstackDom.updateMemberJSON({ json: updated });
      await window.$memberstackDom.updateMember({
        fields: {
          "completed-joysprouts": updated["completed-joysprouts"].join(","),
          "streak-count": String(updated["streak-count"]),
          "badges": updated.badges.join(","),
        },
      });
      console.log("✅ Memberstack sync OK:", updated);
    } catch (e) {
      console.error("❌ Memberstack sync failed:", e);
    }
  }


  /* ----------------------------------------------------------
     Completion Popup
  -----------------------------------------------------------*/
  function showCompletionPopup() {
    const overlay = document.createElement("div");
    overlay.classList.add("joysprout-overlay");

    overlay.innerHTML = `
      <div class="joysprout-popup">
        <h2>🌱 JoySprout Completed!</h2>
        <p>Great job growing your joy today!</p>
        <p style="opacity:.7">Redirecting shortly…</p>
        <button id="js-back-main"
          style="margin-top:18px;padding:10px 18px;background:#4FC61C;
          color:#fff;border:none;border-radius:999px;font-weight:600;">
          Back to Main View
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("js-back-main").onclick = () =>
      window.location.href = MAIN_VIEW_URL;

    setTimeout(() => {
      window.location.href = MAIN_VIEW_URL;
    }, 3500);
  }


  /* ----------------------------------------------------------
     Season Complete View
  -----------------------------------------------------------*/
  function showSeasonCompleteView() {
    const wrapper = document.querySelector(".joysprouts-wrapper");
    const list = document.querySelector("[data-joysprouts-list]");

    if (wrapper) wrapper.style.display = "none";
    if (list) list.innerHTML = "";

    const box = document.createElement("div");
    box.classList.add("joysprouts-countdown");
    box.innerHTML = `
      <h2>🌱 You've completed this season!</h2>
      <p>More JoySprouts are on the way.</p>
      <div style="margin-top:1rem;width:240px;height:240px;background:#eee;border-radius:16px;"></div>
      <button style="margin-top:1rem;padding:10px 16px;background:#1DA1F2;color:#fff;border-radius:999px;border:none;font-weight:600;">
        Share your progress
      </button>
    `;
    (list || document.body).appendChild(box);

    // Mini confetti
    for (let i=0;i<50;i++){
      const piece=document.createElement("div");
      piece.style.position="fixed";
      piece.style.left=Math.random()*100+"vw";
      piece.style.top="-10px";
      piece.style.width="6px";
      piece.style.height="14px";
      piece.style.background=["#4FC61C","#FFCF33","#FF6B6B","#7C5CFF"][Math.floor(Math.random()*4)];
      piece.style.opacity="0.9";
      piece.style.transition="top 1.4s ease-out, opacity 1.4s ease-out";
      document.body.appendChild(piece);
      requestAnimationFrame(()=>{
        piece.style.top="110vh";
        piece.style.opacity="0";
      });
      setTimeout(()=>piece.remove(),1500);
    }
  }


  /* ----------------------------------------------------------
     Hide Completed Sprouts
  -----------------------------------------------------------*/
  async function hideCompletedJoySprouts() {
    const { data } = await window.$memberstackDom.getMemberJSON();
    const completed = (data?.["completed-joysprouts"] || []).map(String);

    const items = await waitForJoySproutsItems().catch(()=>[]);
    if (!items.length) return;

    let remaining = 0;

    items.forEach(item => {
      const id = item.getAttribute("data-joysprouts-id");
      if (completed.includes(id)) item.remove();
      else remaining++;
    });

    if (remaining === 0) return showSeasonCompleteView();

    const container = items[0].parentElement;
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fill, minmax(260px,1fr))";
    container.style.gap = "1.5rem";
  }


  /* ----------------------------------------------------------
     Complete Button
  -----------------------------------------------------------*/
  async function bindCompleteButton() {
    const btn = document.getElementById("complete-joysprouts-button");
    if (!btn) return;

    const card = btn.closest("[data-joysprouts-id]");
    const checks = card ? card.querySelectorAll('input[type="checkbox"]') : [];

    function evaluate() {
      const allChecked = [...checks].every(c => c.checked);
      btn.disabled = !allChecked;
    }
    checks.forEach(c => c.addEventListener("change", evaluate));
    evaluate();

    btn.onclick = async () => {
      const { data } = await window.$memberstackDom.getMemberJSON();
      const user = {
        "completed-joysprouts": data?.["completed-joysprouts"] || [],
        "last-completion-date": data?.["last-completion-date"] || null,
        "streak-count": data?.["streak-count"] || 0,
        badges: data?.badges || [],
      };

      const id = btn.getAttribute("data-joysprouts-id");
      if (user["completed-joysprouts"].includes(id)) return alert("Already completed!");

      user["completed-joysprouts"].push(id);

      // Streak logic
      const today = getTodayLocalDate();
      const last = user["last-completion-date"];
      let streak = 1;

      if (last) {
        const diff = Math.round(
          (new Date(today) - new Date(last)) / 86400000
        );
        streak = diff === 1 ? user["streak-count"] + 1 : 1;
      }

      // Badge awarding
      const pct = (user["completed-joysprouts"].length / TOTAL_JOYSPROUTS) * 100;
      const earned = [...user.badges];

      badgeCheckpoints.forEach(b => {
        if (pct >= b.percent && !earned.includes(b.badge)) {
          earned.push(b.badge);
          alert(`🎉 You earned the ${b.label}`);
        }
      });

      const updated = {
        "completed-joysprouts": user["completed-joysprouts"],
        "last-completion-date": today,
        "streak-count": streak,
        badges: earned,
      };

      await pushJoySproutsToMemberstack(updated);

      btn.disabled = true;
      btn.textContent = "Completed";
      btn.classList.add("completed");

      showCompletionPopup();
      await hideCompletedJoySprouts();
      await fastLoadBadges();
    };
  }


  /* ----------------------------------------------------------
     Profile Stats + Earned Badges
  -----------------------------------------------------------*/
  async function displayProfileStats() {
    const { data } = await window.$memberstackDom.getMemberJSON();

    const comp = data?.["completed-joysprouts"]?.length || 0;
    const streak = data?.["streak-count"] || 0;

    const cEl = document.querySelector("[data-ms-member='completed-joysprouts']");
    const sEl = document.querySelector("[data-ms-member='streak-count']");
    if (cEl) cEl.textContent = comp;
    if (sEl) sEl.textContent = streak;

    // Achievements are handled globally by fastLoadBadges()
  }


  /* ----------------------------------------------------------
     Init
  -----------------------------------------------------------*/
  await hideCompletedJoySprouts();
  await bindCompleteButton();
  await displayProfileStats();
}

document.addEventListener("DOMContentLoaded", JoySproutsMain);
</script>
