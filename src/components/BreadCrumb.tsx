"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { parseAlbumFolderName } from "@/utils/fileSystem";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  const pathnames =
    pathname === "/" ? [] : pathname.split("/").filter((x) => x);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/", isCurrent: pathnames.length === 0 },
    ...pathnames.map((value, index) => {
      const href = `${pathnames.slice(0, index + 1).join("/")}`;
      const label = parseAlbumFolderName(decodeURIComponent(value)).title;
      return { label, href, isCurrent: index === pathnames.length - 1 };
    }),
  ];

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse p-5">
        {breadcrumbItems.map((item, index) => (
          <li key={index} aria-current={item.isCurrent ? "page" : undefined}>
            <div className="flex items-center">
              {index > 0 && (
                <svg
                  className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              )}
              {item.isCurrent ? (
                <span className="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400 break-all">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href || "#"}
                  className="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white break-words"
                >
                  {item.label}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
