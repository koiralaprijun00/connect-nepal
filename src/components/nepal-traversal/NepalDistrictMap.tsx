'use client';
import type { SVGProps } from 'react';
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { NepalMapSVG } from './NepalMapSVG';

interface NepalDistrictMapProps extends SVGProps<SVGSVGElement> {
  guessedPath: string[];
  correctPath: string[];
  startDistrict: string;
  endDistrict: string;
  onDistrictClick?: (districtName: string) => void;
  hintDistricts?: string[];
}

export function NepalDistrictMap({
  guessedPath,
  correctPath,
  startDistrict,
  endDistrict,
  onDistrictClick,
  hintDistricts = [],
  className,
  ...rest
}: NepalDistrictMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = React.useState<[number, number, number, number]>([0, 0, 800, 600]);

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let isDragging = false;
    let lastX = 0, lastY = 0;

    function getSvgCoords(evt: MouseEvent | TouchEvent) {
      if (!svgRef.current) return { x: 0, y: 0 };
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      let clientX = 0, clientY = 0;
      if ('touches' in evt && evt.touches.length > 0) {
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
      } else if ('clientX' in evt) {
        clientX = evt.clientX;
        clientY = evt.clientY;
      }
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (ctm) {
        return pt.matrixTransform(ctm.inverse());
      }
      return {x: clientX, y: clientY};
    }

    function onDown(evt: MouseEvent | TouchEvent) {
      if (!svgRef.current) return;
      if ((evt.target as Element).closest('.district')) return;
      isDragging = true;
      const coords = getSvgCoords(evt);
      lastX = coords.x;
      lastY = coords.y;
      document.body.style.cursor = 'grabbing';
    }
    function onMove(evt: MouseEvent | TouchEvent) {
      if (!isDragging) return;
      evt.preventDefault();
      const coords = getSvgCoords(evt);
      const dx = coords.x - lastX;
      const dy = coords.y - lastY;
      setViewBox(([x, y, w, h]) => [x - dx, y - dy, w, h]);
      lastX = coords.x;
      lastY = coords.y;
    }
    function onUp() {
      isDragging = false;
      document.body.style.cursor = '';
    }
    function onWheel(evt: WheelEvent) {
      if (!svgRef.current) return;
      evt.preventDefault();
      const svg = svgRef.current;
      const {offsetX, offsetY, deltaY} = evt;
      const scale = deltaY < 0 ? 0.9 : 1.1;
      setViewBox(([x, y, w, h]) => {
        const mx = x + (w * offsetX) / svg.clientWidth;
        const my = y + (h * offsetY) / svg.clientHeight;
        const newW = w * scale;
        const newH = h * scale;
        const newX = mx - (offsetX / svg.clientWidth) * newW;
        const newY = my - (offsetY / svg.clientHeight) * newH;
        return [newX, newY, newW, newH];
      });
    }
    svg.addEventListener('mousedown', onDown);
    svg.addEventListener('touchstart', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, {passive: false});
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    svg.addEventListener('wheel', onWheel, {passive: false});
    return () => {
      svg.removeEventListener('mousedown', onDown);
      svg.removeEventListener('touchstart', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      svg.removeEventListener('wheel', onWheel);
      document.body.style.cursor = '';
    };
  }, [viewBox]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const allElements = Array.from(svg.querySelectorAll('path, g, rect, circle, polygon, polyline, line, ellipse') || []) as SVGElement[];
    allElements.forEach(el => {
      if (el.id || el.dataset.name) {
        el.setAttribute('class', 'district-default');
      }
    });
    const setElementClass = (districtName: string, cssClass: string) => {
      if (!districtName || !svgRef.current) return;
      const svg = svgRef.current;
      const normalized = districtName.trim().toLowerCase();
      let el: SVGElement | null =
        svg.querySelector(`g[id="${districtName}"], g[id="${normalized}"], g[id="${districtName.charAt(0).toUpperCase() + districtName.slice(1).toLowerCase()}"]`) ||
        svg.querySelector(`path[id="${districtName}"], path[id="${normalized}"], path[id="${districtName.charAt(0).toUpperCase() + districtName.slice(1).toLowerCase()}"]`);
      if (el && el.tagName.toLowerCase() === 'g') {
        const path = el.querySelector('path');
        if (path) el = path;
      }
      if (!el) {
        el =
          svg.querySelector(`path[data-name="${districtName}"]`) ||
          svg.querySelector(`path[data-name="${normalized}"]`) ||
          svg.querySelector(`g[data-name="${districtName}"] path`) ||
          svg.querySelector(`g[data-name="${normalized}"] path`);
      }
      if (el) {
        el.setAttribute('class', cssClass);
      }
    };
    if (hintDistricts && hintDistricts.length > 0) {
      hintDistricts.forEach(d => setElementClass(d, 'district-hint'));
    }
    if ((!guessedPath || guessedPath.length === 0)) {
      if (startDistrict) setElementClass(startDistrict, 'district-start');
      if (endDistrict) setElementClass(endDistrict, 'district-end');
      return;
    }
    if (correctPath && correctPath.length > 0) {
      correctPath.forEach(districtName => {
        setElementClass(districtName, 'district-correct-path');
      });
    }
    if (guessedPath && correctPath) {
      const lowerCorrectPath = correctPath.map(d => d.toLowerCase());
      guessedPath.forEach((guessedDistrict, idx) => {
        if (lowerCorrectPath.includes(guessedDistrict.toLowerCase())) {
          setElementClass(guessedDistrict, 'district-guessed-correct');
        }
      });
    }
    if (startDistrict) setElementClass(startDistrict, 'district-start');
    if (endDistrict) setElementClass(endDistrict, 'district-end');
  }, [guessedPath, startDistrict, endDistrict, correctPath, hintDistricts]);

  useEffect(() => {
    if (!svgRef.current || !onDistrictClick) return;
    const svg = svgRef.current;
    const districtPaths = Array.from(svg.querySelectorAll('g[id], path[id]')) as SVGElement[];
    function handleClick(e: Event) {
      const el = e.currentTarget as SVGElement;
      const id = el.id || el.parentElement?.id;
      if (id && onDistrictClick) {
        onDistrictClick(id);
      }
    }
    districtPaths.forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', handleClick);
      el.setAttribute('tabIndex', '0');
      el.setAttribute('aria-label', el.id);
    });
    return () => {
      districtPaths.forEach(el => {
        el.style.cursor = '';
        el.removeEventListener('click', handleClick);
        el.removeAttribute('tabIndex');
        el.removeAttribute('aria-label');
      });
    };
  }, [onDistrictClick]);

  return (
    <NepalMapSVG
      ref={svgRef}
      viewBox={viewBox.join(' ')}
      className={cn('w-full h-auto object-contain bg-muted/20 rounded-md border border-border shadow-sm', className)}
      data-ai-hint="Nepal map districts"
      {...rest}
    />
  );
}
