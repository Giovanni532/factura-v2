"use client";

import { createContext, useContext, ReactNode } from "react";
import { InvoiceWithDetails, InvoiceStats } from "@/validation/invoice-schema";

interface InvoicesContextType {
    invoices: InvoiceWithDetails[];
    setInvoices: (invoices: InvoiceWithDetails[]) => void;
    stats: InvoiceStats;
    setStats: (stats: InvoiceStats) => void;
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

export function useInvoicesContext() {
    const context = useContext(InvoicesContext);
    if (context === undefined) {
        throw new Error("useInvoicesContext must be used within an InvoicesContextProvider");
    }
    return context;
}

export { InvoicesContext }; 