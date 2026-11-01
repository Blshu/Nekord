package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// InjectPlugins는 코어 세팅 스크립트를 먼저 로드하고 일반 플러그인을 주입해
func (a *App) InjectPlugins() error {
	pluginDir := "./plugins"

	if _, err := os.Stat(pluginDir); os.IsNotExist(err) {
		_ = os.MkdirAll(pluginDir, os.ModePerm)
		return nil
	}

	entries, err := os.ReadDir(pluginDir)
	if err != nil {
		return err
	}

	// 1. 코어 스크립트와 일반 플러그인 분리
	var coreFiles []string
	var otherFiles []string

	for _, entry := range entries {
		if !entry.IsDir() && filepath.Ext(entry.Name()) == ".js" {
			name := entry.Name()
			// nekord-settings.js는 무조건 최우선 로드 대상
			if name == "nekord-settings.js" {
				coreFiles = append(coreFiles, name)
			} else {
				otherFiles = append(otherFiles, name)
			}
		}
	}

	// 일반 플러그인들은 이름순 정렬
	sort.Strings(otherFiles)

	// 코어가 가장 먼저 오도록 합치기
	targetFiles := append(coreFiles, otherFiles...)

	// 2. 순서대로 웹뷰에 주입
	for _, fileName := range targetFiles {
		data, err := os.ReadFile(filepath.Join(pluginDir, fileName))
		if err == nil {
			jsPayload := fmt.Sprintf(`(function() {
				try {
					%s
				} catch (err) {
					console.error("[Nekord Plugin Error: %s]", err);
				}
			})();`, string(data), fileName)

			runtime.WindowExecJS(a.ctx, jsPayload)
		}
	}

	return nil
}

func (a *App) NavigateToDiscord() {
	runtime.WindowExecJS(a.ctx, `window.location.href = "https://discord.com/app";`)
}
