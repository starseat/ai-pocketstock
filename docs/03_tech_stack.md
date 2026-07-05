# AI 주식 모니터링 대시보드 기술 스택 정의서 (Tech Stack Definition)

이 문서는 **Vercel** 배포 환경과 **네이버 금융 실시간 시세 API** 연동 규격([docs/stock_lookup_method.md](file:///Users/jw/workspace/study/ai/ai-pocketstock/docs/stock_lookup_method.md)), 그리고 대시보드 UI 디자인 기획([docs/ui_design_prompt.md](file:///Users/jw/workspace/study/ai/ai-pocketstock/docs/ui_design_prompt.md))을 바탕으로 정의된 최종 기술 스택과 아키텍처 구성안입니다.

---

## 1. 기술 스택 요약 (Tech Stack Summary)

| 분류 | 기술명 | 용도 및 선정 이유 |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | 서버 사이드 API 프록시(CORS 우회) 및 Vercel 배포 최적화 |
| **Language** | **TypeScript** | 정적 타입 지정을 통한 API 응답 데이터 안정성 확보 |
| **Styling** | **Vanilla CSS + CSS Modules** | CSS 변수 기반 다크 모드/유리모피즘(Glassmorphism) 및 정밀한 토스(Toss) 스타일 피드백 UI 구현 |
| **Data Fetching** | **SWR (by Vercel)** | 실시간 주식 시세 폴링(5~10초 주기) 및 자동 갱신 최적화 |
| **Charting** | **Lightweight Charts (by TradingView)** | 최고 성능의 금융 전용 캔들스틱 및 이동평균선(MA), 거래량 차트 구현 |
| **Icons** | **Lucide React** | 미니멀하고 세련된 핀테크 스타일 아이콘 세트 |
| **Fonts** | **Outfit & Inter** | 대시보드 가독성 극대화를 위한 프리미엄 구글 폰트 적용 |

---

## 2. 상세 컴포넌트 설계 및 아키텍처

### 2.1 Next.js App Router & 서버 프록시 (CORS 우회)
* **API Route (`app/api/stocks/route.ts`)**: 
  브라우저 환경에서 직접 `polling.finance.naver.com` 호출 시 CORS 이슈가 발생하므로, Next.js의 Route Handler(서버 사이드)를 활용해 프록시 역할을 수행합니다.
  * **주요 헤더**: `User-Agent` 및 `Referer: https://finance.naver.com/` 우회 헤더 설정
  * **캐싱 방지**: `next: { revalidate: 0 }` 설정을 통해 실시간 최신 데이터 조회를 보장합니다.
* **Vercel 최적화**: Next.js Route Handler는 Vercel Serverless Functions로 자동 배포되어 안정적인 트래픽 대응이 가능합니다.

### 2.2 SWR 기반 실시간 시세 폴링 (Data Fetching)
* **선정 이유**: 
  Vercel에서 관리하는 SWR 라이브러리는 **자동 재요청(Revalidation on Focus/Reconnect)** 및 **주기적인 폴링(Polling)** 기능을 기본으로 내장하고 있어, 주식 대시보드에 최적입니다.
* **폴링 주기**: 네이버 금융 서버의 IP 차단 리스크를 방지하기 위해 **5초(5000ms)** 주기를 유지합니다.
* **코드 예시**:
  ```typescript
  import useSWR from 'swr';

  const fetcher = (url: string) => fetch(url).then(res => res.json());

  export function useStockData() {
    const { data, error, isLoading } = useSWR('/api/stocks', fetcher, {
      refreshInterval: 5000, // 5초 간격으로 실시간 데이터 폴링
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    });

    return {
      stocks: data?.data || [],
      isLoading,
      isError: error
    };
  }
  ```

### 2.3 TradingView Lightweight Charts (차트 엔진)
* **선정 이유**: 
  범용 차트 라이브러리(Chart.js, Recharts 등) 대비 **금융 시계열 및 캔들스틱(Candlestick) 데이터 표현에 최적화**되어 있으며, Canvas 기반 렌더링으로 500개 이상의 캔들 데이터도 렉(Lag) 없이 부드러운 스크롤/줌을 지원합니다.
* **기능 구현 요건**:
  * **Candlestick Series**: 한국 주식 시장 표준 색상(상승: 빨간색 `#EF4444`, 하락: 파란색 `#3B82F6`) 설정
  * **Line Series (Moving Averages)**: 5, 10, 20, 60일 이동평균선(MA)을 서로 다른 색상의 라인 차트로 오버레이
  * **Histogram Series (Volume)**: 하단에 별도 패널 혹은 오버레이 형태로 거래량(Volume) 바 배치
  * **Custom Markers**: 고점/저점 화살표 어노테이션 및 최저/최고가 말풍선 표시

### 2.4 CSS Modules & Glassmorphic 디자인 시스템
* **선정 이유**: 
  TailwindCSS의 유틸리티 클래스 나열보다 **고급 Glassmorphism 효과(backdrop-filter), 복잡한 호버 미크로 인터랙션, 그리고 다크 모드 연동**을 정밀하게 관리하기 위해 CSS Modules 및 표준 CSS 변수(`var(--*)`) 체계를 사용합니다.
* **디자인 테마 제어**:
  `:root`와 `[data-theme="dark"]` 선택자에 색상 토큰을 선언하여 테마 변경 시 모든 카드의 배경색, 보더 투명도, 차트 테두리 등이 즉시 반응하도록 구성합니다.
* **디자인 토큰 구조**:
  ```css
  /* app/globals.css */
  :root {
    --bg-gradient: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    --card-bg: rgba(255, 255, 255, 0.7);
    --card-border: rgba(255, 255, 255, 0.4);
    --text-primary: #111827;
    --text-secondary: #4b5563;
    --shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.08);
  }

  [data-theme="dark"] {
    --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    --card-bg: rgba(30, 41, 59, 0.7);
    --card-border: rgba(255, 255, 255, 0.08);
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }
  ```

---

## 3. 개발 로드맵 및 검증 계획 (Milestones)

1. **Step 1: Next.js Boilerplate & API Proxy 구축**
   * Next.js + TypeScript 초기 프로젝트 셋업
   * `app/api/stocks/route.ts` 구현 및 로컬 데이터 통신 검증 (CORS 우회 동작 확인)
2. **Step 2: CSS Modules & Glassmorphic UI 레이아웃 설계**
   * 미니멀 핀테크 테마 정의 (`globals.css`)
   * 대시보드 기본 컨테이너, 헤더, 종목 선택 검색 창 및 날씨 요약 카드 마크업
3. **Step 3: Lightweight Charts 차트 연동**
   * `lightweight-charts` 설치 및 React 컴포넌트 래퍼 구현
   * 이동평균선(MA), 캔들스틱, 거래량 표시 및 실시간 갱신(SWR)과 차트 인터랙션 연결
4. **Step 4: Vercel 배포 및 최종 최적화**
   * Vercel 배포 설정 및 환경 검증
   * 모바일/데스크톱 반응형 레이아웃 대응 및 접근성 점검
