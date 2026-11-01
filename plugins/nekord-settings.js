(function () {
  console.log("%c[Nekord] Core Plugin Engine & Registry Ready 🐾", "color: #f47fff; font-weight: bold;");

  const memoryStorage = {};
  function safeGet(key) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {}
    return memoryStorage[key] || null;
  }

  function safeSet(key, val) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, val);
        return;
      }
    } catch (e) {}
    memoryStorage[key] = String(val);
  }

  window.Nekord = {
    plugins: new Map(),

    registerPlugin(meta) {
      if (!meta || !meta.id) return;

      const id = meta.id;
      const saved = safeGet(`nekord_plugin_${id}`);
      const isEnabled = saved === null ? (meta.defaultEnabled ?? true) : saved === "true";

      const pluginEntry = {
        id: meta.id,
        name: meta.name || meta.id,
        description: meta.description || "",
        author: meta.author || "Unknown",
        enabled: isEnabled,
        hasSettings: !!meta.hasSettings,
        onOpenSettings: meta.onOpenSettings || null,
        sidebarItem: meta.sidebarItem || null, // { icon: '🖼️', text: '배경 설정', onClick: fn }
        onEnable: meta.onEnable || (() => {}),
        onDisable: meta.onDisable || (() => {})
      };

      this.plugins.set(id, pluginEntry);

      try {
        if (isEnabled) {
          pluginEntry.onEnable();
        }
      } catch (err) {
        console.error(`[Nekord] Error enabling ${pluginEntry.name}:`, err);
      }

      // 플러그인 등록 시 사이드바 서브 버튼 즉시 갱신
      window.nekordUpdateSidebarSubItems();
    },

    setPluginState(id, enabled) {
      const plugin = this.plugins.get(id);
      if (!plugin) return;

      plugin.enabled = enabled;
      safeSet(`nekord_plugin_${id}`, enabled);

      try {
        if (enabled) {
          plugin.onEnable();
        } else {
          plugin.onDisable();
        }
      } catch (err) {
        console.error(`[Nekord] Error toggling ${plugin.name}:`, err);
      }
      
      window.nekordUpdateSidebarSubItems();
    }
  };

  // 모달 렌더링
  window.nekordOpenModal = function () {
    let overlay = document.getElementById("nekord-modal-overlay");
    if (overlay) overlay.remove();

    overlay = document.createElement("div");
    overlay.id = "nekord-modal-overlay";
    overlay.style.cssText = `
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.75) !important;
      backdrop-filter: blur(4px) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 2147483647 !important;
      pointer-events: auto !important;
    `;

    const pluginEntries = Array.from(window.Nekord.plugins.values());
    let pluginListHtml = "";

    if (pluginEntries.length === 0) {
      pluginListHtml = `<div style="color: #949ba4; font-size: 13px; text-align: center; padding: 12px;">등록된 플러그인이 없다냥 🐾</div>`;
    } else {
      pluginListHtml = pluginEntries.map(p => {
        const checked = p.enabled ? "checked" : "";
        const settingsBtn = p.hasSettings ? `
          <button class="nekord-plugin-cfg-btn" data-plugin-id="${p.id}" style="background: rgba(255,255,255,0.08); border: none; color: #dbdee1; border-radius: 4px; padding: 4px 8px; font-size: 13px; cursor: pointer; margin-right: 10px;">
            ⚙️
          </button>
        ` : "";

        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
            <div style="flex: 1; padding-right: 10px;">
              <div style="color: #fff; font-size: 14px; font-weight: 600;">
                ${p.name} <span style="font-size: 11px; color: #f47fff; font-weight: normal;">by ${p.author}</span>
              </div>
              <div style="color: #949ba4; font-size: 12px; margin-top: 2px;">${p.description}</div>
            </div>
            <div style="display: flex; align-items: center;">
              ${settingsBtn}
              <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                <input type="checkbox" data-plugin-id="${p.id}" ${checked} style="opacity: 0; width: 0; height: 0;">
                <span class="nekord-slider" style="position: absolute; inset: 0; background-color: ${checked ? '#23a55a' : '#80848e'}; border-radius: 24px; transition: 0.2s;">
                  <span style="position: absolute; height: 18px; width: 18px; left: ${checked ? '23px' : '3px'}; bottom: 3px; background-color: white; border-radius: 50%; transition: 0.2s;"></span>
                </span>
              </label>
            </div>
          </div>
        `;
      }).join("");
    }

    const modalContent = document.createElement("div");
    modalContent.id = "nekord-modal-container";
    modalContent.style.cssText = `
      background: #2b2d31 !important;
      width: 500px !important;
      max-width: 90% !important;
      border-radius: 12px !important;
      padding: 24px !important;
      box-shadow: 0 16px 32px rgba(0,0,0,0.5) !important;
      color: #dbdee1 !important;
      font-family: inherit !important;
      pointer-events: auto !important;
      position: relative !important;
      z-index: 2147483647 !important;
    `;

    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="font-size: 20px; font-weight: bold; color: #fff; margin: 0;">🐾 Nekord Settings</h2>
        <button id="nekord-close-btn" style="background: transparent; border: none; color: #949ba4; font-size: 18px; cursor: pointer; padding: 4px;">✕</button>
      </div>
      <p style="color: #949ba4; font-size: 13px; margin-bottom: 18px;">
        The nekost Unofficial Discord Client configuration.
      </p>
      <div style="background: #1e1f22; padding: 12px 16px; border-radius: 8px; margin-bottom: 14px; max-height: 300px; overflow-y: auto;">
        <h3 style="color: #fff; font-size: 14px; margin-bottom: 6px;">🐱 Plugins (${pluginEntries.length})</h3>
        <div>${pluginListHtml}</div>
      </div>
      <div style="text-align: right;">
        <button id="nekord-done-btn" style="background: #5865f2; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; cursor: pointer;">Done</button>
      </div>
    `;

    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);

    const stopPropagationHandler = (e) => e.stopPropagation();
    ["click", "mousedown", "mouseup", "pointerdown", "pointerup"].forEach(evtName => {
      overlay.addEventListener(evtName, stopPropagationHandler);
      modalContent.addEventListener(evtName, stopPropagationHandler);
    });

    modalContent.querySelectorAll(".nekord-plugin-cfg-btn").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-plugin-id");
        const plugin = window.Nekord.plugins.get(id);
        if (plugin && plugin.onOpenSettings) {
          plugin.onOpenSettings();
        }
      };
    });

    modalContent.querySelectorAll("input[type='checkbox']").forEach(input => {
      input.addEventListener("change", (e) => {
        const id = e.target.getAttribute("data-plugin-id");
        const enabled = e.target.checked;
        window.Nekord.setPluginState(id, enabled);

        const slider = e.target.nextElementSibling;
        const knob = slider.firstElementChild;
        slider.style.backgroundColor = enabled ? "#23a55a" : "#80848e";
        knob.style.left = enabled ? "23px" : "3px";
      });
    });

    const closeModal = () => overlay.remove();
    modalContent.querySelector("#nekord-close-btn").onclick = closeModal;
    modalContent.querySelector("#nekord-done-btn").onclick = closeModal;
    overlay.onpointerdown = (e) => {
      if (e.target === overlay) closeModal();
    };
  };

  // 사이드바 서브 아이템들을 동적으로 그리는 함수
  window.nekordUpdateSidebarSubItems = function () {
    const subContainer = document.getElementById("nekord-sidebar-subitems");
    if (!subContainer) return;

    subContainer.innerHTML = "";

    window.Nekord.plugins.forEach((plugin) => {
      // 플러그인이 켜져 있고(enabled), sidebarItem 정의가 있는 경우에만 표시
      if (plugin.enabled && plugin.sidebarItem) {
        const item = document.createElement("div");
        item.style.cssText = "display: flex; align-items: center; gap: 12px; padding: 8px 12px 8px 24px; margin: 2px 8px; border-radius: 4px; color: #949ba4; cursor: pointer; font-size: 14px; font-weight: 500; transition: background-color 0.15s, color 0.15s; user-select: none;";
        
        item.innerHTML = `
          <span style="font-size: 15px; line-height: 1; pointer-events: none;">${plugin.sidebarItem.icon || "⚙️"}</span>
          <span style="color: #b5bac1; pointer-events: none;">${plugin.sidebarItem.text || plugin.name}</span>
        `;

        item.onmouseenter = () => {
          item.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
          item.style.color = "#fff";
        };
        item.onmouseleave = () => {
          item.style.backgroundColor = "transparent";
          item.style.color = "#949ba4";
        };

        item.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof plugin.sidebarItem.onClick === "function") {
            plugin.sidebarItem.onClick();
          }
        });

        subContainer.appendChild(item);
      }
    });
  };

  // 사이드바 메인 버튼 및 서브 컨테이너 주입
  const observer = new MutationObserver(() => {
    if (document.getElementById("nekord-sidebar-btn")) return;

    const questItem = document.querySelector('a[href="/quest-home"], a[href="/quests"]') || 
                      document.querySelector('a[href="/shop"]');
    if (!questItem) return;

    const targetNode = questItem.closest("li") || questItem;
    if (!targetNode || !targetNode.parentNode) return;

    // 메인 Nekord 버튼
    const nekordItem = document.createElement("div");
    nekordItem.id = "nekord-sidebar-btn";
    nekordItem.style.cssText = "display: flex; align-items: center; gap: 16px; padding: 10px 12px; margin: 2px 8px; border-radius: 4px; color: #949ba4; cursor: pointer; font-size: 15px; font-weight: 500; transition: background-color 0.15s, color 0.15s; user-select: none;";

    nekordItem.innerHTML = `
      <span style="font-size: 18px; line-height: 1; pointer-events: none;">🐾</span>
      <span style="color: #dbdee1; pointer-events: none;">Nekord</span>
    `;

    nekordItem.onmouseenter = () => {
      nekordItem.style.backgroundColor = "rgba(255, 255, 255, 0.07)";
      nekordItem.style.color = "#fff";
    };
    nekordItem.onmouseleave = () => {
      nekordItem.style.backgroundColor = "transparent";
      nekordItem.style.color = "#949ba4";
    };

    nekordItem.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.nekordOpenModal();
    });

    // 플러그인 서브 버튼들이 들어갈 전용 컨테이너
    const subContainer = document.createElement("div");
    subContainer.id = "nekord-sidebar-subitems";

    targetNode.after(subContainer);
    targetNode.after(nekordItem);

    window.nekordUpdateSidebarSubItems();
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();