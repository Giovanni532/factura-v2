"use client";

import { createContext, useContext } from "react";
import { ServiceWithStats, ServiceCategory } from "@/validation/service-schema";

interface ServicesContextType {
    services: ServiceWithStats[];
    setServices: (services: ServiceWithStats[]) => void;
    categories: ServiceCategory[];
    setCategories: (categories: ServiceCategory[]) => void;
    onServiceCreated: (service: ServiceWithStats) => void;
    onServiceUpdated: (service: ServiceWithStats) => void;
    onServiceDeleted: (serviceId: string) => void;
    onCategoryCreated: (category: ServiceCategory) => void;
    onCategoryUpdated: (category: ServiceCategory) => void;
    onCategoryDeleted: (categoryId: string) => void;
}

export const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export function useServicesContext() {
    const context = useContext(ServicesContext);
    if (context === undefined) {
        throw new Error("useServicesContext must be used within a ServicesContextProvider");
    }
    return context;
}