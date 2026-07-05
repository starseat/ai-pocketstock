'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.css';
import { Search, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pollingInterval: number;
  onChangeInterval: (interval: number) => void;
  stocks: any[];
  onSelectStock: (code: string) => void;
}

export default function Header({
  theme,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  pollingInterval,
  onChangeInterval,
  stocks,
  onSelectStock,
}: HeaderProps) {
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // LIKE (부분 일치) 검색 필터링
  const filteredStocks = stocks.filter((stock) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true; // 비어 있으면 전체 리스트 표시
    return (
      stock.name.toLowerCase().includes(query) ||
      stock.code.includes(query)
    );
  });

  return (
    <header className={styles.header}>
      <div className={styles.logoArea}>
        <h1 className={styles.logo}>PocketStock</h1>
      </div>

      <div className={styles.searchArea}>
        <div className={styles.searchWrapper} ref={dropdownRef}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="종목명 또는 코드 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          
          {isFocused && (
            <div className={styles.dropdown}>
              {filteredStocks.length === 0 ? (
                <div className={styles.noResult}>검색 결과가 없습니다.</div>
              ) : (
                filteredStocks.map((stock) => (
                  <div
                    key={stock.code}
                    className={styles.dropdownItem}
                    onClick={() => {
                      onSelectStock(stock.code);
                      onSearchChange(''); // 선택 후 검색어 초기화
                      setIsFocused(false); // 드롭다운 닫기
                    }}
                  >
                    <span className={styles.stockName}>{stock.name}</span>
                    <span className={styles.stockCode}>{stock.code}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {/* Polling Interval Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={styles.intervalLabel}>갱신 주기</span>
          <select
            className={styles.intervalSelector}
            value={pollingInterval}
            onChange={(e) => onChangeInterval(Number(e.target.value))}
          >
            <option value={5000}>5초</option>
            <option value={10000}>10초</option>
            <option value={15000}>15초</option>
            <option value={30000}>30초</option>
            <option value={60000}>60초</option>
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button className={styles.controlButton} onClick={onToggleTheme}>
          {theme === 'light' ? (
            <Moon size={18} style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <Sun size={18} style={{ color: 'var(--text-secondary)' }} />
          )}
          <span style={{ display: 'inline-block' }}>
            {theme === 'light' ? '어둡게' : '밝게'}
          </span>
        </button>
      </div>
    </header>
  );
}
