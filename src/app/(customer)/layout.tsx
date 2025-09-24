export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Cafe Digital Menu</h1>
        </div>
      </header>
      <main className="max-w-md mx-auto">
        {children}
      </main>
    </div>
  );
}
