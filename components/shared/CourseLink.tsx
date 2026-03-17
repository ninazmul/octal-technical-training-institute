"use client";

import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";
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
  let timeout: NodeJS.Timeout;

  const handleMouseEnter = () => {
    timeout = setTimeout(() => router.prefetch(`/courses/${id}`), 120);
  };

  const handleMouseLeave = () => clearTimeout(timeout);

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
