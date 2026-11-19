import React, { useEffect, useRef, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Flower2, Sun, Heart, ChevronDown, Check } from 'lucide-react';
import { paintPoster } from '../poster';
import { fonts } from '../catalogue';
import { modelFor } from '../art/models.js';
import { BRAND, canvasSize, formatFor } from '../../shared/poster-spec.js';
export const categoryIcons = {
  Services: Sparkles,
  Festivals: Flower2,
  'Hindu deities': Sun,
  'Special days': Heart,
};
export function MetaIcon({ size = 23 }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 32 22" aria-hidden="true">
      <path
        d="M16.4 10.3C12.2 3.7 10.6 2.2 8 2.4 3.4 2.7.9 9.4.9 15.1c0 3.1 1.4 5.1 4 5.1 3.1 0 5.3-3.9 8.4-9.2l2.5-4.1c1.7-2.7 3.6-4.5 6.1-4.5 4.1 0 8.8 7 8.8 13.1 0 2.9-1.4 4.7-3.9 4.7-3.4 0-6-4.2-10.4-9.9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function Poster({ design, small = false, className = '' }) {
  const ref = useRef(null);
  const [error, setError] = useState('');
  const size = canvasSize(design.format, small);
  const [near, setNear] = useState(!small || typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    if (!small || !ref.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        setNear(entries.some((e) => e.isIntersecting));
      },
      { rootMargin: '180px' },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [small]);
  useEffect(() => {
    if (!near) {
      ref.current.dataset.rendered = 'false';
      return;
    }
    let alive = true;
    const canvas = ref.current;
    setError('');
    canvas.dataset.rendered = 'false';
    paintPoster(canvas, design, { small, shouldDraw: () => alive })
      .then(() => {
        if (alive) canvas.dataset.rendered = 'true';
      })
      .catch((e) => {
        if (alive) {
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
          setError(e.message);
        }
      });
    return () => {
      alive = false;
    };
  }, [
    design.topic,
    design.headline,
    design.tagline,
    design.styleId,
    design.font,
    design.palette,
    design.format,
    small,
    near,
  ]);
  return (
    <>
      <canvas
        ref={ref}
        width={near ? size.width : 1}
        height={near ? size.height : 1}
        className={'poster-canvas ' + className}
        role="img"
        aria-label={`${design.topic.name} · ${modelFor(design.topic, design.styleId).name} poster by ${BRAND.name}`}
      />
      {error && (
        <span role="status" className="poster-error">
          {error}
        </span>
      )}
    </>
  );
}
export function Modal({ title, eyebrow, children, onClose, wide = false, className = '' }) {
  const box = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  const id = useId();
  useEffect(() => {
    const prev = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    box.current?.focus();
    const key = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close.current();
      }
      if (e.key === 'Tab') {
        const items = Array.from(
          box.current.querySelectorAll(
            'button:not(:disabled),a[href],input:not(:disabled),select,textarea,[tabindex="0"]',
          ),
        ).filter((n) => n.offsetParent !== null);
        if (!items.length) {
          e.preventDefault();
          return;
        }
        const first = items[0],
          last = items.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === box.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      document.body.style.overflow = overflow;
      prev?.focus?.({ preventScroll: true });
    };
  }, []);
  return createPortal(
    <div
      className="modal-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        ref={box}
        tabIndex={-1}
        className={`modal ${wide ? 'modal-wide' : ''} ${className}`}
      >
        <div className="modal-head">
          <div>
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            <h2 id={id}>{title}</h2>
          </div>
          <button className="icon-btn" aria-label="Close dialog" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  );
}
export function SelectField({ label, value, onChange, children, icon: Icon, ariaLabel }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="select-wrap">
        {Icon && <Icon size={16} />}
        <select
          aria-label={ariaLabel || label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {children}
        </select>
        <ChevronDown size={15} />
      </span>
    </label>
  );
}
export function ModelCard({ model: s, design, onClick, selected = false }) {
  const d = selected ? design : { ...design, styleId: s.id, font: fonts[s.id % fonts.length], palette: -1 };
  const fmt = formatFor(d.format);
  return (
    <button
      className={'style-card ' + (selected ? 'selected' : '')}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Apply ${s.name} model`}
    >
      <div
        className="style-art"
        style={{ aspectRatio: `${fmt.width} / ${fmt.height}`, backgroundColor: s.colors[0] }}
      >
        <Poster design={d} small />
        {selected && (
          <span className="selected-tick">
            <Check size={12} strokeWidth={3} />
          </span>
        )}
      </div>
      <span className="model-meta">
        {String(s.id + 1).padStart(2, '0')} <span> / </span> {s.medium}
      </span>
      <span className="style-title">{s.name}</span>
    </button>
  );
}
