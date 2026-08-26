import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardLayout({ children }) {
  return (
    <div className="md:h-screen md:flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col md:h-screen md:overflow-hidden">
        <TopBar />
        <main className="flex-1 min-w-0 md:overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
