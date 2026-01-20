"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";

interface SidebarContextType {
    collapsed: boolean;
    toggleSidebar: () => void;
    setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

// Helper to safely access localStorage
function getStoredValue(): boolean {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === "true";
}

export function SidebarProvider({ children }: { children: ReactNode }) {
    // Initialize state with localStorage value (client-side only)
    const [collapsed, setCollapsedState] = useState(() => {
        if (typeof window === "undefined") return false;
        return getStoredValue();
    });

    // Persist to localStorage
    const setCollapsed = useCallback((value: boolean) => {
        setCollapsedState(value);
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
    }, []);

    const toggleSidebar = useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed, setCollapsed]);

    // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "b") {
                e.preventDefault();
                toggleSidebar();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    return (
        <SidebarContext.Provider value={{ collapsed, toggleSidebar, setCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
