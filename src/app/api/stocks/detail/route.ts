import { NextResponse } from 'next/server';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// 네이버 금융 외부 차트 API에서 timeframe별 캔들을 조회하여 가공하는 헬퍼 함수
async function fetchCandles(code: string, timeframe: string, startTime: string, endTime: string): Promise<any[]> {
  const url = `https://m.stock.naver.com/front-api/external/chart/domestic/info?symbol=${code}&requestType=1&startTime=${startTime}&endTime=${endTime}&timeframe=${timeframe}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Referer': 'https://m.stock.naver.com/' },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];

    const text = await res.text();
    const cleanedText = text.replace(/'/g, '"');
    const rawData = JSON.parse(cleanedText);

    if (Array.isArray(rawData) && rawData.length > 1) {
      return rawData.slice(1).map((row: any) => {
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
      }).slice(-150); // 최근 150개 캔들만 리턴
    }
  } catch (err: any) {
    console.error(`Failed to parse ${timeframe} stock candles:`, err.message);
  }
  return [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ success: false, error: 'code parameter is required' }, { status: 400 });
    }

    // YYYYMMDD 포맷 구하기 (최근 300일 전 데이터 확보)
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

    const minuteUrl = `https://api.stock.naver.com/chart/domestic/item/{code}/minute`.replace('{code}', code);
    const integrationUrl = `https://m.stock.naver.com/api/stock/{code}/integration`.replace('{code}', code);

    // 2. 일봉, 주봉, 월봉, 분봉 및 통합 지표를 동시 병렬 요청
    const [dayCandles, weekCandles, monthCandles, minuteRes, integrationRes] = await Promise.all([
      fetchCandles(code, 'day', startTime, endTime),
      fetchCandles(code, 'week', startTime, endTime),
      fetchCandles(code, 'month', startTime, endTime),
      fetch(minuteUrl, { headers: { 'User-Agent': USER_AGENT, 'Referer': 'https://m.stock.naver.com/' }, next: { revalidate: 0 } }),
      fetch(integrationUrl, { headers: { 'User-Agent': USER_AGENT, 'Referer': 'https://m.stock.naver.com/' }, next: { revalidate: 0 } }),
    ]);

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
      weekCandles,
      monthCandles,
      minuteCandles,
      metrics,
    });
  } catch (error: any) {
    console.error('Error fetching stock detail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
