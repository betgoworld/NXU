"use client";

import Image from "next/image";
import { useRef } from "react";
import { m, useScroll, useTransform, useReducedMotion } from "framer-motion";

type Props = {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  tag?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Imagem editorial com zoom muito discreto durante o scroll (1 → 1.03).
 * Sem `src`, mostra um placeholder neutro na mesma proporção (para fotos ainda não produzidas).
 */
export function EditorialImage({ src, alt, width, height, sizes, tag, priority, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.03]);

  return (
    <div
      ref={ref}
      className={`frame ${src ? "" : "frame--placeholder"} ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
      data-cursor="view"
      role={src ? undefined : "img"}
      aria-label={src ? undefined : alt}
    >
      <m.div className="frame__media" style={reduce ? undefined : { scale }}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span className="frame__placeholder-figure" aria-hidden="true" />
        )}
      </m.div>
      {!src && tag ? (
        <span className="frame__tag" aria-hidden="true">
          {tag}
        </span>
      ) : null}
    </div>
  );
}
