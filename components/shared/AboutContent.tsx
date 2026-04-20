"use client";

import { useEffect, useMemo, useState } from "react";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Users,
  ChevronDown,
  ChevronRight,
  Info,
  Contact,
  Globe,
} from "lucide-react";

type NavItem = {
  label: string;
  id: string;
};

export default function AboutContent({
  settings,
}: {
  settings: ISettingSafe | null;
}) {
  const themeColor = settings?.theme || "#0055CE";
  const [activeSection, setActiveSection] = useState("");

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [];

    if (settings?.description)
      items.push({ label: "About", id: "about-section" });
    if (settings?.ceo)
      items.push({ label: "Leadership", id: "ceo-section" });
    if (settings?.email || settings?.phoneNumber || settings?.address)
      items.push({ label: "Contact", id: "contact-section" });

    if (
      settings?.facebook ||
      settings?.instagram ||
      settings?.twitter ||
      settings?.youtube ||
      settings?.facebookGroup
    )
      items.push({ label: "Social", id: "social-section" });

    return items;
  }, [settings]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: themeColor }}
          >
            About Us
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            Learn more about who we are, what we stand for, and how we are
            shaping the future through quality education and practical skill
            development.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-12">
          {/* Sidebar */}
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
                  if (item.id === "about-section") IconComponent = Info;
                  if (item.id === "ceo-section") IconComponent = Users;
                  if (item.id === "contact-section") IconComponent = Contact;
                  if (item.id === "social-section") IconComponent = Globe;

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
          </aside>

          {/* Content */}
          <div className="space-y-4">
            {/* About */}
            {settings?.description && (
              <motion.section
                id="about-section"
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
                    <Info size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">আমাদের সম্পর্কে</h2>
                    <h3>Applicable Policies:</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className={proseClasses}
                    dangerouslySetInnerHTML={{
                      __html: settings?.description,
                    }}
                  />{" "}
                </div>
              </motion.section>
            )}

            {/* CEO Section */}
            {(settings?.ceo?.name ||
              settings?.ceo?.about ||
              settings?.ceo?.photo) && (
              <motion.section
                id="ceo-section"
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
                    <Users size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">নেতৃত্ব</h2>
                    <h3>Our Leadership</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Photo */}
                    {settings?.ceo?.photo && (
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border shadow-sm shrink-0">
                        <img
                          src={settings.ceo.photo}
                          alt={settings.ceo?.name || "CEO"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      {/* Name */}
                      {settings?.ceo?.name && (
                        <h3
                          className="text-xl md:text-2xl font-bold"
                          style={{ color: themeColor }}
                        >
                          {settings.ceo.name}
                        </h3>
                      )}

                      {/* Role */}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Chief Executive Officer
                      </p>

                      {/* About */}
                      {settings?.ceo?.about && (
                        <div
                          className={proseClasses}
                          dangerouslySetInnerHTML={{
                            __html: settings.ceo.about,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Contact */}
            {(settings?.email ||
              settings?.phoneNumber ||
              settings?.address) && (
              <motion.section
                id="contact-section"
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
                    <Contact size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">যোগাযোগ</h2>
                    <h3>Applicable Policies:</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    {settings?.email && (
                      <div className="flex items-center gap-3">
                        <Mail size={18} />
                        {settings?.email}
                      </div>
                    )}

                    {settings?.phoneNumber && (
                      <div className="flex items-center gap-3">
                        <Phone size={18} />
                        {settings?.phoneNumber}
                      </div>
                    )}

                    {settings?.address && (
                      <div className="flex items-center gap-3">
                        <MapPin size={18} />
                        {settings?.address}
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Social */}
            {(settings?.facebook ||
              settings?.instagram ||
              settings?.twitter ||
              settings?.youtube ||
              settings?.facebookGroup) && (
              <motion.section
                id="social-section"
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
                    <Globe size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">আমাদের ফলো করুন</h2>
                    <h3>Applicable Policies:</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-4">
                    {settings?.facebook && (
                      <a href={settings?.facebook} target="_blank">
                        <Facebook />
                      </a>
                    )}

                    {settings?.instagram && (
                      <a href={settings?.instagram} target="_blank">
                        <Instagram />
                      </a>
                    )}

                    {settings?.twitter && (
                      <a href={settings?.twitter} target="_blank">
                        <Twitter />
                      </a>
                    )}

                    {settings?.youtube && (
                      <a href={settings?.youtube} target="_blank">
                        <Youtube />
                      </a>
                    )}

                    {settings?.facebookGroup && (
                      <a href={settings?.facebookGroup} target="_blank">
                        <Users />
                      </a>
                    )}
                  </div>
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
