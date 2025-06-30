"use client";

import { createContext, useContext, ReactNode } from "react";
import { QuoteWithDetails, QuoteStats } from "@/validation/quote-schema";

interface QuotesContextType {
    quotes: QuoteWithDetails[];
    setQuotes: (quotes: QuoteWithDetails[]) => void;
    stats: QuoteStats;
    setStats: (stats: QuoteStats) => void;
}

const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

export function useQuotesContext() {
    const context = useContext(QuotesContext);
    if (context === undefined) {
        throw new Error("useQuotesContext must be used within a QuotesContextProvider");
    }
    return context;
}

export { QuotesContext }; 