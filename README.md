## これは何?
Google Calendarの今日の予定をGmailに送信するGoogle App Scriptです。

## 初期設定
- GASのプロパティで以下を設定。新UIだと出てこないので、legacyに切り替える必要がある
  - recipient: メールの送信先

## Deploy
- `npm install`
- `clasp login`
- `_clasp.json`を`.clasp.json`にrenameし、GASのidを埋める
  - ない場合は新規のものを作成する
- `clasp push && clasp open`
- 初回だけ、`setOnceTrigger`を手動で実行する必要がある
