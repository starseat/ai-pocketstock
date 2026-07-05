'use client';

import React from 'react';
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
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>오늘의 시가총액 TOP 10</h3>
      <div className={styles.list}>
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
