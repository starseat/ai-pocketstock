'use client';

import React, { useState, useEffect } from 'react';
import styles from './StockList.module.css';

interface StockData {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
  direction: string; // 2: 상승, 3: 보합, 5: 하락 등
}

interface StockListProps {
  stocks: StockData[];
  selectedCode: string;
  onSelect: (code: string) => void;
}

export default function StockList({
  stocks,
  selectedCode,
  onSelect,
}: StockListProps) {
  // 모바일에서는 기본적으로 접힌 상태, 데스크탑에서는 펼친 상태
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsOpen(!e.matches);
    };
    handleChange(mq);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={styles.container}>
      {/* 제목 + 토글 버튼 */}
      <button
        className={styles.titleRow}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <h3 className={styles.title}>오늘의 시가총액 TOP 10</h3>
        <span
          className={styles.chevron}
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>

      {/* 접히는 영역 */}
      <div className={`${styles.list} ${isOpen ? styles.listOpen : styles.listClosed}`}>
        {stocks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
            데이터를 불러오는 중입니다...
          </div>
        ) : (
          stocks.map((stock) => {
            const isUp = stock.direction === '2';
            const isDown = stock.direction === '5';

            let badgeClass = styles.flat;
            let sign = '';
            let icon = '';

            if (isUp) {
              badgeClass = styles.up;
              sign = '+';
              icon = '▲';
            } else if (isDown) {
              badgeClass = styles.down;
              sign = '';
              icon = '▼';
            }

            return (
              <div
                key={stock.code}
                className={`${styles.item} ${
                  stock.code === selectedCode ? styles.activeItem : ''
                }`}
                onClick={() => onSelect(stock.code)}
              >
                <div className={styles.stockInfo}>
                  <span className={styles.name}>{stock.name}</span>
                  <span className={styles.code}>{stock.code}</span>
                </div>
                <div className={styles.priceInfo}>
                  <span className={styles.price}>
                    {stock.price.toLocaleString()}원
                  </span>
                  <span className={`${styles.changeRate} ${badgeClass}`}>
                    {icon} {sign}
                    {stock.change.toLocaleString()} ({stock.changeRate}%)
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
