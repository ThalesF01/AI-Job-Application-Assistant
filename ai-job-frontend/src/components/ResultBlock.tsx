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
      {/* Header Button */}
      <button
        type="button"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((s) => !s)}
        className="group w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-800/80 to-slate-800/60 border border-slate-700/60 rounded-lg hover:from-slate-700/80 hover:to-slate-700/60 hover:border-slate-600/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:bg-blue-300 transition-colors"></div>
          <h3 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors">{title}</h3>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
            {collapsed ? "Expandir" : "Recolher"}
          </span>
          <div className="p-1 rounded-md bg-slate-700/50 group-hover:bg-slate-600/50 transition-all duration-200">
            <ChevronDown
              className="h-4 w-4 text-slate-300 group-hover:text-slate-100"
              style={{
                transform: `rotate(${collapsed ? 0 : 180}deg)`,
                transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              aria-hidden
            />
          </div>
        </div>
      </button>

      {/* Content Container */}
      <div
        aria-hidden={collapsed}
        style={{
          maxHeight,
          transition: "max-height 350ms cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
        className="mt-3"
      >
        <div
          ref={contentRef}
          style={{
            opacity,
            transition: "opacity 250ms ease 80ms",
          }}
          className="p-5 bg-gradient-to-br from-slate-900/40 to-slate-900/60 rounded-lg border border-slate-700/50 backdrop-blur-sm shadow-inner"
        >
          {/* prefer children, se não houver usa content */}
          {children ?? content ?? null}
        </div>
      </div>
    </div>
  );
}