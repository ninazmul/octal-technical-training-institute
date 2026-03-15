"use client";
import { useEffect } from "react";

export default function BengaliFontDetector() {
  useEffect(() => {
    const bengaliRegex = /[\u0980-\u09FF]/;

    const scanTextNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (bengaliRegex.test(node.textContent || "")) {
          node.parentElement?.classList.add("font-bengali");
        }
      } else {
        node.childNodes.forEach(scanTextNodes);
      }
    };

    // Initial scan
    scanTextNodes(document.body);

    // Observe changes for dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(scanTextNodes);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}