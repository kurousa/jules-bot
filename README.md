# jules-bot

Google Apps Script (GAS) で構築された、Slack から Jules API (Google の AI コーディングエージェント) を操作するためのボットです。

## 概要

このプロジェクトは、Slack のスラッシュコマンドを使用して、Jules API のセッションを作成したり、現在のセッション一覧を確認したりするための GAS プロジェクトです。

## 主な機能

- **セッション作成**: `/jules [repo] [prompt]` コマンドで新しい Jules セッションを開始します。
- **セッション一覧表示**: `/jules list` コマンドで最近のセッションとそのステータス（完了、実行中、ユーザー確認待ちなど）を一覧表示します。
- **キャッシュ機能**: API のタイムアウト時に備え、スクリプトプロパティを使用した簡易的なキャッシュ機能を搭載しています。

## インストール・セットアップ

### 1. リポジトリのクローンと `clasp` の設定

```bash
git clone <repository-url>
cd jules-bot
npm install -g @google/clasp
clasp login
```

### 2. GAS プロジェクトの作成・紐付け

`.clasp.json` が既にある場合は `clasp push` できます。新しく作成する場合は:

```bash
clasp create --title "jules-bot" --type webapp
```

### 3. スクリプトプロパティの設定

Google Apps Script の設定画面、または `clasp` を使用して以下のプロパティを設定してください。

- `JULES_API_KEY`: Jules API にアクセスするための API キー。

### 4. Slack スラッシュコマンドの設定

1. GAS を「ウェブアプリ」としてデプロイし、その URL を取得します。
2. Slack App 設定画面で Slash Commands を作成します。
   - Command: `/jules`
   - Request URL: GAS ウェブアプリの URL

## ファイル構成

- `jules.js`: Jules API との通信およびステータス変換ロジック。
- `slack.js`: Slack からの Webhook (`doPost`) 処理とレスポンス生成。
- `util.js`: スクリプトプロパティを利用したキャッシュ・永続化ユーティリティ。
- `appsscript.json`: GAS のマニフェストファイル。

## ライセンス

[MIT License](LICENSE)
