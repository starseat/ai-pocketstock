'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './StockChart.module.css';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StockData {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
  direction: string;
}

interface StockChartProps {
  selectedStock?: StockData;
  theme: 'light' | 'dark';
  activeTab: 'day' | 'week' | 'month' | 'minute';
  setActiveTab: (tab: 'day' | 'week' | 'month' | 'minute') => void;
  dayCandles: ChartCandle[];
  weekCandles: ChartCandle[];
  monthCandles: ChartCandle[];
  minuteCandles: ChartCandle[];
}

interface ChartCandle {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 이동평균선(MA) 계산 함수
function calculateMA(data: ChartCandle[], period: number) {
  const maData = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      // 데이터 부족 시 이전 주가 그대로 보정
      maData.push({ time: data[i].time, value: data[i].close });
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    maData.push({ time: data[i].time, value: Math.round(sum / period) });
  }
  return maData;
}

export default function StockChart({
  selectedStock,
  theme,
  activeTab,
  setActiveTab,
  dayCandles,
  weekCandles,
  monthCandles,
  minuteCandles,
}: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [showTrend, setShowTrend] = useState<boolean>(true);
  const [candlesData, setCandlesData] = useState<ChartCandle[]>([]);
  const [enabledMAs, setEnabledMAs] = useState<Record<number, boolean>>({
    5: true,
    10: true,
    20: true,
    60: true,
  });

  // 외부(SWR)에서 들어온 데이터나 탭이 변경될 때 차트 데이터 동기화
  useEffect(() => {
    if (activeTab === 'day') {
      setCandlesData(dayCandles);
    } else if (activeTab === 'week') {
      setCandlesData(weekCandles);
    } else if (activeTab === 'month') {
      setCandlesData(monthCandles);
    } else {
      setCandlesData(minuteCandles);
    }
  }, [dayCandles, weekCandles, monthCandles, minuteCandles, activeTab]);

  // 실시간 가격 변동 발생 시 마지막 캔들 업데이트
  useEffect(() => {
    if (selectedStock && candlesData.length > 0) {
      setCandlesData((prev) => {
        const next = [...prev];
        const lastIdx = next.length - 1;
        
        if (activeTab === 'day' || activeTab === 'week' || activeTab === 'month') {
          next[lastIdx] = {
            ...next[lastIdx],
            high: Math.max(next[lastIdx].high, selectedStock.price),
            low: Math.min(next[lastIdx].low, selectedStock.price),
            close: selectedStock.price,
            volume: selectedStock.volume,
          };
        } else {
          // 분봉일 경우 마지막 캔들의 시간 범위 내에 있는지 확인
          const nowSeconds = Math.floor(Date.now() / 1000);
          const lastCandleTime = next[lastIdx].time as number;
          
          if (nowSeconds - lastCandleTime < 60) {
            next[lastIdx] = {
              ...next[lastIdx],
              high: Math.max(next[lastIdx].high, selectedStock.price),
              low: Math.min(next[lastIdx].low, selectedStock.price),
              close: selectedStock.price,
              volume: selectedStock.volume,
            };
          } else {
            // 새로운 분봉 추가
            next.push({
              time: Math.floor(Date.now() / 60000) * 60, // 분 단위로 버림
              open: next[lastIdx].close,
              high: selectedStock.price,
              low: selectedStock.price,
              close: selectedStock.price,
              volume: selectedStock.volume - next[lastIdx].volume > 0 ? selectedStock.volume - next[lastIdx].volume : 100,
            });
            if (next.length > 150) next.shift();
          }
        }
        return next;
      });
    }
  }, [selectedStock?.price, selectedStock?.volume, activeTab]);

  // TradingView Lightweight Charts 렌더링 훅
  useEffect(() => {
    if (!containerRef.current || candlesData.length === 0) return;

    let chart: any;

    // lightweight-charts는 window DOM이 필요하므로 dynamic import로 처리
    const initChart = async () => {
      const { createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries } = await import('lightweight-charts');

      if (!containerRef.current) return;

      // 이전 인스턴스 정리
      containerRef.current.innerHTML = '';

      const isDark = theme === 'dark';

      chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 480,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: isDark ? '#94a3b8' : '#444656',
          attributionLogo: false,
        },
        grid: {
          vertLines: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
          horzLines: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
        },
        timeScale: {
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        },
      });

      chartRef.current = chart;

      // 1. 캔들스틱 시리즈 생성
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#FF6B6B',
        downColor: '#4DABF7',
        borderVisible: false,
        wickUpColor: '#FF6B6B',
        wickDownColor: '#4DABF7',
      });
      candlestickSeries.setData(
        candlesData.map((c) => ({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      // 2. 이동평균선(MA) 시리즈 생성 (Show Trend 활성화 시)
      if (showTrend) {
        const maColors = ['#34D399', '#FBBF24', '#FB7185', '#818CF8'];
        const maPeriods = [5, 10, 20, 60];

        maPeriods.forEach((period, idx) => {
          if (enabledMAs[period]) {
            const maLine = chart.addSeries(LineSeries, {
              color: maColors[idx],
              lineWidth: idx === 3 ? 2 : 1.5,
              priceLineVisible: false,
            });
            maLine.setData(calculateMA(candlesData, period));
          }
        });
      }

      // 3. 거래량 히스토그램 시리즈 생성 (하단 오버레이)
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '', // 별도 scale 분리
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8, // 80% 위 공간 비움
          bottom: 0,
        },
      });

      volumeSeries.setData(
        candlesData.map((c) => ({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(255, 107, 107, 0.4)' : 'rgba(77, 171, 247, 0.4)',
        }))
      );

      // 반응형 크기 조절
      const handleResize = () => {
        if (containerRef.current && chart) {
          chart.resize(containerRef.current.clientWidth, 480);
        }
      };

      window.addEventListener('resize', handleResize);

      // 마지막 캔들 위치로 줌
      chart.timeScale().fitContent();

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chart) {
          chart.remove();
        }
      };
    };

    let cleanupPromise = initChart();

    return () => {
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, [candlesData, theme, showTrend, enabledMAs, activeTab]);

  if (!selectedStock) {
    return (
      <div className={`${styles.chartCard} glass-card`}>
        <p style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-secondary)' }}>
          차트 데이터를 구성하고 있습니다...
        </p>
      </div>
    );
  }

  const isUp = selectedStock.direction === '2';
  const isDown = selectedStock.direction === '5';
  let badgeClass = styles.flat;
  let sign = '';

  if (isUp) {
    badgeClass = styles.up;
    sign = '+';
  } else if (isDown) {
    badgeClass = styles.down;
    sign = '';
  }

  return (
    <div className={styles.container}>
      {/* Chart Toolbar */}
      <div className={`${styles.toolbar} glass-card`}>
        <div className={styles.leftControls}>
          {/* 일/주/월/분봉 토글 */}
          <div className={styles.pillSelector}>
            <button
              className={activeTab === 'day' ? styles.pillActive : ''}
              onClick={() => setActiveTab('day')}
            >
              일
            </button>
            <button
              className={activeTab === 'week' ? styles.pillActive : ''}
              onClick={() => setActiveTab('week')}
            >
              주
            </button>
            <button
              className={activeTab === 'month' ? styles.pillActive : ''}
              onClick={() => setActiveTab('month')}
            >
              월
            </button>
            <button
              className={activeTab === 'minute' ? styles.pillActive : ''}
              onClick={() => setActiveTab('minute')}
            >
              분
            </button>
          </div>

          {/* 이동평균선 레전드 */}
          <div className={styles.maIndicators}>
            {([
              [5, '#34D399'],
              [10, '#FBBF24'],
              [20, '#FB7185'],
              [60, '#818CF8'],
            ] as const).map(([period, color]) => {
              const isEnabled = enabledMAs[period];
              const suffix = activeTab === 'day' ? '일' : activeTab === 'week' ? '주' : activeTab === 'month' ? '월' : '분';
              return (
                <div
                  key={period}
                  className={`${styles.maIndicator} ${isEnabled ? '' : styles.maDisabled}`}
                  onClick={() => setEnabledMAs(prev => ({ ...prev, [period]: !prev[period] }))}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <span className={styles.maDot} style={{ backgroundColor: isEnabled ? color : '#ccc' }} />
                  <span style={{ textDecoration: isEnabled ? 'none' : 'line-through' }}>
                    {period}{suffix}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 추세 Toggles */}
        <div className={styles.rightControls}>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleBtn} ${showTrend ? styles.toggleBtnActive : ''}`}
              onClick={() => setShowTrend(true)}
            >
              추세 표시
            </button>
            <button
              className={`${styles.toggleBtn} ${!showTrend ? styles.toggleBtnActive : ''}`}
              onClick={() => setShowTrend(false)}
            >
              차트만 보기
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className={`${styles.chartCard} glass-card`}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.stockName}>
              {selectedStock.name}
              <span className={styles.stockCode}>{selectedStock.code}</span>
            </h2>
            <div className={styles.priceWrapper}>
              <span
                className={styles.currentPrice}
                style={{
                  color: isUp ? 'var(--krx-up)' : isDown ? 'var(--krx-down)' : 'var(--text-primary)',
                }}
              >
                {selectedStock.price.toLocaleString()}
              </span>
              <span className={`${styles.changeBadge} ${badgeClass}`}>
                {isUp && <ArrowUp size={14} style={{ marginRight: '2px' }} />}
                {isDown && <ArrowDown size={14} style={{ marginRight: '2px' }} />}
                {sign}
                {selectedStock.change.toLocaleString()} ({selectedStock.changeRate}%)
              </span>
            </div>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className={styles.chartWrapper} ref={containerRef} />
      </div>
    </div>
  );
}
