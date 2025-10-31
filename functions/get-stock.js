/*
 * 檔案路徑: /functions/get-stock.js
 * [已更新] 這個後端函式現在同時支援台股 (tw) 和美股 (us)
 */

export async function onRequest(context) {
  // 1. 從 URL 取得參數
  const { searchParams } = new URL(context.request.url);
  const symbol = searchParams.get('symbol');
  const market = searchParams.get('market') || 'us'; // 預設為 'us'

  if (!symbol) {
    return new Response(JSON.stringify({ error: 'Missing symbol' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. 根據 'market' 參數決定呼叫哪個 API
  
  // --- [新功能] 台股 (TW) 邏輯 ---
  if (market === 'tw') {
    const twseUrl = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${symbol}.tw&json=1&delay=0`;
    
    try {
      const response = await fetch(twseUrl, {
        // 偽裝 Referer 標頭，模擬是從證交所網站發出的請求，提高成功率
        headers: { 'Referer': 'https.www.twse.com.tw/' }
      });
      
      if (!response.ok) {
        throw new Error(`TWSE server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 將證交所的資料原封不動傳回給前端
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502, // Bad Gateway
        headers: { 'Content-Type': 'application/json' },
      });
    }
  
  // --- [原功能] 美股 (US) 邏輯 ---
  } else { 
    // 從 Cloudflare 變數讀取 API Key
    const API_KEY = context.env.ALPHA_VANTAGE_KEY;

    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured on server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 呼叫 Alpha Vantage API
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      // 將 Alpha Vantage 的資料原封不動傳回給前端
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502, // Bad Gateway
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}
