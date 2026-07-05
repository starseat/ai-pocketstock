# PocketStock (ai-pocketstock) 📈

> **AI 주식 모니터링 실시간 대시보드 (AI Stock Monitoring Real-time Dashboard)**

PocketStock은 네이버 금융 실시간 시세 API와 Next.js 16+, SWR, TradingView Lightweight Charts를 결합한 실시간 국내 시가총액 TOP 10 주식 모니터링 대시보드 프로젝트입니다. 아름다운 Glassmorphism UI와 프리미엄 디자인 요소를 Vanilla CSS로 구현하였습니다.

---

## ✨ 주요 기능 (Key Features)

1. **CORS 우회 실시간 시세 프록시 API**:
   - 브라우저의 CORS 제한을 우회하기 위해 Next.js Route Handler(서버 사이드)를 활용한 프록시 API(`app/api/stocks/route.ts`)를 구축했습니다.
   - 캐싱 방지(`next: { revalidate: 0 }`)와 네이버 금융 서버 차단 방지용 헤더가 구현되어 안전하고 실시간성이 보장된 데이터를 가져옵니다.

2. **SWR 기반 실시간 데이터 폴링**:
   - Vercel의 SWR(Stale-While-Revalidate) 라이브러리를 사용하여 포커스 재요청 및 네트워크 자동 복구를 지원합니다.
   - 대시보드 상단에서 실시간 조회 주기(5초 단위 등)를 동적으로 변경할 수 있습니다.

3. **TradingView Lightweight Charts 통합**:
   - 가볍고 고성능인 Canvas 기반 금융 전문 차트 라이브러리를 탑재했습니다.
   - 한국 주식 시장 표준 색상(상승: 빨간색, 하락: 파란색)이 반영된 **캔들스틱**, **이동평균선 (5/10/20/60일선)**, **거래량(Volume) 히스토그램**이 한 차트에 오버레이되어 렉 없는 줌/스크롤을 지원합니다.

4. **프리미엄 Glassmorphism & 다크 모드**:
   - TailwindCSS와 같은 프레임워크 의존성을 제거하고 표준 CSS 변수(`var(--*)`)와 CSS Modules를 사용해 고유하고 정교한 유리모피즘 테마를 구축했습니다.
   - 라이트 모드와 다크 모드를 완벽하게 지원합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

| 분류 | 사용 기술 | 설명 |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16+ (App Router)** | 서버 사이드 API 프록시 구성 및 SSR/Vercel 최적화 |
| **Language** | **TypeScript** | 안정적인 타입 선언 및 API 데이터 정적 컴파일 |
| **Data Fetching** | **SWR** | 네트워크 상태 복구 및 실시간 시세 폴링 |
| **Charting** | **Lightweight Charts (by TradingView)** | 캔들스틱 + 이동평균선 + 거래량의 고성능 차트 표현 |
| **Styling** | **Vanilla CSS + CSS Modules** | 다크모드 및 Glassmorphism 디자인 시스템 정밀 제어 |
| **Icons & Fonts** | **Lucide React, Outfit, Inter** | 미니멀하고 가독성 좋은 대시보드 UI 연출 |

---

## 📂 프로젝트 구조 (Project Structure)

```
ai-pocketstock/
├── design/                 # UI 디자인 목업 및 기획 가이드
│   ├── design.html
│   └── DESIGN.md
├── docs/                   # 프로젝트 명세 및 배포 가이드
│   ├── 01_ui_design_prompt.md
│   ├── 02_stock_lookup_method.md
│   ├── 03_tech_stack.md
│   ├── 04_development_plan.md
│   └── 06_vercel_deployment_guide.md
├── src/
│   └── app/                # Next.js App Router (Layout, Page, API Proxy)
│       ├── api/stocks/     # 실시간 시세 프록시 라우트
│       ├── globals.css     # 전역 테마 및 CSS 변수 정의
│       ├── layout.tsx
│       └── page.tsx
├── package.json
└── tsconfig.json
```

---

## 🚀 로컬 실행 방법 (How to Run)

프로젝트를 로컬 환경에서 설치하고 개발 서버를 실행하는 방법입니다.

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 서버 구동
```bash
npm run dev
```
브라우저를 열고 `http://localhost:3000`에 접속하여 대시보드가 정상적으로 렌더링되는지 확인합니다.

### 3. 빌드 및 프로덕션 실행
```bash
npm run build
npm run start
```

---

## 🌐 Vercel 배포 (Deployment)

이 프로젝트는 Vercel 배포에 최적화되어 있습니다. Git 저장소를 연결하고 배포 버튼을 누르는 것만으로 서버리스 API 프록시와 웹 페이지 배포가 완료됩니다. 상세한 방법은 `docs/06_vercel_deployment_guide.md` 문서를 참고해 주세요.
