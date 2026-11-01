package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver" // 👈 AssetServer 전용 패키지 추가
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:  "Nekord",
		Width:  1280,
		Height: 720,
		AssetServer: &assetserver.Options{ // 👈 options.AssetServer 대신 assetserver.Options 사용
			Assets: assets,
		},
		OnStartup: app.startup,
		OnDomReady: func(ctx context.Context) {
			jsCode := app.InjectPlugins()
			if jsCode != "" {
				wailsRuntime.WindowExecJS(ctx, jsCode)
			}
		},
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
