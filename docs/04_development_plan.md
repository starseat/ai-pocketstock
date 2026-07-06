# AI 주식 모니터링 대시보드 개발 및 검증 계획서 (Development & Verification Plan) - 일/주/월 차트 조회 개정

이 문서는 별도 폴더의 `config/stocks.json` 파일에서 종목 목록을 수기로 관리할 수 있는 기능, 모바일 반응형 UI 고도화 계획, 유연한 문자열 부분 일치(LIKE) 검색 기능, 그리고 차트를 일/주/월 단위로 전환하여 조회하는 기능(다중 타임프레임 지원)을 종합적으로 반영한 보완 계획서입니다.

---

## 1. 개발 로드맵 및 태스크 (Milestones)

### Step 1: 프로젝트 환경 설정 및 패키지 설치 [완료]
* Next.js 프로젝트 설정 및 라이브러리(`swr`, `lightweight-charts`, `lucide-react`) 설치 완료.

### Step 2: 수기 종목 관리 파일 추가 및 API Route 개정
* **목적**: 사용자가 직접 종목을 관리할 수 있는 `config/stocks.json` 파일을 추가하고, 서버 사이드 API가 이를 동적으로 참조하여 데이터를 조회하게 합니다.
* **주요 작업**:
  * 별도 설정 디렉토리 내에 **[config/stocks.json](file:///Users/jw/workspace/study/ai/ai-pocketstock/config/stocks.json)** 생성 완료
  * `src/app/api/stocks/route.ts` 에서 `config/stocks.json`을 읽어와서 동적으로 API 쿼리 주소를 생성하도록 개정 완료.
  * **상세 조회 API 개정**: `src/app/api/stocks/detail/route.ts` 에서 `timeframe` 쿼리 파라미터(`day` | `week` | `month`)를 수신하도록 개정하여, 각 타임프레임 단위에 매칭되는 과거 캔들스틱 데이터를 동적으로 제공하도록 설계.

### Step 3: CSS Modules 기반 디자인 시스템 및 다크모드 보완 [완료]
* **목적**: 다크모드 및 모바일용 유틸리티 클래스를 반영하도록 CSS를 고도화합니다.

### Step 4: UI 컴포넌트 개발 및 상태 관리 (반응형, LIKE 검색, 일/주/월 차트 연동)
* **목적**: 모바일 반응형 레이아웃, 검색 추천 드롭다운 등을 구현하고 동적 종목 데이터와 일/주/월 단위 차트 조회를 연동합니다.
* **주요 작업**:
  * **일/주/월 차트 해상도 전환(Timeframe Toggle) 구현**:
    - `StockChart.tsx` 툴바의 일봉/분봉 토글 영역을 확장하여 **일봉 / 주봉 / 월봉** 토글 버튼으로 대체 설계.
    - 선택된 탭 상태(`activeTab`)를 부모인 `page.tsx` 또는 `StockChart.tsx` 내에서 관리하고, SWR 상세 API 호출 쿼리(예: `timeframe=week`)에 실시간 바인딩.
  * **유연한 LIKE 검색 알고리즘 구현**:
    - 검색창 입력값과 종목명/종목코드 간 대소문자 무시, 공백 무시, 부분 일치(LIKE) 조건 검증 로직 작성.
  * `src/components/Header.tsx`
    - 데스크톱용 검색창 포커스 시 추천 종목 드롭다운 구현 (LIKE 검색 필터링 적용)
    - 미니멀 갱신 주기 적용 제어 영역 구성
  * `src/components/StockList.tsx` (종목 선택 상태 및 오늘의 시가총액 TOP 10 접기/펴기 인터랙션 연동)
  * `src/components/StockChart.tsx` (일/주/월 탭 추가 및 타임프레임별 캔들/이동평균선 데이터 연동)
  * `src/components/StockSummary.tsx` (우측 날씨 요약 및 핵심 지표 카드)
  * `src/app/page.tsx` 에서 SWR 데이터 바인딩 및 타임프레임 상태 관리 연동

---

## 2. 검증 및 테스트 계획 (Verification & Test Plan)

### 테스트 시나리오 및 검증 항목

| 테스트 ID | 대상 기능 | 검증 방법 및 기대 결과 |
| :--- | :--- | :--- |
| **TC-01** | 환경 설정 | `npm run build` 및 `npm run dev` 시 정상적으로 로컬 서버가 빌드 및 구동되는지 확인. |
| **TC-02** | 프록시 API | `/api/stocks` 호출 시, `config/stocks.json`을 올바르게 읽어 CORS 오류 없이 실시간 데이터가 JSON 포맷으로 반환되는지 확인. |
| **TC-03** | 테마 토글 | 다크 모드/라이트 모드 버튼 클릭 시 `document.documentElement`에 `dark` 클래스가 정상 토글되며 Glassmorphism 카드 테마가 실시간 변환되는지 확인. |
| **TC-04** | 실시간 폴링 | SWR이 `/api/stocks`에 자동으로 요청을 보내고 UI가 갱신되는지 네트워크 탭을 통해 확인. (기본 5초) |
| **TC-05** | 폴링 주기 변경 | 헤더의 주기 설정 드롭다운 값을 변경 시, 네트워크 탭의 `/api/stocks` 호출 주기가 설정값으로 전환되는지 검증. |
| **TC-06** | 주식 차트 | `lightweight-charts` 차트 캔버스 영역에 선택된 종목의 캔들스틱, 이동평균선(5/10/20/60일선), 거래량 차트가 정상 표출되는지 확인. |
| **TC-07** | 종목 선택 변경 | 검색 바 또는 목록에서 다른 종목을 선택했을 때 차트 및 우측 요약 카드의 데이터가 해당 종목으로 즉시 업데이트되는지 확인. |
| **TC-08** | 드롭다운 추천 | 데스크톱 해상도에서 검색창 포커스 시 추천 종목 드롭다운 목록이 열리고, 다른 곳을 클릭하면 닫히는지 확인. |
| **TC-09** | 수기 종목 추가 | **[config/stocks.json](file:///Users/jw/workspace/study/ai/ai-pocketstock/config/stocks.json)** 에 수기로 새 종목을 추가한 뒤 화면의 종목 리스트와 검색창에서 해당 신규 종목이 동적으로 노출되는지 확인. |
| **TC-10** | LIKE 검색 기능 | 검색창에 대소문자를 다르게 하거나 일부 공백을 넣어도 유연하게 해당 종목이 자동 추천 및 필터링되는지 검증. |
| **TC-11** | 일/주/월 차트 전환 | 차트 툴바에서 **일, 주, 월** 탭을 클릭하여 변경 시, SWR 상세 조회 API(`/api/stocks/detail`)가 선택한 `timeframe` 파라미터(`day` | `week` | `month`)를 전송해 알맞은 캔들 데이터를 불러와 차트를 리렌더링하는지 검증. |

---

## 3. 테스트 실행 및 대응 절차

1. 각 Step의 개발 완료 후, 로컬 개발 서버(`http://localhost:3000`) 환경에서 위 검증 시나리오에 따라 수동 및 스크립트 기반 테스트를 수행합니다.
2. 테스트 결과를 정리하여 `docs/05_test_results.md`로 작성합니다.
3. 테스트 실패가 발생할 경우:
   * 실패 원인을 추적하고 코드를 수정합니다.
   * 수정 후 재검증을 진행하여 통과 여부를 재기록합니다.
