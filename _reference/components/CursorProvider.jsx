import React, { useState, useEffect } from 'react';
import { CursorContext } from './CursorContext';
import { useDeviceDetection } from '../../../../hooks/useDeviceDetection';
import PointRing from '../variants/PointRing';
import Spotlight from '../variants/Spotlight';

/**
 * 커스텀 커서 Provider
 * 
 * Props:
 * @param {ReactNode} children - Provider 내부에 렌더링될 컴포넌트들 [Required]
 * 
 * Example usage:
 * <CursorProvider>
 *   <App />
 * </CursorProvider>
 */
function CursorProvider({ children }) {
  const [cursorState, setCursorState] = useState({ 
    variant: 'default',
    color: '#000000',
    pointSize: 8,
    ringSize: 32,
    delay: 50,
    spotlight: { radius: 150, intensity: 0.3 }
  });
  const { isTouchDevice } = useDeviceDetection();

  // 커서 상태 변경 이벤트 리스너
  useEffect(() => {
    const handleCursorStateChange = (event) => {
      const newState = event.detail;
      setCursorState(prev => ({ ...prev, ...newState }));
    };

    window.addEventListener('cursorStateChange', handleCursorStateChange);
    
    return () => {
      window.removeEventListener('cursorStateChange', handleCursorStateChange);
    };
  }, []);

  // 터치 기기에서는 커서 비활성화
  if (isTouchDevice) {
    return <>{children}</>;
  }

  const setState = (newState) => {
    setCursorState(prev => ({ ...prev, ...newState }));
  };

  const renderCursor = () => {
    switch (cursorState.variant) {
      case 'point-ring':
        return <PointRing state={cursorState} />;
      case 'spotlight':
        return <Spotlight state={cursorState} />;
      default:
        return null;
    }
  };

  return (
    <CursorContext.Provider value={{ state: cursorState, setState }}>
      {children}
      {renderCursor()}
    </CursorContext.Provider>
  );
}

export default CursorProvider; 