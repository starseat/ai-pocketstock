'use client';

import React from 'react';
import styles from './StockSummary.module.css';
import { Sun, Cloud, CloudRain, TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react';

interface StockData {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
  direction: string;
}

interface StockSummaryProps {
  stock?: StockData;
  metrics?: {
    marketCap: string;
    per: string;
    foreignRatio: string;
    high52: string;
  } | null;
}

export default function StockSummary({ stock, metrics }: StockSummaryProps) {
  if (!stock) {
    return (
      <aside className={styles.aside}>
        <div className={`${styles.weatherCard} glass-card`}>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            종목 데이터를 로드 중입니다...
          </p>
        </div>
      </aside>
    );
  }

  const displayMetrics = metrics || {
    marketCap: '로드 중...',
    per: '로드 중...',
    foreignRatio: '로드 중...',
    high52: '로드 중...',
  };

  const isUp = stock.direction === '2';
  const isDown = stock.direction === '5';

  let WeatherIcon = Cloud; // default
  let weatherColor = 'rgba(116, 118, 135, 0.1)';
  let weatherStatusTitle = '보합세 및 관망 흐름';
  let weatherStatusDesc = '방향성을 탐색하며 박스권 내에서 등락을 거듭하고 있습니다.';
  let TrendIcon = Minus;

  if (isUp) {
    WeatherIcon = Sun;
    weatherColor = 'rgba(255, 107, 107, 0.15)';
    weatherStatusTitle = '상승 추세 유지 중';
    weatherStatusDesc = '단기 및 중기 이평선이 정배열을 형성하며 안정적인 우상향 흐름을 보이고 있습니다.';
    TrendIcon = TrendingUp;
  } else if (isDown) {
    WeatherIcon = CloudRain;
    weatherColor = 'rgba(77, 171, 247, 0.15)';
    weatherStatusTitle = '하락 조정 국면';
    weatherStatusDesc = '단기 저항선 돌파 실패로 인한 일시적 조정 국면입니다. 추가적인 매수 지지선 확인이 필요합니다.';
    TrendIcon = TrendingDown;
  }

  return (
    <aside className={styles.aside}>
      {/* 주식 날씨 요약 카드 */}
      <div className={`${styles.weatherCard} glass-card`}>
        <div
          className={styles.decorCircle}
          style={{ backgroundColor: weatherColor }}
        />
        <div className={styles.weatherHeader}>
          <div className={styles.weatherIconWrapper}>
            <WeatherIcon
              size={24}
              style={{
                color: isUp ? 'var(--krx-up)' : isDown ? 'var(--krx-down)' : 'var(--text-secondary)',
              }}
            />
          </div>
          <div>
            <h3 className={styles.weatherTitle}>주식 날씨 요약</h3>
            <p className={styles.weatherSubtitle}>최근 실시간 가격 분석 기준</p>
          </div>
        </div>

        <div className={styles.weatherBody}>
          <div
            className={styles.statusBox}
            style={{
              borderColor: isUp ? 'var(--krx-up)' : isDown ? 'var(--krx-down)' : 'var(--card-border)',
              background: isUp ? 'var(--krx-up-bg)' : isDown ? 'var(--krx-down-bg)' : 'var(--surface-container-low)',
            }}
          >
            <TrendIcon
              size={18}
              style={{
                marginTop: '2px',
                color: isUp ? 'var(--krx-up)' : isDown ? 'var(--krx-down)' : 'var(--text-secondary)',
                flexShrink: 0,
              }}
            />
            <div>
              <span
                className={styles.statusBoxTitle}
                style={{
                  color: isUp ? 'var(--krx-up)' : isDown ? 'var(--krx-down)' : 'var(--text-primary)',
                }}
              >
                {weatherStatusTitle}
              </span>
              <span className={styles.statusBoxDesc}>{weatherStatusDesc}</span>
            </div>
          </div>
          <div className={styles.statusBox}>
            <BarChart2
              size={18}
              style={{ marginTop: '2px', color: 'var(--primary)', flexShrink: 0 }}
            />
            <div>
              <span className={styles.statusBoxTitle}>거래량 모니터링</span>
              <span className={styles.statusBoxDesc}>
                현재 거래량 {stock.volume.toLocaleString()}주 수준으로, 시장 관심도가 유지되고 있는 패턴입니다.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 핵심 지표 Bento Box */}
      <div className={`${styles.statsCard} glass-card`}>
        <h4 className={styles.statsTitle}>핵심 지표</h4>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>시가총액</span>
            <span className={styles.statValue}>{displayMetrics.marketCap}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>PER</span>
            <span className={styles.statValue}>{displayMetrics.per}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>외인소진율</span>
            <span className={styles.statValue}>{displayMetrics.foreignRatio}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>52주 최고</span>
            <span className={styles.statValue}>{displayMetrics.high52}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
