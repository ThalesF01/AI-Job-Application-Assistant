// src/components/ResultBlock.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  title: string;
  defaultCollapsed?: boolean;
  // aceita children (preferido) ou content (alternativa)
  children?: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
};

export default function ResultBlock({ title, defaultCollapsed = true, children, content, className = "" }: Props) {
  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);
  const [maxHeight, setMaxHeight] = useState<string>("0px");
  const [opacity, setOpacity] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // ajusta max-height quando abrir/fechar ou quando conteúdo muda
  useEffect(() => {
    const el = contentRef.current;
    if (!el) {
      setMaxHeight("0px");
      setOpacity(0);
      return;
    }

    // small delay to allow rendering
    const compute = () => {
      if (collapsed) {
        // quando colapsado, anima para 0
        setMaxHeight("0px");
        setOpacity(0);
      } else {
        // quando aberto, usar scrollHeight
        const h = el.scrollHeight;
        setMaxHeight(`${h}px`);
        // delay aumentar opacidade um pouco depois para suavizar
        setTimeout(() => setOpacity(1), 30);
      }
    };

    // compute on next tick
    requestAnimationFrame(compute);

    // recompute on window resize (content height may change)
    const onResize = () => {
      if (!collapsed && contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [collapsed, children, content]);

  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((s) => !s)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-md hover:bg-slate-800 transition-colors focus:outline-none"
      >
        <div className="text-sm font-medium text-slate-100">{title}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{collapsed ? "Abrir" : "Fechar"}</span>
          <ChevronDown
            className="h-4 w-4 text-slate-200"
            style={{
              transform: `rotate(${collapsed ? 0 : 180}deg)`,
              transition: "transform 220ms ease",
            }}
            aria-hidden
          />
        </div>
      </button>

      {/* container com animação em max-height + fade */}
      <div
        aria-hidden={collapsed}
        style={{
          maxHeight,
          transition: "max-height 320ms ease",
          overflow: "hidden",
        }}
        className="mt-2"
      >
        <div
          ref={contentRef}
          style={{
            opacity,
            transition: "opacity 220ms ease 60ms",
          }}
          className="p-3 bg-slate-900/30 rounded-md border border-slate-700"
        >
          {/* prefer children, se não houver usa content */}
          {children ?? content ?? null}
        </div>
      </div>
    </div>
  );
}