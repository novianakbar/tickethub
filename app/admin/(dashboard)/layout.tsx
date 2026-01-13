import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/auth-context";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <div className="flex min-h-screen">
                <AdminSidebar />
                <div className="flex flex-1 flex-col">{children}</div>
            </div>
            <Toaster />
        </AuthProvider>
    );
}
