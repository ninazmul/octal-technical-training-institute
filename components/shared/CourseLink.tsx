"use client";

import Link, { LinkProps } from "next/link";
import { ReactNode, useRef } from "react";
import { useRouter } from "next/navigation";

interface CourseLinkProps extends Omit<LinkProps, "href"> {
  id: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function CourseLink({
  id,
  children,
  className,
  onClick,
  ...props
}: CourseLinkProps) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefetched = useRef<Set<string>>(new Set());

  const handleMouseEnter = () => {
    // Only prefetch if not already done
    if (!prefetched.current.has(id)) {
      timeoutRef.current = setTimeout(() => {
        router.prefetch(`/courses/${id}`);
        prefetched.current.add(id);
      }, 60); // small delay to avoid accidental hover prefetch
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <Link
      href={`/courses/${id}`}
      prefetch={false} // controlled prefetch
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Link>
  );
}
