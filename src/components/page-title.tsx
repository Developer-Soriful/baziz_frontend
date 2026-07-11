"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageTitle({
  title,
  subtitle,
  back,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}
