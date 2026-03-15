"use client";
import { useEffect } from "react";

export default function BengaliFontDetector() {
  useEffect(() => {
    const bengaliRegex = /[\u0980-\u09FF]/;

    function applyBengaliFont(node: HTMLElement) {
      if (node.classList.contains("bengali-checked")) return;

      if (bengaliRegex.test(node.textContent || "")) {
        node.classList.add("font-bengali", "bengali-checked");
      }

      // Recursively check children
      node.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6,p,div").forEach(
        (child) => {
          if (!child.classList.contains("bengali-checked")) {
            if (bengaliRegex.test(child.textContent || "")) {
              child.classList.add("font-bengali", "bengali-checked");
            }
          }
        }
      );
    }

    // Scan headings, paragraphs, and divs with text content
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6,p,div")
    ).filter((el) => el.textContent && el.textContent.trim().length > 0);

    elements.forEach((el) => applyBengaliFont(el));

    // Observe dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) applyBengaliFont(node);
        });
      });
    });

    elements.forEach((el) =>
      observer.observe(el, { childList: true, subtree: true })
    );

    return () => observer.disconnect();
  }, []);

  return null;
}