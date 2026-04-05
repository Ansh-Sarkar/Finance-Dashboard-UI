import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { formatCurrency } from '../../utils/helpers';

const LIME = 'var(--bar-lime)';
const MID = 'var(--bar-mid)';
const TOP = 'var(--bar-top)';

/**
 * Pseudo-isometric stacked bars (2.5D): static scene, hover highlights a bar + tooltip.
 */
export default function D3IsoStackedBars({ bars = [], height = 320 }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState(null);

  const measure = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(Math.max(320, el.clientWidth));
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    window.addEventListener('resize', measure);
    queueMicrotask(measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const layout = useMemo(() => {
    const skew = 14;
    const floorY = height * 0.78;
    const maxStack = d3.max(bars, (d) => d.lime + d.mid + d.top) || 1;
    const barW = Math.min(72, (width - 120) / Math.max(3, bars.length) - 16);
    const gap = (width - bars.length * barW - 80) / (bars.length + 1);
    const startX = 40 + gap;

    return bars.map((b, i) => {
      const total = b.lime + b.mid + b.top;
      const scale = (0.55 * height) / maxStack;
      const hL = b.lime * scale;
      const hM = b.mid * scale;
      const hT = b.top * scale;
      const baseX = startX + i * (barW + gap);
      return { ...b, baseX, barW, floorY, hL, hM, hT, total, skew };
    });
  }, [bars, width, height]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);

    const grid = svg.append('g').attr('opacity', 0.35);
    for (let gx = 0; gx < width; gx += 40) {
      grid
        .append('line')
        .attr('x1', gx)
        .attr('x2', gx + 80)
        .attr('y1', height)
        .attr('y2', height - 120)
        .attr('stroke', 'var(--chart-grid)')
        .attr('stroke-width', 1);
    }

    const g = svg.append('g');

    layout.forEach((d, idx) => {
      const bx = d.baseX;
      const bw = d.barW;
      const skew = d.skew;
      const y0 = d.floorY;

      const drawFace = (yBase, h, fill, opacity = 1) => {
        const path = [
          `M ${bx} ${yBase}`,
          `L ${bx + bw} ${yBase}`,
          `L ${bx + bw + skew} ${yBase - h}`,
          `L ${bx + skew} ${yBase - h}`,
          'Z',
        ].join(' ');
        return { path, yTop: yBase - h, fill, opacity };
      };

      const faces = [
        drawFace(y0, d.hL, LIME),
        drawFace(y0 - d.hL, d.hM, MID),
        drawFace(y0 - d.hL - d.hM, d.hT, TOP),
      ];

      const barG = g.append('g').attr('class', `iso-bar-${idx}`).style('cursor', 'pointer');

      faces.forEach((f) => {
        barG
          .append('path')
          .attr('d', f.path)
          .attr('fill', f.fill)
          .attr('opacity', f.opacity)
          .attr('stroke', 'rgba(0,0,0,0.06)')
          .attr('stroke-width', 0.5);
      });

      barG
        .append('path')
        .attr(
          'd',
          [
            `M ${bx + bw} ${y0}`,
            `L ${bx + bw + skew} ${y0}`,
            `L ${bx + bw + skew} ${y0 - d.hL - d.hM - d.hT}`,
            `L ${bx + bw} ${y0 - d.hL - d.hM - d.hT}`,
            'Z',
          ].join(' ')
        )
        .attr('fill', 'rgba(0,0,0,0.12)');

      barG
        .append('rect')
        .attr('x', bx)
        .attr('y', y0 - d.hL - d.hM - d.hT - 8)
        .attr('width', bw)
        .attr('height', d.hL + d.hM + d.hT + 8)
        .attr('fill', 'transparent')
        .on('mouseenter', () => setHover({ ...d, idx }))
        .on('mouseleave', () => setHover(null));
    });
  }, [layout, width, height]);

  return (
    <div ref={wrapRef} className="relative w-full">
      <svg ref={svgRef} className="w-full" role="img" aria-label="Portfolio-style stacked metrics" />
      {hover && (
        <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[240px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-panel)] px-4 py-3 shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {hover.label}
          </p>
          <p className="mt-1 text-lg font-extrabold text-[var(--text-primary)]">
            {formatCurrency(hover.total)}
          </p>
          <ul className="mt-2 space-y-1 text-xs font-semibold text-[var(--text-secondary)]">
            <li className="flex justify-between gap-4">
              <span className="text-[var(--bar-top)]">Savings / equity</span>
              <span>{formatCurrency(hover.top)}</span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-[var(--bar-mid)]">Recurring</span>
              <span>{formatCurrency(hover.mid)}</span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-[var(--bar-lime)]">Variable spend</span>
              <span>{formatCurrency(hover.lime)}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
