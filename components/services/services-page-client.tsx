"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceWithStats, ServiceCategory } from "@/validation/service-schema";
import { ServiceCard } from "@/components/services/service-card";
import { CategoryCard } from "@/components/services/category-card";
import { CreateServiceButton } from "@/components/services/create-service-button";
import { CreateCategoryButton } from "@/components/services/create-category-button";
import { ServicesContext } from "./services-context";
import { Briefcase, Tag, TrendingUp, Package, Euro } from "lucide-react";

interface ServicesPageClientProps {
    initialServices: ServiceWithStats[];
    initialCategories: ServiceCategory[];
}

export function ServicesPageClient({ initialServices, initialCategories }: ServicesPageClientProps) {
    const [services, setServices] = useState<ServiceWithStats[]>(initialServices);
    const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories);
    const [activeTab, setActiveTab] = useState("services");

    // Statistiques globales
    const totalServices = services.length;
    const activeServices = services.filter(s => s.isActive).length;
    const totalRevenue = services.reduce((sum, service) => sum + service.totalRevenue, 0);
    const totalUsage = services.reduce((sum, service) => sum + service.totalUsage, 0);

    const handleServiceCreated = (newService: ServiceWithStats) => {
        setServices(prev => [newService, ...prev]);
    };

    const handleServiceUpdated = (updatedService: ServiceWithStats) => {
        setServices(prev => prev.map(service =>
            service.id === updatedService.id ? updatedService : service
        ));
    };

    const handleServiceDeleted = (serviceId: string) => {
        setServices(prev => prev.filter(service => service.id !== serviceId));
    };

    const handleCategoryCreated = (newCategory: ServiceCategory) => {
        setCategories(prev => [newCategory, ...prev]);
    };

    const handleCategoryUpdated = (updatedCategory: ServiceCategory) => {
        setCategories(prev => prev.map(category =>
            category.id === updatedCategory.id ? updatedCategory : category
        ));
    };

    const handleCategoryDeleted = (categoryId: string) => {
        setCategories(prev => prev.filter(category => category.id !== categoryId));
    };

    return (
        <ServicesContext.Provider value={{
            services,
            setServices,
            categories,
            setCategories,
            onServiceCreated: handleServiceCreated,
            onServiceUpdated: handleServiceUpdated,
            onServiceDeleted: handleServiceDeleted,
            onCategoryCreated: handleCategoryCreated,
            onCategoryUpdated: handleCategoryUpdated,
            onCategoryDeleted: handleCategoryDeleted,
        }}>
            <div className="space-y-6">
                {/* Statistiques */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Prestations</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalServices}</div>
                            <p className="text-xs text-muted-foreground">
                                {activeServices} actives
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
                            <Tag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{categories.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Catégories créées
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Utilisations</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalUsage}</div>
                            <p className="text-xs text-muted-foreground">
                                Total des utilisations
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
                            <Euro className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('fr-FR')} €</div>
                            <p className="text-xs text-muted-foreground">
                                CA généré
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Onglets */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="services" className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Prestations
                            </TabsTrigger>
                            <TabsTrigger value="categories" className="flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Catégories
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex gap-2">
                            {activeTab === "services" ? (
                                <CreateServiceButton />
                            ) : (
                                <CreateCategoryButton />
                            )}
                        </div>
                    </div>

                    <TabsContent value="services" className="space-y-4">
                        {services.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Aucune prestation</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        Commencez par ajouter votre première prestation.
                                    </p>
                                    <CreateServiceButton />
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {services.map((service) => (
                                    <ServiceCard key={service.id} service={service} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="categories" className="space-y-4">
                        {categories.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Aucune catégorie</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        Créez des catégories pour organiser vos prestations.
                                    </p>
                                    <CreateCategoryButton />
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {categories.map((category) => (
                                    <CategoryCard key={category.id} category={category} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </ServicesContext.Provider>
    );
} 