# 국내 주식 실시간 시세 조회 가이드

이 문서는 계좌 개설이나 복잡한 API 키 발급 없이, 국내 주식 시세를 실시간으로 안전하게 가져오기 위한 아키텍처 및 구현 방안을 정리한 문서입니다.

## 1. 개요 및 데이터 소스
* **데이터 제공처**: 네이버 금융 (Naver Finance)
* **방식**: 네이버 금융 내부 실시간 시세 폴링(Polling) API 연동
* **특징**:
  * 계좌 개설, 공인인증서, API Key 발급 불필요 (무료)
  * 수 초 단위의 실시간 데이터 갱신
  * 국내 주식 시가총액 TOP 10 종목을 대상으로 함

## 2. API 엔드포인트 정보
* **기본 URL**: `https://polling.finance.naver.com/api/realtime`
* **쿼리 파라미터**: `query=SERVICE_ITEM:{종목코드1},{종목코드2},...`
* **호출 예시**:
  ```http
  GET https://polling.finance.naver.com/api/realtime?query=SERVICE_ITEM:005930,000660
  ```

### 국내 시가총액 TOP 10 종목 코드 목록
| 순위 | 종목명 | 종목 코드 |
| :--- | :--- | :--- |
| 1 | 삼성전자 | `005930` |
| 2 | SK하이닉스 | `000660` |
| 3 | LG에너지솔루션 | `373220` |
| 4 | 삼성바이오로직스 | `207940` |
| 5 | 현대차 | `005380` |
| 6 | 기아 | `000270` |
| 7 | 셀트리온 | `068270` |
| 8 | KB금융 | `105560` |
| 9 | 신한지주 | `055550` |
| 10 | POSCO홀딩스 | `005490` |

---

## 3. Next.js 서버사이드 API 구현 방안 (CORS 우회)
브라우저에서 직접 네이버 API를 호출하면 CORS(Cross-Origin Resource Sharing) 제한으로 인해 통신이 차단됩니다. 이를 우회하기 위해 Next.js의 Route Handler(서버사이드)에서 데이터를 프록시(Proxy)하여 프론트엔드로 전달합니다.

### 예시 코드: `app/api/stocks/route.ts`
```typescript
import { NextResponse } from 'next/server';

const TOP_10_TICKERS = [
  '005930', // 삼성전자
  '000660', // SK하이닉스
  '373220', // LG에너지솔루션
  '207940', // 삼성바이오로직스
  '005380', // 현대차
  '000270', // 기아
  '068270', // 셀트리온
  '105560', // KB금융
  '055550', // 신한지주
  '005490', // POSCO홀딩스
];

export async function GET() {
  try {
    const query = TOP_10_TICKERS.map(ticker => `SERVICE_ITEM:${ticker}`).join(',');
    const url = `https://polling.finance.naver.com/api/realtime?query=${query}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://finance.naver.com/',
      },
      next: { revalidate: 0 }, // 캐시하지 않고 항상 새로운 데이터를 가져옴
    });

    if (!response.ok) {
      throw new Error('네이버 금융 API 호출 실패');
    }

    const data = await response.json();
    
    // 데이터 구조 변환 및 필요한 값 정제
    const stockList = data.result.areas[0].datas.map((item: any) => ({
      code: item.cd,                     // 종목코드
      name: item.nm,                     // 종목명
      price: item.nv,                    // 현재가 (closePrice)
      change: item.cv,                   // 전일비 (compareToPreviousClosePrice)
      changeRate: item.cr,               // 등락률 (fluctuationsRatio)
      volume: item.aq,                   // 거래량 (accumulatedTradingVolume)
      direction: item.rf,                // 등락 방향 (2: 상승, 3: 보합, 5: 하락 등)
    }));

    return NextResponse.json({ success: true, data: stockList });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

---

## 4. 프론트엔드 React 실시간 폴링 예시
대시보드 화면에서는 Next.js API Route를 정기적으로 호출하여 실시간처럼 가격이 변하도록 렌더링합니다.

### 예시 코드 (React Component)
```typescript
'use client';

import { useEffect, useState } from 'react';

export default function StockDashboard() {
  const [stocks, setStocks] = useState<any[]>([]);

  const fetchStocks = async () => {
    try {
      const res = await fetch('/api/stocks');
      const json = await res.json();
      if (json.success) {
        setStocks(json.data);
      }
    } catch (err) {
      console.error('시세 조회 실패:', err);
    }
  };

  useEffect(() => {
    fetchStocks(); // 최초 1회 즉시 실행
    
    const interval = setInterval(() => {
      fetchStocks();
    }, 5000); // 5초 간격으로 시세 갱신

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>국내 시가총액 TOP 10 실시간 시세</h1>
      <ul>
        {stocks.map(stock => (
          <li key={stock.code}>
            {stock.name} ({stock.code}): {stock.price.toLocaleString()}원 
            <span style={{ color: stock.direction === '2' ? 'red' : 'blue' }}>
              {' '}{stock.change > 0 ? '+' : ''}{stock.change.toLocaleString()} ({stock.changeRate}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 5. 주의 및 권장사항
* **서버 부하 주의**: 실시간 시세를 갱신하기 위해 브라우저에서 너무 잦은 요청(예: 1초 미만)을 보내는 것은 네이버 서버 측 IP 차단의 원인이 될 수 있습니다. **5초 ~ 10초 내외**의 갱신 주기를 권장합니다.
* **비공식 API 의존성**: 네이버 내부 API의 주소나 응답 포맷이 바뀌는 경우 대시보드 연동이 중단될 수 있으므로, 작동되지 않을 경우 이 파일의 `url`과 JSON 파싱 로직을 점검해야 합니다.
