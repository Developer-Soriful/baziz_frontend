/**
 * Tenant Public Layout
 * Clean layout for public-facing tenant pages (no sidebar/auth required)
 */
export default function TenantPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="tenant-public-root">
      {children}
    </div>
  );
}
