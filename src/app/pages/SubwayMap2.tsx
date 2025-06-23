"use client";

import React, { useRef, useState, useEffect } from "react";
import total from "@/data/total.json";

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

const lineColor = (lineId: string) => {
  if (lineId.includes("1")) return "#0052A4";
  if (lineId.includes("2")) return "#00A84D";
  if (lineId.includes("3")) return "#EF7C1C";
  if (lineId.includes("4")) return "#00A0E9";
  if (lineId.includes("5")) return "#996CAC";
  if (lineId.includes("6")) return "#CD7C2F";
  if (lineId.includes("7")) return "#747F00";
  if (lineId.includes("8")) return "#E6186C";
  if (lineId.includes("9")) return "#BDB092";
  return "#888";
};

export default function SeoulSubwayMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [selectedStation, setSelectedStation] = useState<SelectedStation | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

  const { paths, stations, labels } = total;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const viewBox = svg.getAttribute("viewBox") || "0 0 1525 1000";
    const [vbX, vbY, vbW, vbH] = viewBox.split(" ").map(Number);
    const container = svg.parentElement?.getBoundingClientRect();
    if (!container) return;

    const scaleW = container.width / vbW;
    const scaleH = container.height / vbH;
    const fitScale = Math.max(scaleW, scaleH);

    setScale(fitScale);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((prev) => Math.max(0.4, Math.min(5, prev + delta)));
    };

    const svg = svgRef.current;
    svg?.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg?.removeEventListener("wheel", handleWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const filteredStations = stations.filter((s) =>
    s.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const toggleLine = (lineId: string) => {
    setSelectedLine((prev) => (prev === lineId ? null : lineId));
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden",userSelect: "none" }}>
      <input
        placeholder="역 검색"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}
      />

      <button
        onClick={() => toggleLine("경의·중앙")}
        style={{ position: "absolute", top: 50, left: 10, zIndex: 10 }}
      >
        경의중앙선 토글
      </button>

      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 1525 1000"
        style={{
          width: "100%",
          height: "100%",
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: "top left",
          cursor: isDragging.current ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g id="paths">
          {paths.map((line, i) => (
            <g key={i} opacity={selectedLine && selectedLine !== line.name ? 0.1 : 1}>
              {line.paths.map((p, j) => (
                <path
                  key={j}
                  d={p.d}
                  fill="none"
                  stroke={lineColor(line.name)}
                  strokeWidth={p.strokeWidth || 2}
                  data-lineid={line.lineId}
                />
              ))}
            </g>
          ))}
        </g>

        <g id="stations">
          {filteredStations.map((s, i) => (
            <circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r || 3}
              fill="white"
              stroke="black"
              strokeWidth={1}
              data-name={s.name}
              onMouseEnter={() =>
                setTooltip({
                  x: s.cx * scale + position.x,
                  y: s.cy * scale + position.y,
                  text: s.name,
                })
              }
              onMouseLeave={() => setTooltip(null)}
              onClick={() => setSelectedStation({ name: s.name, cx: s.cx, cy: s.cy })}
              data-lineid={s.lineId}
            />
          ))}
        </g>

        <g id="labels">
          {labels.map(
            (l, i) =>
              l.x != null &&
              l.y != null && (
                <text key={i} x={l.x + 5} y={l.y - 5} fontSize="10" fill="black">
                  {l.name}
                </text>
              )
          )}
        </g>
      </svg>

      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            background: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            boxShadow: "0 0 5px rgba(0,0,0,0.3)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 50,
            fontSize: 12,
          }}
        >
          {tooltip.text}
        </div>
      )}

      {selectedStation && (
        <div
          style={{
            position: "absolute",
            left: selectedStation.cx * scale + position.x,
            top: selectedStation.cy * scale + position.y + 20,
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 10,
            zIndex: 50,
            width: 200,
            userSelect: "text",
          }}
        >
          <strong>{selectedStation.name}</strong>
          <br />상세정보 예시: 이 역에 대한 설명이나 연결 노선 정보 등을 표시하세요.
          <br />
          <button
            onClick={() => setSelectedStation(null)}
            style={{
              marginTop: 10,
              padding: "4px 8px",
              cursor: "pointer",
              border: "none",
              backgroundColor: "#eee",
              borderRadius: 4,
            }}
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}