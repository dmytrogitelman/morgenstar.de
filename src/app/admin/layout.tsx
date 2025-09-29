import AdminNav from '@/components/admin-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

