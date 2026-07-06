'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import styles from './MobileSearchOverlay.module.css';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: any[];
  onSelect: (code: string) => void;
}

export default function MobileSearchOverlay({
  isOpen,
  onClose,
  stocks,
  onSelect,
}: MobileSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 오버레이가 열릴 때 검색 입력창에 포커스를 주며 검색어를 초기화함
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
    }
  }, [isOpen]);

  // LIKE (부분 일치) 검색 필터링
  const filteredStocks = stocks.filter((stock) => {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return true; // 검색어 비어있으면 기본적으로 전체 노출
    return (
      stock.name.toLowerCase().includes(cleanQuery) ||
      stock.code.includes(cleanQuery)
    );
  });

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}>
      <div className={styles.searchBar}>
        <button className={styles.backButton} onClick={onClose}>
          <ArrowLeft size={22} />
        </button>
        <div className={styles.inputWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="종목명 또는 코드 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.resultsArea}>
        <h3 className={styles.title}>
          {query ? '검색 결과' : '시가총액 종목 목록'}
        </h3>
        <div className={styles.list}>
          {filteredStocks.length === 0 ? (
            <div className={styles.noResult} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
              검색 결과가 없습니다.
            </div>
          ) : (
            filteredStocks.map((stock) => {
              const isUp = stock.direction === '2';
              const isDown = stock.direction === '5';
              const priceColorClass = isUp
                ? styles.up
                : isDown
                ? styles.down
                : styles.flat;

              const sign = isUp ? '+' : '';

              return (
                <button
                  key={stock.code}
                  className={styles.item}
                  onClick={() => {
                    onSelect(stock.code);
                    onClose();
                  }}
                >
                  <div>
                    <span className={styles.stockName}>{stock.name}</span>
                    <span className={styles.stockCode}>{stock.code}</span>
                  </div>
                  <div className={styles.priceInfo}>
                    <div className={styles.price}>{stock.price?.toLocaleString()}원</div>
                    <div className={`${styles.changeRate} ${priceColorClass}`}>
                      {sign}{stock.changeRate}%
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
