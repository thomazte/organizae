import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { ToastViewport } from "@/components/ui/Toast";
import { AuthModal } from "@/components/account/AuthModal";
import { ProfileModal } from "@/components/account/ProfileModal";

export function AppLayout() {
  return (
    <div className="min-h-screen flex bg-ink-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <ToastViewport />
      <AuthModal />
      <ProfileModal />
    </div>
  );
}
