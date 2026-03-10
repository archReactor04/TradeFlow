import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    document.title = location.pathname === '/'
      ? 'TradeFlow'
      : `TradeFlow - ${location.pathname.slice(1).replace(/-/g, ' ')}`;
  }, [location]);

  return null;
}
