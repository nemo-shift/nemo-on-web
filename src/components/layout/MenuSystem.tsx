'use client';

import React, { useState } from 'react';
import SideMenu from './SideMenu';
import MenuToggle from './MenuToggle';

/**
 * MenuSystem 컴포넌트 (v13.0)
 *
 * SideMenu + MenuToggle의 isOpen 상태를 단일 지점에서 관리하는 클라이언트 래퍼.
 * layout.tsx(Server Component)에 배치하여 전역에서 렌더링.
 *
 * 구조:
 * - MenuToggle: fixed 위치 독립형 버튼 (z-index MENU_TOGGLE: 10003)
 * - SideMenu: 3중 레이어 슬라이드 패널 (z-index MENU: 10002)
 */
export default function MenuSystem(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen  = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const handleToggle = () => setIsOpen(prev => !prev);

  return (
    <>
      {/* 독립형 모핑 토글 버튼 (항상 최상위 고정) */}
      <MenuToggle isOpen={isOpen} onToggle={isOpen ? handleClose : handleOpen} />

      {/* 3중 레이어 사이드메뉴 */}
      <SideMenu isOpen={isOpen} onClose={handleClose} />
    </>
  );
}
