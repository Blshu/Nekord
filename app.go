package main

import (
	"context"
	"os"
	"path/filepath"
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

// 실행 파일(.exe) 위치 기준 plugins 폴더 탐색
func (a *App) getPluginsDir() string {
	exePath, err := os.Executable()
	if err != nil {
		return "plugins"
	}
	pluginsDir := filepath.Join(filepath.Dir(exePath), "plugins")
	_ = os.MkdirAll(pluginsDir, 0755)
	return pluginsDir
}

// plugins 폴더 내 모든 JS 파일 내용을 합쳐서 반환
func (a *App) InjectPlugins() string {
	pluginsDir := a.getPluginsDir()
	files, err := os.ReadDir(pluginsDir)
	if err != nil {
		return ""
	}

	var combinedJS string

	// 1. 코어 설정 스크립트(nekord-settings.js) 최우선 배치
	coreFile := filepath.Join(pluginsDir, "nekord-settings.js")
	if data, err := os.ReadFile(coreFile); err == nil {
		combinedJS += string(data) + "\n;\n"
	}

	// 2. 나머지 일반 플러그인들 합치기
	for _, file := range files {
		if file.IsDir() || filepath.Ext(file.Name()) != ".js" {
			continue
		}
		if file.Name() == "nekord-settings.js" {
			continue
		}

		filePath := filepath.Join(pluginsDir, file.Name())
		if data, err := os.ReadFile(filePath); err == nil {
			combinedJS += string(data) + "\n;\n"
		}
	}

	return combinedJS
}
