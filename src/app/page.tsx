'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import Header from '../components/Header';
import StockList from '../components/StockList';
import StockChart from '../components/StockChart';
import StockSummary from '../components/StockSummary';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCode, setSelectedCode] = useState<string>('000660'); // default SK하이닉스
  const [pollingInterval, setPollingInterval] = useState<number>(5000); // default 5초
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month' | 'minute'>('day');

  // 테마 초기화 및 변경
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // SWR 실시간 데이터 폴링 설정
  const { data, error } = useSWR('/api/stocks', fetcher, {
    refreshInterval: pollingInterval,
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  });

  // 선택된 종목의 상세 데이터 (차트 이력 및 보조지표) 조회
  const { data: detailData, error: detailError } = useSWR(
    selectedCode ? `/api/stocks/detail?code=${selectedCode}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const customStocks = data?.success ? data.customStocks : [];
  const top10Stocks = data?.success ? data.top10Stocks : [];
  const allStocks = [...customStocks, ...top10Stocks];
  const selectedStock = allStocks.find((s: any) => s.code === selectedCode) || allStocks[0];

  const dayCandles = detailData?.success ? detailData.dayCandles : [];
  const weekCandles = detailData?.success ? detailData.weekCandles : [];
  const monthCandles = detailData?.success ? detailData.monthCandles : [];
  const minuteCandles = detailData?.success ? detailData.minuteCandles : [];
  const metrics = detailData?.success ? detailData.metrics : null;

  // 로딩 상태 및 에러 핸들링
  const hasError = error || detailError || (data && !data.success);

  return (
    <>
      {/* Top Navigation */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pollingInterval={pollingInterval}
        onChangeInterval={setPollingInterval}
        stocks={customStocks}
        onSelectStock={setSelectedCode}
      />

      {/* Main Container */}
      <div
        className="dashboard-main"
        style={{
          paddingTop: '88px',
          paddingBottom: '48px',
          paddingLeft: 'max(16px, env(safe-area-inset-left))',
          paddingRight: 'max(16px, env(safe-area-inset-right))',
          maxWidth: '1600px',
          margin: '0 auto',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Error Alert Box */}
        {hasError && (
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'var(--krx-up-bg)',
              color: 'var(--krx-up)',
              border: '1px solid var(--krx-up)',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            시세 데이터를 업데이트하지 못했습니다. (네트워크 상태 또는 API 응답 오류)
          </div>
        )}

        {/* Layout Grid (Responsive 3-Column layout) */}
        <div className="dashboard-grid">
          {/* Left Column: Ticker list */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <StockList
              stocks={top10Stocks}
              selectedCode={selectedCode}
              onSelect={setSelectedCode}
            />
          </div>

          {/* Center Column: Charts */}
          <div>
            <StockChart
              selectedStock={selectedStock}
              theme={theme}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              dayCandles={dayCandles}
              weekCandles={weekCandles}
              monthCandles={monthCandles}
              minuteCandles={minuteCandles}
            />
          </div>

          {/* Right Column: Context summaries */}
          <div>
            <StockSummary stock={selectedStock} metrics={metrics} />
          </div>
        </div>
      </div>

      {/* Responsive Layout CSS helper */}
      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: minmax(260px, 320px) 1fr minmax(260px, 320px);
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 300px 1fr !important;
          }
          .dashboard-grid > div:last-child {
            grid-column: span 2;
          }
        }
        @media (max-width: 768px) {
          .dashboard-main {
            padding-top: 72px !important;
          }
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .dashboard-grid > div {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </>
  );
}
