import { useEffect, useRef, useState } from "react";

type ViewportRevealProps = {
  children: React.ReactNode;
  delay?: number;
  variant?: "up" | "scale";
  className?: string;
};

export function ViewportReveal({ children, delay = 0, variant = "up", className }: ViewportRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.22, rootMargin: "0px 0px -4% 0px" });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={elementRef} className={`viewport-reveal viewport-reveal-${variant}${isVisible ? " viewport-reveal-visible" : ""}${className ? ` ${className}` : ""}`} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}
