"use client";

import { headerLinks } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItemsProps {
  onItemSelected?: () => void;
}

const NavItems = ({ onItemSelected }: NavItemsProps) => {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col lg:flex-row w-full lg:w-auto font-bengali">
      {headerLinks.map((link) => {
        const isActive = pathname === link.route;

        return (
          <li key={link.route} className="w-full lg:w-auto">
            <Link
              href={link.route}
              onClick={onItemSelected}
              className={`
                block w-full lg:w-auto px-3 py-2 lg:py-1 whitespace-nowrap
                border-b lg:border-0 border-gray-300 font-semibold
                
                ${
                  isActive
                    ? "bg-primary text-white rounded-md lg:bg-transparent lg:text-gray-900"
                    : "text-gray-700 lg:text-gray-700"
                }

                hover:text-primary transition-colors
              `}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavItems;