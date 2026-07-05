import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// KOSPI와 KOSDAQ 시가총액 상위 종목을 조회하여 병합 후 TOP 10 종목을 반환
async function fetchMarketCapTop10() {
  try {
    const kospiUrl = 'https://m.stock.naver.com/api/json/sise/siseListJson.nhn?menu=market_sum&sosok=0&pageSize=10&page=1';
    const kosdaqUrl = 'https://m.stock.naver.com/api/json/sise/siseListJson.nhn?menu=market_sum&sosok=1&pageSize=10&page=1';

    const [kospiRes, kosdaqRes] = await Promise.all([
      fetch(kospiUrl, { headers: { 'User-Agent': USER_AGENT, 'Referer': 'https://finance.naver.com/' }, next: { revalidate: 0 } }),
      fetch(kosdaqUrl, { headers: { 'User-Agent': USER_AGENT, 'Referer': 'https://finance.naver.com/' }, next: { revalidate: 0 } })
    ]);

    const kospiData = kospiRes.ok ? await kospiRes.json() : { result: { itemList: [] } };
    const kosdaqData = kosdaqRes.ok ? await kosdaqRes.json() : { result: { itemList: [] } };

    const kospiItems = kospiData.result?.itemList || [];
    const kosdaqItems = kosdaqData.result?.itemList || [];

    const combined = [...kospiItems, ...kosdaqItems];
    
    // marketSumRaw를 기준으로 내림차순 정렬
    combined.sort((a: any, b: any) => (b.marketSumRaw || 0) - (a.marketSumRaw || 0));

    // 상위 10개 추출
    return combined.slice(0, 10).map((item: any) => ({
      code: item.cd,
      name: item.nm
    }));
  } catch (error) {
    console.error('Failed to fetch market cap top 10:', error);
    // API 장애 발생 시 기본 KOSPI TOP 10 반환
    return [
      { code: '005930', name: '삼성전자' },
      { code: '000660', name: 'SK하이닉스' },
      { code: '373220', name: 'LG에너지솔루션' },
      { code: '207940', name: '삼성바이오로직스' },
      { code: '005380', name: '현대차' },
      { code: '000270', name: '기아' },
      { code: '068270', name: '셀트리온' },
      { code: '105560', name: 'KB금융' },
      { code: '055550', name: '신한지주' },
      { code: '005490', name: 'POSCO홀딩스' }
    ];
  }
}

export async function GET() {
  try {
    // 1. config/stocks.json 파일에서 사용자 설정 종목 목록 읽기
    const configPath = path.join(process.cwd(), 'config', 'stocks.json');
    const fileContents = await fs.readFile(configPath, 'utf8');
    const customStocksConfig = JSON.parse(fileContents);
    const customTickers: string[] = customStocksConfig.map((s: { code: string }) => s.code);

    // 2. 실시간 시가총액 TOP 10 종목 가져오기 (config/stocks.json과 무관)
    const top10Config = await fetchMarketCapTop10();
    const top10Tickers: string[] = top10Config.map(s => s.code);

    // 3. 중복 제거된 전체 종목 목록 만들기
    const allTickersSet = new Set([...customTickers, ...top10Tickers]);
    const allTickers = Array.from(allTickersSet);

    if (allTickers.length === 0) {
      return NextResponse.json({ success: true, customStocks: [], top10Stocks: [] });
    }

    // 4. 네이버 금융 폴링 API를 통해 실시간 데이터 조회
    const query = `SERVICE_ITEM:${allTickers.join(',')}`;
    const url = `https://polling.finance.naver.com/api/realtime?query=${query}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://finance.naver.com/',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error('네이버 금융 API 호출 실패');
    }

    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('euc-kr');
    const decodedText = decoder.decode(buffer);
    const data = JSON.parse(decodedText);

    if (!data.result || !data.result.areas || !data.result.areas[0] || !data.result.areas[0].datas) {
      throw new Error('올바르지 않은 데이터 형식 수신');
    }

    const rawDataList = data.result.areas[0].datas;
    const stockDataMap = new Map();

    rawDataList.forEach((item: any) => {
      stockDataMap.set(item.cd, {
        code: item.cd,                     // 종목코드
        name: item.nm,                     // 종목명
        price: item.nv,                    // 현재가
        change: item.cv,                   // 전일비
        changeRate: item.cr,               // 등락률
        volume: item.aq,                   // 거래량
        direction: item.rf,                // 등락 방향 (2: 상승, 3: 보합, 5: 하락 등)
      });
    });

    // 5. 각각의 그룹으로 데이터 정렬 및 매핑
    const customStocks = customTickers
      .map(code => stockDataMap.get(code))
      .filter(Boolean);

    const top10Stocks = top10Tickers
      .map(code => stockDataMap.get(code))
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      customStocks,
      top10Stocks
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
