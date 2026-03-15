"use client";
import { useEffect } from "react";

export default function BengaliFontDetector() {
  useEffect(() => {
    const bengaliRegex = /[\u0980-\u09FF]/;

    const scanNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (
          parent &&
          !parent.classList.contains("bengali-checked") &&
          bengaliRegex.test(node.textContent || "")
        ) {
          parent.classList.add("font-bengali", "bengali-checked");
        }
      } else {
        node.childNodes.forEach(scanNode);
      }
    };

    // Initial scan
    scanNode(document.body);

    // Observe dynamic changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(scanNode);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}