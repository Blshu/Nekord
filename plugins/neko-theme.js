(function () {
  function init() {
    if (!window.Nekord || !window.Nekord.registerPlugin) {
      setTimeout(init, 50);
      return;
    }

    let styleEl = null;

    function applyStyle() {
      if (document.getElementById("nekord-pink-theme")) return;
      if (!document.head) {
        setTimeout(applyStyle, 100);
        return;
      }

      styleEl = document.createElement("style");
      styleEl.id = "nekord-pink-theme";
      styleEl.textContent = `
        /* 1. 최신 디스코드 HSL/RAW 토큰 및 루트 변수 강제 오버라이드 */
        html, :root, .theme-dark, .theme-light {
          --brand-500: #f47fff !important;
          --brand-560: #e066eb !important;
          --brand-600: #cb53d7 !important;
          --brand-experiment: #f47fff !important;
          --brand-experiment-500: #f47fff !important;
          
          /* 디스코드 내부 컬러 계산용 HSL & RAW 값 */
          --brand-500-hsl: 300 calc(var(--saturation-factor, 1) * 100%) 75% !important;
          --brand-560-hsl: 300 calc(var(--saturation-factor, 1) * 78%) 66% !important;
          --brand-500-raw: 244, 127, 255 !important;
          
          /* 상호작용 및 포커스 링 */
          --focus-primary: #f47fff !important;
          --button-positive-background: #f47fff !important;
        }

        /* 2. 좌측 상단 디스코드 홈/DM 버튼 (디스코드 로고 배경) */
        div[data-list-item-id="guildsnav___home"] > div[class*="childWrapper"] {
          background-color: #f47fff !important;
          color: #000 !important;
        }

        /* 3. 사이드바 선택된 채널/친구 탭 및 마우스 호버 */
        div[class*="selected__"]:not([class*="guild"]):not([class*="server"]):has(svg),
        div[class*="channel_"] a[class*="selected_"] {
          background-color: rgba(244, 127, 255, 0.15) !important;
        }
        
        /* 4. 읽지 않은 메시지 뱃지 & 숫자 뱃지 */
        span[class*="badge_"], 
        span[class*="unreadMentionsIndicator_"],
        div[class*="numberBadge_"] {
          background-color: #f47fff !important;
          color: #000 !important;
        }

        /* 5. 멘션 및 메시지 강조 줄 */
        [class*="mentioned_"] {
          background-color: rgba(244, 127, 255, 0.1) !important;
        }
        [class*="mentioned_"]::before {
          background-color: #f47fff !important;
        }

        /* 6. 파란색 기본 전송/확인 버튼류 */
        button[class*="lookFilled__"][class*="colorBrand__"],
        button[class*="lookFilled"][class*="colorPrimary"] {
          background-color: #f47fff !important;
          color: #111214 !important;
          font-weight: 600 !important;
        }
        button[class*="lookFilled__"][class*="colorBrand__"]:hover {
          background-color: #e066eb !important;
        }

        /* 7. 채팅 입력창 포커스 테두리 */
        [class*="channelTextArea__"]:focus-within {
          border: 1px solid #f47fff !important;
        }
      `;
      document.head.appendChild(styleEl);
      console.log("%c[Neko Theme] Super Pink Theme Applied! 🌸🐾", "color: #f47fff; font-weight: bold;");
    }

    window.Nekord.registerPlugin({
      id: "neko-theme",
      name: "Neko Pink Accent",
      description: "디스코드 강조 색상을 산뜻한 네코 핑크로 바꿉니다.",
      author: "Siangyeok",
      defaultEnabled: false,

      onEnable() {
        applyStyle();
      },

      onDisable() {
        const target = document.getElementById("nekord-pink-theme");
        if (target) target.remove();
        styleEl = null;
        console.log("%c[Neko Theme] Pink Theme Removed! 🐾", "color: #80848e;");
      }
    });
  }

  init();
})();