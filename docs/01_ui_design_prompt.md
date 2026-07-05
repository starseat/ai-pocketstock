# UI 개선 디자인 프롬프트 (스티치용)

이 문서는 이미지 생성 AI(스티치)가 원본(`stock_example_tpr_labs.png`)의 모든 주식 분석 기능을 그대로 탑재하면서도, 주식 초보자가 한눈에 이해하고 쉽게 다중 종목을 조회할 수 있도록 개선된 대시보드를 생성하게 만들기 위한 고도화된 프롬프트입니다. 스티치가 결과물 화면(이미지)에 반드시 **한글(Korean Hangul)** 텍스트를 출력하도록 강력한 지시어를 포함하고 있습니다.

아래 영어 프롬프트 영역 전체를 복사해서 스티치에게 전달해 보세요!

---

**[프롬프트 복사 영역]**

**Main Subject**: 
A high-end, extremely modern and clean financial stock market monitoring dashboard web UI/UX, designed for absolute beginners to understand complex data easily. The layout is spacious, using a premium glassmorphic card container with soft blur and drop shadows (similar to Toss app fintech style).

**Core Elements & Layout**:
1. **Header Area**:
   - Logo in the top-left: A cool, modern English brand logo "PocketStock" (representing "간편 주식 조회").
   - Navigation: Simple, clean tabs "종목분석" and "시장분석" in Korean.
   - **Stock Selector (Dropdown/Search)**: Instead of static text, show an interactive search input field with the placeholder "종목 검색 또는 선택..." in Korean, with "SK하이닉스 (000660)" selected as the active stock.
   - Theme Toggle: A sleek dark mode switch labeled "어둡게".
2. **Chart Option Bar (Below Header)**:
   - Timeframe Tabs: Clean sliding toggle buttons labeled "일봉" and "분봉".
   - Indicators checkboxes: 
     - Moving Averages: Color-coded checkboxes "5", "10", "20", "60" (each with a tiny color indicator line next to the number matching the lines on the chart).
     - Trend Toggles: Checkboxes labeled "추세표시" and "전체추세".
     - Peak/Trough Toggles: Checkboxes labeled "고점" and "저점".
     - Candle Count Input: "캔들 개수: [ 2139 ]" styled as a modern numeric input box with small plus/minus spinner buttons.
3. **Main Candlestick Chart (Center)**:
   - A single, large, high-contrast Candlestick chart showing KRX-style red (bullish/up) and blue (bearish/down) candles.
   - Shaded background vertical zones: Alternating soft, translucent pastel red and green vertical stripes showing bullish/bearish periods in the background.
   - Four smooth moving average lines overlaying the candles, color-coded to match the checkboxes.
   - A horizontal dotted red line indicating the current price level, pointing to a red price tag badge on the right axis displaying a value like "234,500".
   - **Korean Annotations & Markers**: Arrow indicators pointing to the highest and lowest points on the chart with labels: "최저 2,045,000 (18.58%)" at the bottom trough, and "최고 2,900,000 (-12.58%)" at the top peak.
4. **Volume & Sub-Charts**:
   - Volume Bar Chart: Soft volume bars at the bottom aligned with the time axis.
   - Technical indicator line chart: A clean line chart at the very bottom with minor grid lines showing indicator values.
5. **Beginner-Friendly Extension**:
   - A clean "주식 날씨 요약" (Stock Summary Card) card on the side or top, showing a simple badge: "상승 추세 유지 중" and "거래량 안정적".
   - Small question mark icons "(?)" next to technical words like "이평선" or "거래량" for tooltips to help beginners.

**CRITICAL LINGUISTIC RULE - MUST BE IN KOREAN**:
- All UI text, labels, toggles, menus, stock names, and chart annotations inside the generated UI image MUST be written in the Korean language (Hangul) as specified (e.g. "PocketStock" is English, but all others: "SK하이닉스", "어둡게", "일봉", "분봉", "추세표시", "전체추세", "고점", "저점", "캔들 개수", "최저", "최고" must be Korean).

**Style & Aesthetics**:
- Ultra-minimalist modern fintech app design, light theme, high-end feel.
- Glassmorphism, translucent panels, and massive amounts of negative space (whitespace) to prevent cognitive overload.
- Soft pastel tones for red and blue, clean typography using Inter/Outfit style.
- **Mobile Responsive Design**: Optimized for both desktop and mobile. On mobile, the header collapses navigation into a hamburger menu and search bar into a search icon, and option controls align in a horizontally scrollable row. The right sidebar cards stack neatly under the main chart.

**Format**: 
A side-by-side presentation showing both Desktop UI (16:9 screen) and Mobile UI (vertical viewport) layouts in a single image. Dribbble style mockup, web application layout, responsive web design showcase, 8k resolution, photorealistic dashboard, extreme minimal design, --ar 16:9
