"use client";

import { useEffect, useMemo, useState } from "react";
import { ISetting } from "@/lib/database/models/setting.model";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  File,
  Mail,
  MapPin,
  Phone,
  Shield,
} from "lucide-react";

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
    prose-headings:font-semibold
    prose-p:text-gray-700 dark:prose-p:text-gray-300
    prose-p:leading-relaxed
  `;

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-4xl md:text-5xl font-extrabold mb-4"
          style={{ color: themeColor }}
        >
          Legal Information
        </motion.h1>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          Everything you need to know about our terms, privacy practices, and
          policies at Octal Technical Training Institute.
        </motion.h3>

        <div className="grid lg:grid-cols-[260px_1fr] gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-white bg-primary p-4 mb-4 rounded-t-2xl uppercase tracking-wide">
                Quick Navigation
              </h3>
              {/* Navigation */}
              <nav className="flex flex-col gap-2 p-4">
                {navItems.map((item) => {
                  const active = activeSection === item.id;

                  // Choose icon based on section id
                  let IconComponent;
                  if (item.id === "terms-of-service") IconComponent = File;
                  if (item.id === "privacy-policy") IconComponent = Shield;
                  if (item.id === "return-policy") IconComponent = DollarSign;

                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition ${
                        active
                          ? "font-semibold"
                          : "font-medium text-gray-600 dark:text-gray-400"
                      }`}
                      style={{
                        background: active ? `${themeColor}20` : "transparent",
                        color: active ? themeColor : undefined,
                      }}
                    >
                      {/* Left side: icon + label */}
                      <div className="flex items-center gap-2">
                        {IconComponent && (
                          <IconComponent
                            size={16}
                            style={{ color: active ? themeColor : "inherit" }}
                          />
                        )}
                        {item.label}
                      </div>

                      {/* Right side: arrow */}
                      {active ? (
                        <ChevronDown size={16} style={{ color: themeColor }} />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                    </a>
                  );
                })}
              </nav>
            </div>
            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-md p-4">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Need Help?
              </h4>
              <div className="space-y-6 text-gray-700 dark:text-gray-300">
                {settings.email && (
                  <div className="flex items-start gap-4">
                    <div
                      className="p-1 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${themeColor}20` }}
                    >
                      <Mail size={12} style={{ color: themeColor }} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium break-words">
                        {settings.email}
                      </p>
                    </div>
                  </div>
                )}

                {settings.phoneNumber && (
                  <div className="flex items-start gap-4">
                    <div
                      className="p-1 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${themeColor}20` }}
                    >
                      <Phone size={12} style={{ color: themeColor }} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{settings.phoneNumber}</p>
                    </div>
                  </div>
                )}

                {settings.address && (
                  <div className="flex items-start gap-4">
                    <div
                      className="p-1 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${themeColor}20` }}
                    >
                      <MapPin size={12} style={{ color: themeColor }} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{settings.address}</p>
                    </div>
                  </div>
                )}
              </div>
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
                className="bg-white dark:bg-gray-800 border rounded-xl shadow-sm"
              >
                <div
                  className="flex items-center gap-2 p-4 text-white rounded-t-2xl"
                  style={{ backgroundColor: themeColor }}
                >
                  <div>
                    <File size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">শর্তাবলী</h2>
                    <h3>Applicable Policies:</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className={proseClasses}
                    dangerouslySetInnerHTML={{
                      __html: settings.termsOfService,
                    }}
                  />{" "}
                </div>
              </motion.section>
            )}

            {settings.privacyPolicy && (
              <motion.section
                id="privacy-policy"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-xl shadow-sm"
              >
                <div
                  className="flex items-center gap-2 p-4 text-white rounded-t-2xl"
                  style={{ backgroundColor: themeColor }}
                >
                  <div>
                    <Shield size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">গোপনীয়তা নীতি</h2>
                    <h3>Applicable Policies:</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className={proseClasses}
                    dangerouslySetInnerHTML={{
                      __html: settings.privacyPolicy,
                    }}
                  />{" "}
                </div>
              </motion.section>
            )}

            {settings.returnPolicy && (
              <motion.section
                id="return-policy"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-xl shadow-sm"
              >
                <div
                  className="flex items-center gap-2 p-4 text-white rounded-t-2xl"
                  style={{ backgroundColor: themeColor }}
                >
                  <div>
                    <DollarSign size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">
                      রিফান্ড ও বাতিল নীতি
                    </h2>
                    <h3>Applicable Policies:</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className={proseClasses}
                    dangerouslySetInnerHTML={{
                      __html: settings.returnPolicy,
                    }}
                  />{" "}
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
