import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'NPR', symbol: 'रु', name: 'Nepalese Rupee', locale: 'ne-NP' },
];

const CONVERSION_RATES = {
  INR: { NPR: 1.6, INR: 1 },
  NPR: { INR: 0.625, NPR: 1 }
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem('splitit_currency');
      return saved ? JSON.parse(saved) : CURRENCIES[0];
    } catch (e) {
      return CURRENCIES[0];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('splitit_currency', JSON.stringify(currency));
    } catch (e) {
      console.error('Failed to persist currency setting', e);
    }
  }, [currency]);

  const convertCurrency = (amount, from, to) => {
    const safeAmount = parseFloat(amount) || 0;
    const fromCode = from || 'INR';
    const toCode = to || currency.code || 'INR';
    
    if (fromCode === toCode) return safeAmount;
    const rate = CONVERSION_RATES[fromCode]?.[toCode];
    return rate ? safeAmount * rate : safeAmount;
  };

  const formatAmount = (amount, fromCurrency = 'INR') => {
    // Defensive checks
    if (amount === undefined || amount === null) return '₹0.00';
    
    const src = fromCurrency || 'INR';
    const target = currency?.code || 'INR';
    const locale = currency?.locale || 'en-IN';
    const symbol = currency?.symbol || '₹';

    const converted = convertCurrency(amount, src, target);
    
    // Smart decimal handling: hide .00 if whole number
    const isWhole = converted % 1 === 0;
    const fractionDigits = isWhole ? 0 : 2;

    if (target === 'NPR') {
      return `रु ${Number(converted).toLocaleString('en-IN', { 
        minimumFractionDigits: fractionDigits, 
        maximumFractionDigits: 2 
      })}`;
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: target,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: 2
      }).format(converted);
    } catch (e) {
      // Fallback for custom symbols or unsupported locales
      return `${symbol}${Number(converted).toLocaleString(undefined, { 
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: 2
      })}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, convertCurrency, CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
