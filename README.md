# Spatial Volume Controller

Control tab volumes with spatial UI


## Build Environment (Docker)
### Requirements
- make
	- Linux
		- (Ubuntu) `sudo apt install make`
	- MacOS
		- ([Homebrew](https://brew.sh/)) `brew install make`
	- Windows:
		- (WSL) Same as Linux
		- ([Chocolatey](https://chocolatey.org/install)) `choco install make`
		- (Not Maintained & Too Old; Installer) http://gnuwin32.sourceforge.net/packages/make.htm
- Docker
	- https://docs.docker.com/get-docker/

### Build Docker image
```sh
make docker-build
```

### Build project
プロジェクトのビルド前に自動的にDockerイメージがビルドされる。

```sh
make build
```

### Development build (auto-update)
ファイルを変更すると自動的にビルド・反映される。

```sh
make dev
```

### コードチェック
https://standardjs.com/rules-ja.html

```sh
make lint
```

#### 自動修正
```sh
make lint-fix
```


## Build Environment (Native)
### Requirements
- [Node.js 14](https://nodejs.org/ja/download/)

### Install dependencies
```sh
npm install
```

### Build project
```sh
npm run build:chrome
```

### Development build (auto-update)
ファイルを変更すると自動的にビルド・反映される。

```sh
npm run dev:chrome
```

### コードチェック
https://standardjs.com/rules-ja.html

```sh
npm run lint
```

#### 自動修正

```sh
npm run lint-fix
```

## 3rd-party resources
- app/images/*
- tasks/*

These resources are under MIT License by mazamachi, HaNdTriX: [mazamachi/generator-chrome-extension-kickstart-typescript](https://github.com/mazamachi/generator-chrome-extension-kickstart-typescript/tree/d8e455b5d750084e9d27c9f84c536a4b83d4b72b), [HaNdTriX/generator-chrome-extension-kickstart](https://github.com/HaNdTriX/generator-chrome-extension-kickstart)

## Others
This project is generated by [mazamachi/generator-chrome-extension-kickstart-typescript](https://github.com/mazamachi/generator-chrome-extension-kickstart-typescript/tree/d8e455b5d750084e9d27c9f84c536a4b83d4b72b)
