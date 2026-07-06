import { NextResponse } from 'next/server';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ success: false, error: 'code parameter is required' }, { status: 400 });
    }

    // 1. Calculate dates for daily chart (past 300 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 300);

    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}${m}${d}`;
    };

    const startTime = formatDate(startDate);
    const endTime = formatDate(endDate);

    const dayUrl = `https://m.stock.naver.com/front-api/external/chart/domestic/info?symbol=${code}&requestType=1&startTime=${startTime}&endTime=${endTime}&timeframe=day`;
    const minuteUrl = `https://api.stock.naver.com/chart/domestic/item/{code}/minute`.replace('{code}', code);
    const integrationUrl = `https://m.stock.naver.com/api/stock/{code}/integration`.replace('{code}', code);

    // 2. Fetch day, minute, and integration details concurrently
    const [dayRes, minuteRes, integrationRes] = await Promise.all([
      fetch(dayUrl, { headers: { 'User-Agent': USER_AGENT, 'Referer': 'https://m.stock.naver.com/' }, next: { revalidate: 0 } }),
      fetch(minuteUrl, { headers: { 'User-Agent': USER_AGENT, 'Referer': 'https://m.stock.naver.com/' }, next: { revalidate: 0 } }),
      fetch(integrationUrl, { headers: { 'User-Agent': USER_AGENT, 'Referer': 'https://m.stock.naver.com/' }, next: { revalidate: 0 } }),
    ]);

    // Parse Day Candles
    let dayCandles: any[] = [];
    if (dayRes.ok) {
      const rawDayText = await dayRes.text();
      try {
        const cleanedText = rawDayText.replace(/'/g, '"');
        const rawDayData = JSON.parse(cleanedText);
        if (Array.isArray(rawDayData) && rawDayData.length > 1) {
          dayCandles = rawDayData.slice(1).map((row: any) => {
            const dateStr = row[0]; // YYYYMMDD
            const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
            return {
              time: formattedDate,
              open: Number(row[1]),
              high: Number(row[2]),
              low: Number(row[3]),
              close: Number(row[4]),
              volume: Number(row[5]),
            };
          }).slice(-150); // Get last 150 daily candles
        }
      } catch (parseErr: any) {
        console.error('Failed to parse daily stock candles:', parseErr.message);
      }
    }

    // Parse Minute Candles
    let minuteCandles: any[] = [];
    if (minuteRes.ok) {
      const rawMinuteData = await minuteRes.json();
      if (Array.isArray(rawMinuteData)) {
        const parsedMinutes = rawMinuteData.map((item: any) => {
          const str = item.localDateTime; // YYYYMMDDHHMMSS
          const year = parseInt(str.substring(0, 4));
          const month = parseInt(str.substring(4, 6)) - 1;
          const day = parseInt(str.substring(6, 8));
          const hour = parseInt(str.substring(8, 10));
          const minute = parseInt(str.substring(10, 12));
          const second = parseInt(str.substring(12, 14)) || 0;

          // Convert KST LocalDateTime string to UTC timestamp (timezone independent)
          const utcTime = Date.UTC(year, month, day, hour, minute, second) - 9 * 60 * 60 * 1000;
          return {
            time: Math.floor(utcTime / 1000),
            open: Number(item.openPrice),
            high: Number(item.highPrice),
            low: Number(item.lowPrice),
            close: Number(item.currentPrice),
            volume: Number(item.accumulatedTradingVolume),
          };
        });

        // De-accumulate volume for minute-specific volume bars
        minuteCandles = parsedMinutes.map((item: any, idx: number, arr: any[]) => {
          let volume = item.volume;
          if (idx > 0) {
            const diff = item.volume - arr[idx - 1].volume;
            volume = diff > 0 ? diff : 0;
          }
          return {
            ...item,
            volume,
          };
        });
      }
    }

    // Parse Integration Metrics
    let metrics = {
      marketCap: 'N/A',
      per: 'N/A',
      foreignRatio: 'N/A',
      high52: 'N/A',
    };

    if (integrationRes.ok) {
      const rawIntData = await integrationRes.json();
      const totalInfos = rawIntData.totalInfos || [];

      const getVal = (c: string) => {
        const found = totalInfos.find((info: any) => info.code === c);
        return found ? found.value : 'N/A';
      };

      let high52 = getVal('highPriceOf52Weeks');
      if (high52 !== 'N/A' && !high52.includes('원')) {
        high52 = `${high52}원`;
      }

      metrics = {
        marketCap: getVal('marketValue'),
        per: getVal('per'),
        foreignRatio: getVal('foreignRate'),
        high52: high52,
      };
    }

    return NextResponse.json({
      success: true,
      dayCandles,
      minuteCandles,
      metrics,
    });
  } catch (error: any) {
    console.error('Error fetching stock detail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
