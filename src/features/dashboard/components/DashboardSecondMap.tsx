'use client';

import { useEffect, useRef, useState } from 'react';

interface Tooltip {
  x: number;
  y: number;
  text: string;
}

interface SelectedStation {
  name: string;
  cx: number;
  cy: number;
}

export default function SeoulSubwayMap() {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [selectedStation, setSelectedStation] = useState<SelectedStation | null>(null);
  const [searchText, setSearchText] = useState('');
  const [stationElements, setStationElements] = useState<SVGCircleElement[]>([]);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

  // --- 초기 SVG 로드 + 이벤트 바인딩 + 중심 확대 세팅 ---
  useEffect(() => {
    const fetchSvg = async () => {
      const res = await fetch('/test.svg');
      const svgText = await res.text();
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = svgText;

        const svgRoot = svgContainerRef.current.querySelector('svg');
        if (!svgRoot) return;

        // SVG 뷰박스 읽기 (외곽 여백 제거 및 중심 계산용)
        const viewBoxStr = svgRoot.getAttribute('viewBox') || '0 0 1525 1000';
        const [vbX, vbY, vbWidth, vbHeight] = viewBoxStr.split(' ').map(Number);

        const containerRect = svgContainerRef.current.getBoundingClientRect();
        const initialScale = containerRect.width / vbWidth;
        setScale(initialScale);
        setPosition({
          x: containerRect.width / 2 - (vbWidth / 2) * initialScale,
          y: containerRect.height / 2 - (vbHeight / 2) * initialScale,
        });

        // 모든 역 circle elements 저장
        const stations = Array.from(svgRoot.querySelectorAll('circle')) as SVGCircleElement[];
        setStationElements(stations);

        stations.forEach(station => {
          station.addEventListener('mouseenter', () => {
            const cx = parseFloat(station.getAttribute('cx') || '0');
            const cy = parseFloat(station.getAttribute('cy') || '0');
            const name = station.getAttribute('data-name') || 'Unknown Station';

            setTooltip({
              x: cx * scale + position.x,
              y: cy * scale + position.y,
              text: name,
            });

            station.style.fill = 'red';
          });
          station.addEventListener('mouseleave', () => {
            setTooltip(null);
            station.style.fill = '';
          });

          station.addEventListener('click', () => {
            const cx = parseFloat(station.getAttribute('cx') || '0');
            const cy = parseFloat(station.getAttribute('cy') || '0');
            const name = station.getAttribute('data-name') || 'Unknown Station';

            setSelectedStation({ name, cx, cy });
          });
        });
      }
    };

    fetchSvg();
  }, []);

  // --- 확대/축소, 드래그, 모바일 핀치 줌 이벤트 바인딩 ---
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.max(0.1, Math.min(10, prev + delta)));
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // 모바일 핀치 줌 변수
    let lastTouchDist: number | null = null;

    const getTouchDistance = (touches: TouchList) => {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        lastTouchDist = getTouchDistance(e.touches);
      } else if (e.touches.length === 1) {
        isDragging.current = true;
        dragStart.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const dist = getTouchDistance(e.touches);
        if (lastTouchDist !== null) {
          const delta = (dist - lastTouchDist) / 100;
          setScale(prev => Math.max(0.1, Math.min(10, prev + delta)));
        }
        lastTouchDist = dist;
      } else if (e.touches.length === 1 && isDragging.current) {
        setPosition({
          x: e.touches[0].clientX - dragStart.current.x,
          y: e.touches[0].clientY - dragStart.current.y,
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        lastTouchDist = null;
      }
      if (e.touches.length === 0) {
        isDragging.current = false;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [position]);

  // --- 검색 필터 ---
  useEffect(() => {
    if (!stationElements.length) return;
    stationElements.forEach(station => {
      const name = station.getAttribute('data-name')?.toLowerCase() || '';
      if (searchText.trim() === '' || name.includes(searchText.toLowerCase())) {
        station.style.display = '';
      } else {
        station.style.display = 'none';
      }
    });
  }, [searchText, stationElements]);

  // --- selectedLine 변경 시 opacity 조절 ---
  useEffect(() => {
    if (!svgContainerRef.current) return;
    const svgRoot = svgContainerRef.current.querySelector('svg');
    if (!svgRoot) return;

    // 모든 노선 path, 역 circle 등 선택
    const allElements = svgRoot.querySelectorAll('[lineId]');
    if (!selectedLine) {
      allElements.forEach(el => ((el as HTMLElement).style.opacity = '1'));
      return;
    }

    allElements.forEach(el => {
      const lineId = el.getAttribute('lineId');
      (el as HTMLElement).style.opacity = lineId === selectedLine ? '1' : '0.1';
    });
  }, [selectedLine]);

  // 노선 토글 핸들러
  const toggleLine = (lineId: string) => {
    setSelectedLine(prev => (prev === lineId ? null : lineId));
  };

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#f5f5f5',
        }}
      >
        {/* 검색 바 */}
        <input
          type="text"
          placeholder="역 이름 검색"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 40,
            padding: '6px 12px',
            fontSize: 14,
            borderRadius: 4,
            border: '1px solid #ccc',
            width: 200,
          }}
        />

        {/* 노선 토글 버튼 */}
        <button
          onClick={() => toggleLine('gyeongui_jungang')}
          style={{
            position: 'absolute',
            top: 50,
            left: 10,
            zIndex: 40,
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid #333',
            backgroundColor: selectedLine === 'gyeongui_jungang' ? '#ddd' : '#fff',
            cursor: 'pointer',
          }}
        >
          경의중앙선 토글
        </button>

        {/* SVG 컨테이너 */}
        <div
          ref={svgContainerRef}
          style={{
            width: '100%',
            height: '100%',
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'top left',
            cursor: isDragging.current ? 'grabbing' : 'grab',
            userSelect: 'none',
            position: 'absolute',
          }}
        />

        {/* 툴팁 */}
        {tooltip && (
          <div
            style={{
              position: 'absolute',
              left: tooltip.x + 10,
              top: tooltip.y + 10,
              background: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              boxShadow: '0 0 5px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 50,
              fontSize: 12,
            }}
          >
            {tooltip.text}
          </div>
        )}

        {/* 선택된 역 상세정보 */}
        {selectedStation && (
          <div
            style={{
              position: 'absolute',
              left: selectedStation.cx * scale + position.x,
              top: selectedStation.cy * scale + position.y + 20,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: 6,
              padding: 10,
              zIndex: 50,
              width: 200,
              userSelect: 'text',
            }}
          >
            <strong>{selectedStation.name}</strong>
            <br />
            상세정보 예시: 이 역에 대한 설명이나 연결 노선 정보 등을 표시하세요.
            <br />
            <button
              onClick={() => setSelectedStation(null)}
              style={{
                marginTop: 10,
                padding: '4px 8px',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: '#eee',
                borderRadius: 4,
              }}
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </>
  );
}