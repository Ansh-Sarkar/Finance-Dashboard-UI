import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { formatCurrency } from '../../utils/helpers';

/**
 * Radial "total activity" burst: static layout, interactive hover on spokes.
 * `percentage` drives average spoke reach (e.g. savings / income ratio visual).
 */
export default function D3ActivityRadial({
  percentage = 26,
  segments = [],
  size = 300,
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dims, setDims] = useState({ width: size, height: size });
  const [tip, setTip] = useState(null);

  const spokeData = useMemo(() => {
    const n = 56;
    const seed = segments.length
      ? segments
      : d3.range(n).map((i) => ({
          weight: 0.55 + 0.35 * Math.sin((i / n) * Math.PI * 2) ** 2,
        }));
    return d3.range(n).map((i) => {
      const w = seed[i % seed.length]?.weight ?? 0.65;
      const jitter = 0.92 + ((i * 17) % 13) / 100;
      const reach =
        Math.min(0.98, (0.28 + (percentage / 100) * 0.52) * w * jitter);
      return {
        i,
        angle: (i / n) * 2 * Math.PI - Math.PI / 2,
        reach,
        label: seed[i % seed.length]?.label ?? `Flow ${i + 1}`,
        value: seed[i % seed.length]?.value,
      };
    });
  }, [percentage, segments]);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth || size;
    const h = Math.min(w, el.clientHeight || w);
    const side = Math.max(220, Math.min(h, w));
    setDims({ width: side, height: side });
  }, [size]);

  useEffect(() => {
    const el = containerRef.current;
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

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const w = dims.width;
    const h = dims.height;
    const cx = w / 2;
    const cy = h / 2;
    const innerR = Math.min(w, h) * 0.18;
    const outerR = Math.min(w, h) * 0.42;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${w} ${h}`).attr('width', w).attr('height', h);

    const root = svg.append('g');

    const guides = [0.32, 0.55, 0.78, 1];
    root
      .selectAll('circle.guide')
      .data(guides)
      .join('circle')
      .attr('class', 'guide')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', (t) => innerR + t * (outerR - innerR))
      .attr('fill', 'none')
      .attr('stroke', 'var(--chart-guide)')
      .attr('stroke-width', 1);

    const lineGen = d3
      .lineRadial()
      .angle((d) => d.angle)
      .radius((d) => d.r)
      .curve(d3.curveLinear);

    const spokesG = root.append('g').attr('class', 'spokes');

    spokeData.forEach((d) => {
      const r0 = innerR + 4;
      const r1 = innerR + d.reach * (outerR - innerR);
      spokesG
        .append('path')
        .datum([
          { angle: d.angle, r: r0 },
          { angle: d.angle, r: r1 },
        ])
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', 'var(--chart-spoke)')
        .attr('stroke-width', 1.1)
        .attr('stroke-linecap', 'round')
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          const rect = containerRef.current?.getBoundingClientRect();
          const x = rect ? event.clientX - rect.left : 0;
          const y = rect ? event.clientY - rect.top : 0;
          spokesG.selectAll('path').attr('opacity', 0.28);
          d3.select(event.currentTarget)
            .attr('opacity', 1)
            .attr('stroke', 'var(--accent-lime)')
            .attr('stroke-width', 2);
          setTip({
            x,
            y,
            label: d.label,
            value: d.value,
          });
        })
        .on('mousemove', (event) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          setTip((prev) =>
            prev
              ? {
                  ...prev,
                  x: event.clientX - rect.left,
                  y: event.clientY - rect.top,
                }
              : null
          );
        })
        .on('mouseleave', () => {
          spokesG
            .selectAll('path')
            .attr('opacity', 1)
            .attr('stroke', 'var(--chart-spoke)')
            .attr('stroke-width', 1.1);
          setTip(null);
        });

      spokesG
        .append('circle')
        .attr('cx', cx + Math.cos(d.angle) * r1)
        .attr('cy', cy + Math.sin(d.angle) * r1)
        .attr('r', 2.2)
        .attr('fill', 'var(--accent-lime)')
        .attr('opacity', 0.95)
        .style('pointer-events', 'none');
    });

    root
      .append('text')
      .attr('x', cx)
      .attr('y', cy + 6)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-primary)')
      .attr('font-size', Math.min(w, h) * 0.14)
      .attr('font-weight', 800)
      .attr('letter-spacing', '-0.04em')
      .text(`${Math.round(percentage)}%`);
  }, [dims, spokeData, percentage]);

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-[320px] aspect-square">
      <svg ref={svgRef} className="block h-full w-full" role="img" aria-label="Total activity radial chart" />
      {tip && (
        <div
          className="pointer-events-none absolute z-10 max-w-[200px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-panel)] px-3 py-2 text-xs shadow-lg"
          style={{
            left: Math.min(tip.x + 12, dims.width - 160),
            top: Math.min(tip.y + 12, dims.height - 56),
          }}
        >
          <p className="font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {tip.label}
          </p>
          {tip.value != null && (
            <p className="mt-0.5 font-extrabold text-[var(--text-primary)]">
              {formatCurrency(tip.value)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
