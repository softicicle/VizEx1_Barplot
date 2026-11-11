import { useState } from "react";
import * as d3 from "d3";
import "./BarChart.css";

// D3 does the math (scales, color, sums); React renders every element.

const WIDTH = 800;
const HEIGHT = 650;
const MARGIN = { top: 8, right: 12, bottom: 24, left: 112 };
const X_MAX = 75;
const X_TICKS = d3.range(0, X_MAX + 1, 25); // 0, 25, 50, 75

// Okabe-Ito colorblind-safe palette, one color per continent.
const CONTINENT_COLORS = {
  Europe: "#0072B2",
  "North America": "#E69F00",
  Asia: "#009E73",
  Oceania: "#CC79A7",
  "South America": "#D55E00",
};

const color = d3
  .scaleOrdinal()
  .domain(Object.keys(CONTINENT_COLORS))
  .range(Object.values(CONTINENT_COLORS));

const hoverColor = (continent) => d3.color(color(continent)).darker().formatHex();

const SORT_OPTIONS = [
  { value: "descending", label: "By country" },
  { value: "continent", label: "By continent" },
];

function sortData(data, mode, continentTotals) {
  const byStudents = (a, b) => b.students - a.students;
  if (mode === "continent") {
    return [...data].sort(
      (a, b) =>
        continentTotals.get(b.continent) - continentTotals.get(a.continent) ||
        a.continent.localeCompare(b.continent) ||
        byStudents(a, b)
    );
  }
  return [...data].sort(byStudents);
}

const pct = (part, whole) => `${((part / whole) * 100).toFixed(1)}%`;

function BarChart({ data }) {
  const [sortMode, setSortMode] = useState("descending");
  const [hovered, setHovered] = useState(null); // { row, x, y }

  const total = d3.sum(data, (d) => d.students);
  const continentTotals = d3.rollup(
    data,
    (rows) => d3.sum(rows, (d) => d.students),
    (d) => d.continent
  );

  const sorted = sortData(data, sortMode, continentTotals);

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const y = d3
    .scaleBand()
    .domain(sorted.map((d) => d.country))
    .range([0, innerHeight])
    .padding(0.15);

  const x = d3.scaleLinear().domain([0, X_MAX]).range([0, innerWidth]);

  const handleMove = (event, row) => {
    const box = event.currentTarget.ownerSVGElement.getBoundingClientRect();
    setHovered({ row, x: event.clientX - box.left, y: event.clientY - box.top });
  };

  return (
    <div className="bar-chart" style={{ width: WIDTH }}>
      {/* Right padding lines the legend up with the last gridline (75) */}
      <div className="bar-chart__controls" style={{ paddingRight: MARGIN.right }}>
        <div className="toggle-group" role="group" aria-label="Sort order">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={sortMode === option.value ? "is-selected" : ""}
              aria-pressed={sortMode === option.value}
              onClick={() => setSortMode(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <ul className="legend">
          {color.domain().map((continent) => (
            <li key={continent}>
              <span className="legend__swatch" style={{ background: color(continent) }} />
              {continent}
            </li>
          ))}
        </ul>
      </div>

      <div className="bar-chart__plot">
        <svg width={WIDTH} height={HEIGHT} role="img" aria-label="Students by country">
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {/* Value axis: gridlines + tick labels */}
            {X_TICKS.map((tick) => (
              <g key={tick} transform={`translate(${x(tick)},0)`}>
                <line y2={innerHeight} className="chart-grid" />
                <text y={innerHeight + 16} textAnchor="middle" className="chart-text">
                  {tick}
                </text>
              </g>
            ))}

            {/* Bars, country labels, value labels */}
            {sorted.map((d) => {
              const isHovered = hovered?.row.country === d.country;
              const barY = y(d.country);
              return (
                <g key={d.country}>
                  <text
                    x={-MARGIN.left}
                    y={barY + y.bandwidth() / 2}
                    dy="0.35em"
                    textAnchor="start"
                    className="chart-text"
                  >
                    {d.country}
                  </text>
                  <rect
                    x={0}
                    y={barY}
                    width={x(d.students)}
                    height={y.bandwidth()}
                    rx={5}
                    ry={5}
                    fill={isHovered ? hoverColor(d.continent) : color(d.continent)}
                    onMouseMove={(event) => handleMove(event, d)}
                    onMouseLeave={() => setHovered(null)}
                  />
                  <text
                    x={x(d.students) + 4}
                    y={barY + y.bandwidth() / 2}
                    dy="0.35em"
                    className="chart-text"
                  >
                    {d.students}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {hovered && (
          <div
            className="tooltip"
            style={{
              top: hovered.y + 12,
              ...(hovered.x > WIDTH / 2
                ? { right: WIDTH - hovered.x + 12 }
                : { left: hovered.x + 12 }),
            }}
          >
            <strong>
              {hovered.row.country} {hovered.row.students} students
            </strong>
            <div>
              {pct(hovered.row.students, continentTotals.get(hovered.row.continent))} of{" "}
              {hovered.row.continent} · {pct(hovered.row.students, total)} of all students
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BarChart;
