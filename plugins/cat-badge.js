(function () {
  function init() {
    if (!window.Nekord || !window.Nekord.registerPlugin) {
      setTimeout(init, 50);
      return;
    }

    let badgeEl = null;

    function createBadge() {
      if (document.getElementById("nekord-cat-badge")) return;
      if (!document.body) {
        setTimeout(createBadge, 100);
        return;
      }

      badgeEl = document.createElement("div");
      badgeEl.id = "nekord-cat-badge";
      badgeEl.innerText = "🐱 Nekord Active";
      badgeEl.style.cssText = "position: fixed !important; top: 10px !important; right: 80px !important; z-index: 2147483640 !important; background: #f47fff !important; color: #000 !important; padding: 4px 10px !important; border-radius: 12px !important; font-size: 12px !important; font-weight: bold !important; pointer-events: none !important; box-shadow: 0 2px 10px rgba(0,0,0,0.4) !important;";
      document.body.appendChild(badgeEl);
      console.log("%c[Cat Badge] Badge Mounted! 🐾", "color: #f47fff; font-weight: bold;");
    }

    window.Nekord.registerPlugin({
      id: "cat-badge",
      name: "Cat Mode Badge",
      description: "우측 상단에 핑크색 고양이 뱃지를 띄웁니다.",
      author: "Siangyeok",
      defaultEnabled: true,

      onEnable() {
        createBadge();
      },

      onDisable() {
        const target = document.getElementById("nekord-cat-badge");
        if (target) target.remove();
        badgeEl = null;
        console.log("%c[Cat Badge] Badge Removed! 🐾", "color: #80848e;");
      }
    });
  }

  init();
})();