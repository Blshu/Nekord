package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:  "Nekord - The nekost Unofficial Discord Client",
		Width:  1100,
		Height: 720,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 30, G: 31, B: 34, A: 1},
		OnStartup:        app.startup,
		OnDomReady: func(ctx context.Context) {
			_ = app.InjectPlugins()
		},
		// 시작할 때 개발자 도구 강제로 열기
		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
