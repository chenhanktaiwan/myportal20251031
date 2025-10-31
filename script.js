// [修改] API Key 已被移除
// (我們不再需要這行，它已移至 Cloudflare 後端)

// 日期 (不變)
function updateDatetime() {
  const now = new Date();
  // [已還原] 更新首頁的大日期
  const targetMain = document.getElementById('datetime');
  if (targetMain) {
      targetMain.textContent = now.toLocaleDateString('zh-TW',{
        year:'numeric', month:'long', day:'numeric',weekday:'long',hour:'2-digit',minute:'2-digit'
      });
  }
  // [已還原] 更新導覽列的小日期
  const targetNav = document.getElementById('nav-datetime');
  if (targetNav) {
      targetNav.textContent = now.toLocaleDateString('zh-TW', {
        month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'
      });
  }
}

// [修正] 亂碼 ?? -> 天氣 Emojis
const weatherCodes = {
  0: {emoji:'☀️', desc:'晴天'},
  1: {emoji:'🌤️', desc:'晴朗'},
  2: {emoji:'☁️', desc:'多雲'},
  3: {emoji:'🌥️', desc:'陰天'},
  45: {emoji:'🌫️', desc:'霧'},
  51: {emoji:'🌦️', desc:'小雨'},
  55: {emoji:'🌧️', desc:'大雨'},
  61: {emoji:'🌦️', desc:'小雨'},
  63: {emoji:'🌧️', desc:'中雨'},
  65: {emoji:'🌧️', desc:'大雨'},
  80: {emoji:'🌧️', desc:'陣雨'},
  81: {emoji:'🌧️', desc:'陣雨'},
  82: {emoji:'⛈️', desc:'大陣雨'},
  95: {emoji:'🌩️', desc:'雷雨'},
  99: {emoji:'⛈️', desc:'強雷雨'}
};

function updateWeather(sourceSelectorId){
  const selectorNav = document.getElementById('locationSelectorNav');
  const selectorMain = document.getElementById('locationSelectorMain');
  const targetRow = document.getElementById('weatherRow');
  const targetNav = document.getElementById('nav-weather');

  if (!selectorNav || !selectorMain || !targetRow || !targetNav) return;

  // [新功能] 同步兩個選擇器 (不變)
  let v;
  if (sourceSelectorId === 'locationSelectorNav') {
      v = selectorNav.value.split(',');
      selectorMain.value = selectorNav.value; // 同步
  } else {
      v = selectorMain.value.split(',');
      selectorNav.value = selectorMain.value; // 同步
  }
  targetRow.innerHTML = '<div class="weather-loading">載入天氣資料中...</div>';
  targetNav.innerHTML = '...';

  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${v[0]}&longitude=${v[1]}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Taipei&forecast_days=7`)
  .then(r=>r.json()).then(d=>{
     // 1. [已還原] 填入 7 天天氣預報
    let html='';
    const wd=['週日','週一','週二','週三','週四','週五','週六'];
    
    for(let i=0;i<7;i++){
      const date= new Date (d.daily.time[i]);
      const dayName = i===0 ?'今天':wd[date.getDay()];
      const code = d.daily.weathercode[i];
      const w = weatherCodes[code] || { emoji:'☁️', desc:'多雲'}; // [修正] 預設值
      const tMax = Math.round(d.daily.temperature_2m_max[i]);
      const tMin = Math.round(d.daily.temperature_2m_min[i]);
      const rainProb = d.daily.precipitation_probability_max[i] || 0;
      
      // [修正] 亂碼 ?? -> 💧
      html+=`<div class="weather-day-h"><div class="weather-date-h">${dayName}</div><span class="weather-emoji-h">${w.emoji}</span><div class="weather-temp-h">${tMin}° - ${tMax}°</div><div class="weather-rain-h">💧 ${rainProb}%</div><div class="weather-desc-h">${w.desc}</div></div>`;
    }
    targetRow.innerHTML = html;
    
     // 2. [已還原] 填入導覽列當前天氣 (不變)
    if (d.current_weather) {
        const cw = d.current_weather;
        const w_nav = weatherCodes[cw.weathercode] || { emoji:'☁️', desc:'多雲'}; // [修正] 預設值
        const tMax_nav = Math.round(d.daily.temperature_2m_max[0]);
        const tMin_nav = Math.round(d.daily.temperature_2m_min[0]);
        targetNav.innerHTML = `<span class="nav-weather-emoji">${w_nav.emoji}</span> ${Math.round(cw.temperature)}° <span style="font-weight:400;opacity:0.8;">(${tMin_nav}°-${tMax_nav}°)</span>`;
    }
  }).catch(() => {
    targetRow.innerHTML='<div class="weather-loading">天氣資料載入失敗</div>';
    targetNav.innerHTML = '天氣失敗';
  });
}

// 搜尋 (完整保留你原本的程式碼) (不變)
document.getElementById('searchBtn').onclick = () => {
  const val=document.getElementById('searchInput').value.trim();
  if(!val) return;
  if(val.includes('.') && !val.includes(' ')) {
    window.open(val.startsWith('http') ? val : 'https://' + val, '_blank');
  } else {
    window.open('https://www.google.com/search?q=' + encodeURIComponent(val), '_blank');
  }
};
document.getElementById('searchInput').addEventListener('keypress', e =>{
  if(e.key === 'Enter') document.getElementById('searchBtn').click();
});

// [地圖修正] (不變)
function searchGoogleMaps() {
  const input = document.getElementById('mapSearchInput');
  if (!input) return;
  const query = input.value.trim();
  if (!query) return;
  const mapFrame = document.getElementById('mapFrame');
  if (!mapFrame) return;
  const newSrc = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  mapFrame.src = newSrc;
}


// [新聞修正] (不變，繼續使用 corsproxy.io)
const RSS_FEEDS = {
    tw: [
        'https://news.ltn.com.tw/rss/all.xml',       // 自由時報 (首選)
        'https://www.cna.com.tw/rsspolitics.xml',  // 中央通訊社 (備援)
    ],
    jp: [
        'https://www3.nhk.or.jp/rss/news/cat0.xml',    // NHK (首選)
        'https://www.asahi.com/rss/asahi/newsheadlines.rdf' // 朝日新聞 (備援)
    ],
    intl: [
        'http://feeds.bbci.co.uk/news/world/rss.xml' // BBC News
    ]
};
let currentNewsTab = 'tw';
function switchNewsTab(tab){
  currentNewsTab = tab;
  document.querySelectorAll('#page-home .news-tab').forEach(btn => btn.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  loadNews();
}
function cleanCData(str) {
    if (str.startsWith('<![CDATA[') && str.endsWith(']]>')) {
        return str.substring(9, str.length - 3);
    }
    return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
}
function parseRSS(xmlText) {
    const articles = [];
    const maxArticles = 5;
    let items = [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    if (items.length === 0) {
         items.push(...xmlText.matchAll(/<item [^>]+>([\s\S]*?)<\/item>/g));
    }
    if (items.length === 0) {
         items.push(...xmlText.matchAll(/<item[^>]+rdf:about="([^"]+)"[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<\/item>/g));
         for (let i = 0; i < items.length && i < maxArticles; i++) {
             articles.push({
                 title: cleanCData(items[i][2]),
                 url: items[i][1],
                 source: { name: '朝日新聞' }
             });
         }
         return articles;
    }
    for (let i = 0; i < items.length && i < maxArticles; i++) {
        const itemContent = items[i][1];
        const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
        const title = titleMatch ? cleanCData(titleMatch[1]) : '無標題';
        const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
        const link = linkMatch ? (linkMatch[1] || '#') : '#';
        let sourceName = null;
        const creatorMatch = itemContent.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/);
        sourceName = creatorMatch ? cleanCData(creatorMatch[1]) : 'N/A';
        articles.push({ title: title, url: link.trim(), source: { name: sourceName } });
    }
    return articles;
}
async function loadNews(){
  const list = document.getElementById('newsList');
  if (!list) return;
  list.innerHTML = '<li class="news-loading">載入新聞中...</li>';
  const refreshBtn = document.getElementById('refreshNewsBtn');
  if (refreshBtn) refreshBtn.disabled = true;
  const urlsToTry = RSS_FEEDS[currentNewsTab] || RSS_FEEDS['tw'];
  let success = false;
  for (const rssUrl of urlsToTry) {
      try {
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`;
          const res = await fetch(proxyUrl);
          if (!res.ok) throw new Error(`代理伺服器錯誤 (狀態: ${res.status})`);
          const xmlText = await res.text(); 
          const articles = parseRSS(xmlText);
          
          if (articles && articles.length > 0) {
              list.innerHTML = '';
               articles.forEach(article => {
                  let sourceName = article.source.name;
                  if (sourceName === 'N/A' || !sourceName) {
                      if (rssUrl.includes('cna.com')) sourceName = '中央通訊社';
                      else if (rssUrl.includes('ltn.com')) sourceName = '自由時報';
                      else if (rssUrl.includes('udn.com')) sourceName = '聯合新聞網';
                      else if (rssUrl.includes('nhk.or.jp')) sourceName = 'NHK';
                      else if (rssUrl.includes('bbci.co.uk')) sourceName = 'BBC News';
                      else sourceName = 'RSS 來源';
                  }
                  list.insertAdjacentHTML('beforeend', `
                      <li class="news-item" onclick="window.open('${article.url}','_blank')">
                          <div class="news-item-title">${article.title || '無標題'}</div>
                          <div class="news-item-meta">
                              <span>${sourceName}</span>
                          </div>
                      </li>`);
              });
              success = true;
              break;
           } else {
              throw new Error('RSS 內容為空或無法解析');
          }
      } catch(e) {
          console.warn(`RSS 來源 ${rssUrl} 失敗: ${e.message}`);
      }
  }
  if (!success) {
      list.innerHTML = `<li class="news-loading">新聞載入失敗: 所有備援來源均嘗試失敗。</li>`;
  }
  if (refreshBtn) refreshBtn.disabled = false;
}


// 股票區 (不變)
const stockWatchlist = {
  tw: ['2330','2317','2454','2603','0050'],
  us: ['AAPL','GOOGL','TSLA','NVDA','MSFT']
};
let stockCurrentMarket = 'tw';
function switchStockMarket(market){
  stockCurrentMarket=market;
  document.querySelectorAll('.stock-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('stockTab_' + market).classList.add('active');
  loadStocks();
}

// ▼▼▼ [股票修正] 修正 Cloudflare Function 的網址 (移除 /functions) ▼▼▼
async function loadStocks(){
  const container = document.getElementById('stocksList');
  if (!container) return;
  
  const watchlist = stockWatchlist[stockCurrentMarket];
  container.innerHTML = '<div class="stocks-loading">載入股票資料中...</div>';
  
  if(stockCurrentMarket==='tw'){
    container.innerHTML = '';
    for(const symbol of watchlist){
      try{
        // [修改] 修正網址路徑
        const url = `/get-stock?market=tw&symbol=${symbol}`;
        
        const res = await fetch(url);
        const data = await res.json(); // <--- 錯誤發生在這裡 (script.js:288)
        
        if(data.msgArray && data.msgArray.length > 0) {
          const st = data.msgArray[0];
          const price = parseFloat(st.z) || 0;
          const prevClose = parseFloat(st.y) || price;
          const change = price - prevClose;
          const changePercent = prevClose!==0 ? (change/prevClose)*100 : 0;
          const c = change>0 ? 'stock-up' : change<0 ? 'stock-down' : 'stock-neutral';
          container.insertAdjacentHTML('beforeend', `
            <div class="stock-item">
              <div class="stock-info">
                <div class="stock-symbol">${symbol}</div>
                <div class="stock-name">${st.n||symbol}</div>
              </div>
              <div class="stock-price-info">
                <div class="stock-price ${c}">$${price.toFixed(2)}</div>
                <div class="stock-change ${c}">${change>0?'+':''}${change.toFixed(2)} (${changePercent>0?'+':''}${changePercent.toFixed(2)}%)</div>
              </div>
            </div>`);
        } else {
          container.insertAdjacentHTML('beforeend', `<div class="stock-item">無法取得 ${symbol} 資訊</div>`);
        }
      }catch(e){
        console.error(`載入 ${symbol} 失敗:`, e);
        container.insertAdjacentHTML('beforeend', `<div class="stock-item">載入 ${symbol} 失敗</div>`);
      }
    }
  } else {
    // (美股 API)
    container.innerHTML = '';
    for(const symbol of watchlist){
      try{
        // [修改] 修正網址路徑
        const url = `/get-stock?market=us&symbol=${symbol}`;
        
        const response = await fetch(url);
        const data = await response.json(); // <--- 錯誤也可能發生在這裡
        
        if(data['Global Quote'] && Object.keys(data['Global Quote']).length > 0){
          const q = data['Global Quote'];
          const price = parseFloat(q["05. price"]) || 0;
          const change = parseFloat(q["09. change"]) || 0;
          const changePercent = parseFloat(q["10. change percent"]?.replace('%','')) || 0;
          const c = change > 0 ? 'stock-up' : change < 0 ? 'stock-down' : 'stock-neutral';
          container.insertAdjacentHTML('beforeend', `
            <div class="stock-item">
              <div class="stock-info">
                <div class="stock-symbol">${symbol}</div>
                <div class="stock-name">${q["01. symbol"]||symbol}</div>
              </div>
              <div class="stock-price-info">
                <div class="stock-price ${c}">$${price.toFixed(2)}</div>
                <div class="stock-change ${c}">${change>0?'+':''}${change.toFixed(2)} (${changePercent>0?'+':''}${changePercent.toFixed(2)}%)</div>
              </div>
            </div>`);
        } else {
          container.insertAdjacentHTML('beforeend', `<div class="stock-item">無法取得 ${symbol} 資訊 (API 限制)</div>`);
        }
      }catch(e){
        console.error(`載入 ${symbol} 失敗:`, e);
        container.insertAdjacentHTML('beforeend', `<div class="stock-item">載入 ${symbol} 失敗</div>`);
      }
      // [修正] Alpha Vantage 的 API 有速率限制，即使是 demo key。保留延遲。
      // 但我們現在是用自己的私人 key (存在變數裡)，可以嘗試縮短延遲
      await delay(1000); // (原為 1400)
    }
  }
}
// ▲▲▲ 修改結束 ▲▲▲


function delay(ms){return new Promise(r=>setTimeout(r,ms));}
document.getElementById('stockAddBtn').onclick = () => {
  const input=document.getElementById('stockInput');
  let symbol=input.value.trim().toUpperCase();
  if(!symbol) return alert('請輸入股票代碼');
  if (stockCurrentMarket === 'tw') {
      const twSymbol = symbol.match(/\d+/);
      if (twSymbol) { symbol = twSymbol[0]; }
  }
  const list=stockWatchlist[stockCurrentMarket];
  if(list.includes(symbol)) return alert('股票已在清單');
  if(list.length >= 7) return alert('最多只能追蹤7支股票');
  list.push(symbol);
  input.value = '';
  loadStocks();
};

// [保留] 你的 openLink 函式 (不變)
function openLink(url) {
    window.open(url, '_blank');
}

// --- [新功能] "工作" 分頁的邏輯 ---

// 1. 待辦事項 (To-Do List) 邏輯
let todos = []; // 儲存所有待辦事項的陣列

// 載入 localStorage 中的資料
function loadTodos() {
  const storedTodos = localStorage.getItem('portalTodos');
  if (storedTodos) {
    todos = JSON.parse(storedTodos);
  }
  renderTodos();
}

// 儲存資料到 localStorage
function saveTodos() {
  localStorage.setItem('portalTodos', JSON.stringify(todos));
}

// 渲染待辦事項列表到畫面上
function renderTodos() {
  const listElement = document.getElementById('todoList');
  if (!listElement) return;
  listElement.innerHTML = ''; // 清空列表

  if (todos.length === 0) {
    listElement.innerHTML = '<li class="todo-item" style="color: #7a9794;">目前沒有待辦事項</li>';
    return;
  }

  todos.forEach((todo, index) => {
    const item = document.createElement('li');
    item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    item.innerHTML = `
      <span class="todo-item-text" data-index="${index}">${todo.text}</span>
      <button class="todo-delete-btn" data-index="${index}">刪除</button>
    `;
    listElement.appendChild(item);
  });
}

// 新增待辦事項
function addTodo() {
  const input = document.getElementById('todoInput');
  const text = input.value.trim();
  if (text) {
    todos.push({ text: text, completed: false });
    input.value = '';
    saveTodos();
    renderTodos();
  }
}

// 處理點擊事件 (標記完成 或 刪除)
function handleTodoClick(e) {
  const target = e.target;
  const index = target.dataset.index;
  if (index === undefined) return;

  if (target.classList.contains('todo-item-text')) {
    // 標記完成/未完成
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
  } else if (target.classList.contains('todo-delete-btn')) {
    // 刪除
    todos.splice(index, 1); // 從陣列中移除
    saveTodos();
    renderTodos();
  }
}

// 2. 快速筆記 (Quick Notes) 邏輯
function loadNotes() {
  const notesArea = document.getElementById('quickNotesArea');
  if (notesArea) {
    notesArea.value = localStorage.getItem('portalQuickNotes') || '';
  }
}

function saveNotes() {
  const notesArea = document.getElementById('quickNotesArea');
  if (notesArea) {
    localStorage.setItem('portalQuickNotes', notesArea.value);
    // (可以加入一個 "已儲存" の小提示)
  }
}

// 3. 番茄鐘 (Pomodoro Timer) 邏輯
let pomoInterval;
let pomoTimeLeft = 25 * 60; // 25 分鐘 (秒)
let pomoMode = 'work'; // 'work' 或 'break'
let isPomoRunning = false;

const pomoTimerDisplay = document.getElementById('pomodoroTimer');
const pomoStatusDisplay = document.getElementById('pomodoroStatus');
const pomoStartPauseBtn = document.getElementById('pomoStartPauseBtn');

function updatePomoDisplay() {
  const minutes = Math.floor(pomoTimeLeft / 60);
  const seconds = pomoTimeLeft % 60;
  if (pomoTimerDisplay) {
    pomoTimerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

function startPausePomo() {
  if (isPomoRunning) {
    // 暫停
    clearInterval(pomoInterval);
    isPomoRunning = false;
    if (pomoStartPauseBtn) pomoStartPauseBtn.textContent = '繼續';
  } else {
    // 開始/繼續
    isPomoRunning = true;
    if (pomoStartPauseBtn) pomoStartPauseBtn.textContent = '暫停';
    
    pomoInterval = setInterval(() => {
      pomoTimeLeft--;
      updatePomoDisplay();

      if (pomoTimeLeft < 0) {
        clearInterval(pomoInterval);
        // 時間到，切換模式
        if (pomoMode === 'work') {
          pomoMode = 'break';
          pomoTimeLeft = 5 * 60; // 5 分鐘休息
          // [修正] 亂碼 ?? -> ☕
          if (pomoStatusDisplay) pomoStatusDisplay.textContent = '休息時間 ☕';
          alert('工作時間結束！休息 5 分鐘。');
        } else {
          pomoMode = 'work';
          pomoTimeLeft = 25 * 60; // 25 分鐘工作
          // [修正] 亂碼 ?? -> 🧑‍💻
          if (pomoStatusDisplay) pomoStatusDisplay.textContent = '準備開始工作 🧑‍💻';
          alert('休息結束！準備開始工作。');
        }
        isPomoRunning = false;
        if (pomoStartPauseBtn) pomoStartPauseBtn.textContent = '開始';
        updatePomoDisplay();
      }
    }, 1000);
  }
}

function resetPomo() {
  clearInterval(pomoInterval);
  isPomoRunning = false;
  pomoMode = 'work';
  pomoTimeLeft = 25 * 60;
  updatePomoDisplay();
  if (pomoStartPauseBtn) pomoStartPauseBtn.textContent = '開始';
  // [修正] 亂碼 ?? -> 🧑‍💻
  if (pomoStatusDisplay) pomoStatusDisplay.textContent = '準備開始工作 🧑‍💻';
}
// --- 新功能 JS 結束 ---


// [新功能] 分頁切換的 JS 邏輯 (不變)
function initTabNavigation() {
    const tabs = document.querySelectorAll('.portal-tab-btn');
    const pages = document.querySelectorAll('.page-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const pageName = tab.dataset.page; // e.g., "home"
            
            // 1. 更新按鈕狀態
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 2. 切換頁面內容
            pages.forEach(page => {
                if (page.id === 'page-' + pageName) {
                    page.style.display = 'block';
                } else {
                    page.style.display = 'none';
                }
            });
            
            // 3. [修改] 根據不同分頁，執行不同的載入功能
            if (pageName === 'home') {
                 // 檢查首頁功能是否需要重新載入
                 const weatherRow = document.getElementById('weatherRow');
                 if (!weatherRow || !weatherRow.innerHTML.includes('weather-day-h')) {
                   updateWeather('locationSelectorNav'); // [修改] 觸發
                 }
                 const stockList = document.getElementById('stocksList');
                 if (!stockList || !stockList.innerHTML.includes('stock-item')) {
                   loadStocks();
                 }
                 const newsList = document.getElementById('newsList');
                 if (!newsList || !newsList.innerHTML.includes('news-item')) {
                   loadNews();
                 }
            
            } else if (pageName === 'work') {
                // D"工作" 分頁的資料
                // (確保番茄鐘顯示是正確的)
                updatePomoDisplay(); 
                loadTodos();
                loadNotes();
            }
        });
    });
}

// --- 程式碼開始執行 --- (不變)
// [修改] 確保所有程式碼都在 DOM 載入後執行
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 綁定分頁切換
    initTabNavigation();
    
    // 2. 初始載入 "首頁" 的所有功能
    updateDatetime();
    updateWeather('locationSelectorNav'); // [修改] 初始載入
    loadStocks();
    loadNews();
    
    // 3. 綁定首頁上的所有按鈕
    // (天氣/導覽列) [修改] 綁定兩個選擇器
    document.getElementById('locationSelectorNav').onchange = () => updateWeather('locationSelectorNav');
    document.getElementById('locationSelectorMain').onchange = () => updateWeather('locationSelectorMain');
    
    // (搜尋)
    document.getElementById('searchBtn').onclick = () => {
      const val=document.getElementById('searchInput').value.trim();
      if(!val) return;
      if(val.includes('.') && !val.includes(' ')) {
        window.open(val.startsWith('http') ? val : 'https://' + val, '_blank');
      } else {
        window.open('https://www.google.com/search?q=' + encodeURIComponent(val), '_blank');
      }
    };
    document.getElementById('searchInput').addEventListener('keypress', e =>{
      if(e.key === 'Enter') document.getElementById('searchBtn').click();
    });
    // (新聞)
    document.getElementById('tab-tw').onclick = () => switchNewsTab('tw');
    document.getElementById('tab-jp').onclick = () => switchNewsTab('jp');
    document.getElementById('tab-intl').onclick = () => switchNewsTab('intl');
    document.getElementById('refreshNewsBtn').onclick = loadNews;
    // (股票)
    document.getElementById('stockTab_tw').onclick = () => switchStockMarket('tw');
    document.getElementById('stockTab_us').onclick = () => switchStockMarket('us');
    document.getElementById('stockAddBtn').onclick = () => {
      const input=document.getElementById('stockInput');
      let symbol=input.value.trim().toUpperCase();
      if(!symbol) return alert('請輸入股票代碼');
      if (stockCurrentMarket === 'tw') {
          const twSymbol = symbol.match(/\d+/);
          if (twSymbol) { symbol = twSymbol[0]; }
      }
      const list=stockWatchlist[stockCurrentMarket];
      if(list.includes(symbol)) return alert('股票已在清單');
      if(list.length >= 7) return alert('最多只能追蹤7支股票');
      list.push(symbol);
      input.value = '';
      loadStocks();
    };
    // (地圖)
    document.getElementById('mapSearchBtn').onclick = searchGoogleMaps;
    document.getElementById('mapSearchInput').addEventListener('keypress', e => {
      if (e.key === 'Enter') searchGoogleMaps();
    });

    // [新功能] 綁定 "工作" 分頁的事件
    
    // 待辦事項
    const addTodoBtn = document.getElementById('addTodoBtn');
    if (addTodoBtn) addTodoBtn.onclick = addTodo;
    
    const todoInput = document.getElementById('todoInput');
    if (todoInput) todoInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') addTodo();
    });
    
    const todoList = document.getElementById('todoList');
    if (todoList) todoList.addEventListener('click', handleTodoClick);

    // 快速筆記
    const notesArea = document.getElementById('quickNotesArea');
    // 使用 'input' 事件，每次輸入都即時儲存
    if (notesArea) notesArea.addEventListener('input', saveNotes); 

    // 番茄鐘
    const pomoStartBtn = document.getElementById('pomoStartPauseBtn');
    if (pomoStartBtn) pomoStartBtn.onclick = startPausePomo;
    
    const pomoResetBtn = document.getElementById('pomoResetBtn');
    if (pomoResetBtn) pomoResetBtn.onclick = resetPomo;
    
});
