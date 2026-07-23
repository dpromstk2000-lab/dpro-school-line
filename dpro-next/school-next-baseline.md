# DPRO 学習塾 LINE / SCHOOL-NEXT-1 現状基準台帳

- 判定: **NG**
- 次のSTEP: `SCHOOL-NEXT-1-R1_REQUIRED`
- 完成日時（JST）: `2026-07-23T20:48:14+09:00`
- 基準SHA: `035ba1a0df04cb0b0854d05d3255ff71df20bed0`
- バックアップタグ: `backup-school-next-before-1-20260723`
- Worker変更: なし
- Supabase変更: なし
- API変更: なし

## 検査集計

- OK: 46
- 注意: 6
- NG: 1
- ブロックNG: 1

## 検査結果

| 判定 | 検査 | 詳細 |
|---|---|---|
| OK | index.html容量 | 56,192 bytes |
| OK | member.html容量 | 45,767 bytes |
| OK | owner.html容量 | 86,253 bytes |
| OK | owner-ipad.html容量 | 55,914 bytes |
| OK | system-check.html容量 | 33,967 bytes |
| OK | config.js容量 | 8,630 bytes |
| OK | index.html HTML構文 | 標準HTMLパーサーで読込できました。 |
| OK | index.html HTML ID重複 | 66件、重複なし |
| OK | index.html JavaScript構文 | インラインscript 1件を検査 |
| OK | index.html STEP表記 | STEP SCHOOL-6-R2 |
| OK | member.html HTML構文 | 標準HTMLパーサーで読込できました。 |
| OK | member.html HTML ID重複 | 27件、重複なし |
| OK | member.html JavaScript構文 | インラインscript 1件を検査 |
| OK | member.html STEP表記 | STEP SCHOOL-7 |
| OK | owner.html HTML構文 | 標準HTMLパーサーで読込できました。 |
| OK | owner.html HTML ID重複 | 49件、重複なし |
| OK | owner.html JavaScript構文 | インラインscript 1件を検査 |
| 注意 | owner.html STEP表記 | 複数表記を検出: STEP SCHOOL-10-R2, STEP SCHOOL-10-R4 |
| OK | owner-ipad.html HTML構文 | 標準HTMLパーサーで読込できました。 |
| OK | owner-ipad.html HTML ID重複 | 25件、重複なし |
| OK | owner-ipad.html JavaScript構文 | インラインscript 1件を検査 |
| 注意 | owner-ipad.html STEP表記 | 複数表記を検出: STEP SCHOOL-9, STEP SCHOOL-9-R1 |
| OK | system-check.html HTML構文 | 標準HTMLパーサーで読込できました。 |
| OK | system-check.html HTML ID重複 | 41件、重複なし |
| OK | system-check.html JavaScript構文 | インラインscript 1件を検査 |
| OK | system-check.html STEP表記 | STEP SCHOOL-11 |
| OK | config.js JavaScript構文 | node --check PASS |
| OK | index.html 既存機能維持 | 必須マーカー 4件を確認 |
| OK | owner.html 既存機能維持 | 必須マーカー 11件を確認 |
| OK | member.html 既存機能維持 | 必須マーカー 9件を確認 |
| OK | owner-ipad.html 既存機能維持 | 必須マーカー 6件を確認 |
| OK | system-check.html 既存機能維持 | 必須マーカー 7件を確認 |
| OK | config.js 既存機能維持 | 必須マーカー 10件を確認 |
| OK | 学習塾業務ロジック | 体験・欠席・振替・授業・保護者・生徒・講師・残数・兄弟姉妹を確認 |
| OK | 管理コード削除ボタン | owner.htmlとsystem-check.htmlで確認 |
| OK | 電話番号正規化 | +81・記号除去・全角数字対応を確認 |
| OK | 過去日時防止・画面側 | owner.htmlで過去日補正を確認 |
| 注意 | 過去日時防止・Worker側 | Worker採用ソースがPagesリポジトリにないためNEXT-1では記録のみ。API側検査はNEXT-9で強化します。 |
| 注意 | 重複登録防止 | 既存画面・設定は維持。Workerの冪等性と同一生徒・同一日時ガードはNEXT-3以降で確認します。 |
| 注意 | 操作履歴・監査ログ | 既存SQL・Worker採用版は変更しません。採用版ハッシュを別台帳へ登録する対象です。 |
| OK | 公開画面への管理情報混入・静的検査 | 顧客画面に秘密鍵・内部メモ名称なし |
| 注意 | 公開configのデモ管理コード | 公開デモ用ヒントを検出。実店舗版では環境分離し、顧客画面へ表示しないでください。 |
| OK | Worker変更記録 | 変更なし。Pagesリポジトリ内Workerソース: なし |
| OK | Supabase変更記録 | 変更なし。Pagesリポジトリ内SQL: なし |
| OK | API変更記録 | 変更なし。現行エンドポイントを基準として保存 |
| OK | Worker | HTTP 200 / service=DPRO 学習塾・習い事 LINE API / version=STEP-SCHOOL-3-WORKER-API-20260709 |
| NG | 公開設定API | 管理用キーを検出: root.shop.admin_code |
| OK | 管理コード拒否 | 不正コードをHTTP 401で拒否 |
| OK | index.html公開 | HTTP 200 / 56,192 bytes |
| OK | member.html公開 | HTTP 200 / 45,767 bytes |
| OK | owner.html公開 | HTTP 200 / 86,253 bytes |
| OK | owner-ipad.html公開 | HTTP 200 / 55,914 bytes |
| OK | system-check.html公開 | HTTP 200 / 33,967 bytes |

## 公開URL

- customer: `https://dpromstk2000-lab.github.io/dpro-school-line/index.html`
- member: `https://dpromstk2000-lab.github.io/dpro-school-line/member.html`
- owner_pc: `https://dpromstk2000-lab.github.io/dpro-school-line/owner.html`
- owner_ipad: `https://dpromstk2000-lab.github.io/dpro-school-line/owner-ipad.html`
- system_check: `https://dpromstk2000-lab.github.io/dpro-school-line/system-check.html`
- worker_health: `https://dpro-school-line-api.dpromstk2000.workers.dev/api/health`

## NEXT-1で変更していないもの

- 既存HTMLの機能・デザイン
- Cloudflare Worker本番コード
- Supabaseテーブル・RLS・データ
- LINE設定

NG時は本YMLを削除せず、`SCHOOL-NEXT-1-R1`で原因を修正します。
