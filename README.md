<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1spX11bHwIDlQzwOlLoXXseX83iKycFyp

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Features

### Live Results Page (即時結果頁面)

This page displays the live results of the lottery draws. Winners are presented in a clear, tabular format for easy overview. When data is loading, a "Syncing with Mainframe Log..." message is shown.

此頁面顯示彩票抽獎的即時結果。中獎者以清晰的表格形式呈現，方便快速瀏覽。當數據載入時，會顯示「正在同步主機日誌...」訊息。

![Live Results Page Screenshot](/Users/dylanhsieh/.openclaw/media/browser/05126365-b83d-4043-b9c0-2b8685a9aae7.png)

_Note: The screenshot above shows the loading state of the Live Results page. Once data is available, winners will populate the table._
_注意：以上截圖顯示了即時結果頁面的載入狀態。一旦數據可用，中獎者將填充表格。_
