# 🐾 Nekord

> **The nekost Unofficial Discord Client**  
> Wails(Go + Web) 기반의 경량화 모듈형 커스텀 디스코드 클라이언트

![Nekord CI](https://github.com/Blshu/Nekord/actions/workflows/ci.yml/badge.svg)
![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go)
![Wails](https://img.shields.io/badge/Wails-v2-DF0000?style=flat&logo=wails)
![License](https://img.shields.io/badge/license-GPLv3-blue.svg)

---

## ✨ Features

- **🚀 초경량 네이티브 웹뷰**: Wails를 기반으로 리소스를 적게 먹고 빠른 실행 속도 제공
- **🧩 플러그인 모듈 아키텍처**: `./plugins` 폴더에 JS 파일만 추가하면 자동으로 인식 및 로드
- **⚙️ 인앱 설정 매니저**: 디스코드 좌측 사이드바에 전용 메뉴를 주입하여 플러그인 On/Off 실시간 제어
- **🕶️ 익명 모드 (Anonymous Usernames)**: 화면에 보이는 유저 닉네임과 태그를 해시 기반 랜덤 ID로 즉시 마스킹
- **🌸 커스텀 테마 & 뱃지**: 클라이언트 상태 표시 및 네코 핑크 액센트 테마 지원

---

## 📁 Project Structure

```text
nekord/
├── .github/workflows/    # CI 자동화 (Go build & JS syntax check)
├── plugins/              # 커스텀 플러그인 디렉터리
│   ├── nekord-settings.js   # 코어 설정 모달 & 플러그인 레지스트리
│   ├── cat-badge.js         # 상태 표시 뱃지 플러그인
│   ├── neko-theme.js        # 핑크 악센트 테마
│   └── anonymous-user.js    # 닉네임 마스킹 익명화 플러그인
├── app.go                # Wails 백엔드 런타임 & 플러그인 주입 로직
├── main.go               # 애플리케이션 진입점
└── wails.json            # Wails 설정 파일
```
## 🛠️ Build & Run
### 사전 요구사항
1. Go 1.21 이상
2. Wails CLI v2

```Bash
# Wails CLI 설치 (필요시)
go install [github.com/wailsapp/wails/v2/cmd/wails@latest](https://github.com/wailsapp/wails/v2/cmd/wails@latest)

# 개발 모드로 실행
wails dev

# 프로덕션 빌드
wails build
```
## 🔌 Plugin Development
새로운 플러그인은 ./plugins 디렉터리에 .js 파일을 생성하고 window.Nekord.registerPlugin API를 호출하면 자동으로 로드됩니다:

```JavaScript
(function () {
  function init() {
    if (!window.Nekord || !window.Nekord.registerPlugin) {
      setTimeout(init, 50);
      return;
    }

    window.Nekord.registerPlugin({
      id: "my-plugin",
      name: "My Cool Plugin",
      description: "플러그인 설명",
      author: "YourName",
      defaultEnabled: true,
      onEnable() {
        // 활성화 시 실행할 로직
      },
      onDisable() {
        // 비활성화 시 정리 로직
      }
    });
  }

  init();
})();
```
## ⚠️ Disclaimer
Nekord는 비공식 디스코드 서드파티 클라이언트입니다. Discord의 공식 서비스 약관을 준수하여 연구 및 개인 개발 목적으로 사용하는 것을 권장합니다.