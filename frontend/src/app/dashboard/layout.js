import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#020202] text-zinc-900 dark:text-white">
      <Sidebar />
      <Header />
      <main className="pt-20 md:pl-72 pr-6 pb-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}