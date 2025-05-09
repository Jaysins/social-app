// components/MobileHeader.tsx
export default function MobileHeader() {
  return (
    <header className="md:hidden border-b p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">SocialConnect</h2>
        {/* Mobile menu button could be added here */}
      </div>
    </header>
  );
}
