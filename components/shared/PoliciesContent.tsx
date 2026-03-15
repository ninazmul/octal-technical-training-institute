"use client";

import { useEffect, useMemo, useState } from "react";
import { ISetting } from "@/lib/database/models/setting.model";
import { motion } from "framer-motion";

type NavItem = {
  label: string;
  id: string;
};

export default function PoliciesContent({ settings }: { settings: ISetting }) {
  const themeColor = settings.theme || "#0055CE";
  const [activeSection, setActiveSection] = useState<string>("");

  /* -----------------------------
     Memoized Navigation Items
  ------------------------------*/
  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [];

    if (settings.termsOfService)
      items.push({ label: "Terms & Conditions", id: "terms-of-service" });

    if (settings.privacyPolicy)
      items.push({ label: "Privacy Policy", id: "privacy-policy" });

    if (settings.returnPolicy)
      items.push({ label: "Return & Refund Policy", id: "return-policy" });

    return items;
  }, [settings.termsOfService, settings.privacyPolicy, settings.returnPolicy]);

  /* -----------------------------
     Scroll Spy
  ------------------------------*/
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-35% 0px -60% 0px",
      },
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navItems]);

  const proseClasses = `
    prose prose-base max-w-none dark:prose-invert
    prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
    prose-strong:font-semibold prose-strong:text-gray-900 dark:prose-strong:text-gray-100
    prose-em:italic prose-em:text-gray-800 dark:prose-em:text-gray-200
    prose-u:underline
    prose-ul:list-disc prose-ul:pl-5
    prose-ol:list-decimal prose-ol:pl-5
    prose-li:marker:text-gray-500 dark:prose-li:marker:text-gray-400
    prose-blockquote:border-l-2 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 prose-blockquote:pl-3 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400 italic
    prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-pink-600
    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-md prose-pre:p-3
    prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300
    prose-img:rounded-md prose-img:shadow-sm prose-img:my-3
  `;

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-4xl md:text-5xl font-extrabold mb-16"
          style={{ color: themeColor }}
        >
          Our Policies
        </motion.h1>

        <div className="grid lg:grid-cols-[260px_1fr] gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-gray-800 border rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Policies
              </h3>

              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const active = activeSection === item.id;

                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="px-3 py-2 text-sm rounded-md transition"
                      style={{
                        background: active ? `${themeColor}20` : "transparent",
                        color: active ? themeColor : undefined,
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Policy Content */}
          <div className="space-y-4">
            {settings.termsOfService && (
              <motion.section
                id="terms-of-service"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-xl p-8 shadow-sm"
              >
                <h2
                  className="text-2xl font-semibold mb-6"
                  style={{ color: themeColor }}
                >
                  Terms & Conditions
                </h2>

                <div
                  className={proseClasses}
                  dangerouslySetInnerHTML={{ __html: settings.termsOfService }}
                />
              </motion.section>
            )}

            {settings.privacyPolicy && (
              <motion.section
                id="privacy-policy"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-xl p-8 shadow-sm"
              >
                <h2
                  className="text-2xl font-semibold mb-6"
                  style={{ color: themeColor }}
                >
                  Privacy Policy
                </h2>

                <div
                  className={proseClasses}
                  dangerouslySetInnerHTML={{ __html: settings.privacyPolicy }}
                />
              </motion.section>
            )}

            {settings.returnPolicy && (
              <motion.section
                id="return-policy"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-xl p-8 shadow-sm"
              >
                <h2
                  className="text-2xl font-semibold mb-6"
                  style={{ color: themeColor }}
                >
                  Return & Refund Policy
                </h2>

                <div
                  className={proseClasses}
                  dangerouslySetInnerHTML={{ __html: settings.returnPolicy }}
                />
              </motion.section>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
