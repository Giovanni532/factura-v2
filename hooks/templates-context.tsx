"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TemplatesContextType {
    defaultTemplateId: string | null;
    setDefaultTemplateId: (templateId: string | null) => void;
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined);

interface TemplatesProviderProps {
    children: ReactNode;
    initialDefaultTemplateId?: string | null;
}

export function TemplatesProvider({ children, initialDefaultTemplateId = null }: TemplatesProviderProps) {
    const [defaultTemplateId, setDefaultTemplateId] = useState<string | null>(initialDefaultTemplateId);

    return (
        <TemplatesContext.Provider value={{ defaultTemplateId, setDefaultTemplateId }}>
            {children}
        </TemplatesContext.Provider>
    );
}

export function useTemplatesContext() {
    const context = useContext(TemplatesContext);
    if (context === undefined) {
        throw new Error("useTemplatesContext must be used within a TemplatesProvider");
    }
    return context;
} 