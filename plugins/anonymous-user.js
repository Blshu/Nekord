(function () {
  function init() {
    if (!window.Nekord || !window.Nekord.registerPlugin) {
      setTimeout(init, 50);
      return;
    }

    let observer = null;
    const nameMap = new Map();

    // 닉네임 문자열 기반 고유 4자리 난수 매핑
    function getAnonName(originalName) {
      if (!originalName || originalName.startsWith("User#")) return originalName;
      if (nameMap.has(originalName)) return nameMap.get(originalName);

      let hash = 0;
      for (let i = 0; i < originalName.length; i++) {
        hash = (hash << 5) - hash + originalName.charCodeAt(i);
        hash |= 0;
      }
      const num = Math.abs(hash % 9000) + 1000;
      const anon = `User#${num}`;
      nameMap.set(originalName, anon);
      return anon;
    }

    function anonymizeNode(root) {
      if (!root || root.nodeType !== Node.ELEMENT_NODE) return;

      // 1. 프로필 팝업 / 모달 창 (사진에 나온 유저 프로필 카드 전체)
      const popoutNicknames = root.querySelectorAll(`
        div[class*="userPopout_"] h1,
        div[class*="userPopout_"] div[class*="nickname_"],
        div[class*="userProfile_"] h1,
        div[class*="userProfile_"] div[class*="nickname_"],
        div[class*="userTagUsername_"],
        div[class*="userTagDiscord_"],
        span[class*="userTag_"],
        div[class*="userProfileInner_"] [class*="defaultColor_"][class*="heading-"]
      `);
      popoutNicknames.forEach(el => {
        if (!el.dataset.origName && el.textContent.trim()) {
          el.dataset.origName = el.textContent;
          el.textContent = getAnonName(el.dataset.origName);
        }
      });

      // 2. 친구 목록 및 멤버 목록 유저 닉네임
      const memberNames = root.querySelectorAll('div[class*="userInfo_"] span[class*="username_"], div[class*="member_"] div[class*="name_"] span, span[class*="roleColor_"]');
      memberNames.forEach(el => {
        if (!el.dataset.origName && el.children.length === 0 && el.textContent.trim()) {
          el.dataset.origName = el.textContent;
          el.textContent = getAnonName(el.dataset.origName);
        }
      });

      // 3. 채팅 메시지 작성자 닉네임
      const chatAuthors = root.querySelectorAll('span[class*="username_"][class*="desaturateUserColors_"], h3[class*="header_"] span[class*="username_"]');
      chatAuthors.forEach(el => {
        if (!el.dataset.origName && el.textContent.trim()) {
          el.dataset.origName = el.textContent;
          el.textContent = getAnonName(el.dataset.origName);
        }
      });

      // 4. 좌측 DM 목록 (/channels/@me/{id} 만 타겟팅)
      const dmItems = root.querySelectorAll('a[href^="/channels/@me/"]');
      dmItems.forEach(dmLink => {
        const textNode = dmLink.querySelector('div[class*="name_"]');
        if (textNode && !textNode.dataset.origName && textNode.textContent.trim()) {
          textNode.dataset.origName = textNode.textContent;
          textNode.textContent = getAnonName(textNode.dataset.origName);
        }
      });

      // 5. 왼쪽 아래 내 프로필 패널 (마이크/헤드셋 옆)
      const bottomPanel = document.querySelector('section[class*="panels_"]');
      if (bottomPanel) {
        const myNameElements = bottomPanel.querySelectorAll('div[class*="nameTag_"] div, div[class*="avatar_"] + div div');
        myNameElements.forEach(el => {
          if (!el.dataset.origName && el.children.length === 0 && el.textContent.trim()) {
            el.dataset.origName = el.textContent;
            el.textContent = getAnonName(el.dataset.origName);
          }
        });
      }
    }

    function restoreNames() {
      document.querySelectorAll("[data-orig-name]").forEach(el => {
        el.textContent = el.dataset.origName;
        delete el.dataset.origName;
      });
      nameMap.clear();
    }

    function startAnonymizer() {
      anonymizeNode(document.body);

      if (!observer) {
        observer = new MutationObserver(mutations => {
          for (const m of mutations) {
            for (const added of m.addedNodes) {
              anonymizeNode(added);
            }
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
      console.log("%c[Anonymous Mode] Usernames masked safely! 🕶️🐾", "color: #5865f2; font-weight: bold;");
    }

    function stopAnonymizer() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      restoreNames();
      console.log("%c[Anonymous Mode] Names restored! 🐾", "color: #80848e;");
    }

    window.Nekord.registerPlugin({
      id: "anon-mode",
      name: "Anonymous Usernames",
      description: "시스템 메뉴를 제외한 모든 유저 및 본인 닉네임을 가립니다.",
      author: "Siangyeok",
      defaultEnabled: false,

      onEnable() {
        startAnonymizer();
      },

      onDisable() {
        stopAnonymizer();
      }
    });
  }

  init();
})();