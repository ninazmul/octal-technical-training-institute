"use client";

import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";

interface CourseLinkProps extends Omit<LinkProps, "href"> {
  id: string;
  children: ReactNode;
  className?: string;
}

export function CourseLink({
  id,
  children,
  className,
  ...props
}: CourseLinkProps) {
  return (
    <Link href={`/courses/${id}`} className={className} {...props}>
      {children}
    </Link>
  );
}
