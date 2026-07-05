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
  const [selectedCode, setSelectedCode] = useState<string>('005930'); // default 삼성전자
  const [pollingInterval, setPollingInterval] = useState<number>(5000); // default 5초

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
  const { data, error, isLoading } = useSWR('/api/stocks', fetcher, {
    refreshInterval: pollingInterval,
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  });

  const customStocks = data?.success ? data.customStocks : [];
  const top10Stocks = data?.success ? data.top10Stocks : [];
  const allStocks = [...customStocks, ...top10Stocks];
  const selectedStock = allStocks.find((s: any) => s.code === selectedCode) || allStocks[0];

  // 로딩 상태 및 에러 핸들링
  const hasError = error || (data && !data.success);

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
        style={{
          paddingTop: '88px',
          paddingBottom: '32px',
          paddingLeft: 'max(20px, env(safe-area-inset-left))',
          paddingRight: 'max(20px, env(safe-area-inset-right))',
          maxWidth: '1600px',
          margin: '0 auto',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 320px) 1fr minmax(280px, 320px)',
            gap: '24px',
            alignItems: 'start',
          }}
          className="dashboard-grid"
        >
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
            <StockChart selectedStock={selectedStock} theme={theme} />
          </div>

          {/* Right Column: Context summaries */}
          <div>
            <StockSummary stock={selectedStock} />
          </div>
        </div>
      </div>

      {/* Responsive Layout CSS helper */}
      <style jsx global>{`
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 320px 1fr !important;
          }
          .dashboard-grid > div:last-child {
            grid-column: span 2;
          }
        }
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-grid > div {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </>
  );
}
