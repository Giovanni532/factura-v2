"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ServiceWithStats, ServiceCategory } from "@/validation/service-schema";
import { ServiceCard } from "@/components/services/service-card";
import { CategoryCard } from "@/components/services/category-card";
import { CreateServiceButton } from "@/components/services/create-service-button";
import { CreateCategoryButton } from "@/components/services/create-category-button";
import { ServicesContext } from "../../hooks/services-context";
import { Briefcase, Tag, TrendingUp, Package, Euro, Search, Filter, X } from "lucide-react";

interface ServicesPageClientProps {
    initialServices: ServiceWithStats[];
    initialCategories: ServiceCategory[];
}

export function ServicesPageClient({ initialServices, initialCategories }: ServicesPageClientProps) {
    const [services, setServices] = useState<ServiceWithStats[]>(initialServices);
    const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories);
    const [activeTab, setActiveTab] = useState("services");

    // Filtres pour les services
    const [serviceSearch, setServiceSearch] = useState("");
    const [serviceStatusFilter, setServiceStatusFilter] = useState<string>("all");
    const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>("all");

    // Filtres pour les catégories
    const [categorySearch, setCategorySearch] = useState("");
    const [categoryServiceCountFilter, setCategoryServiceCountFilter] = useState<string>("all");

    // Statistiques globales
    const totalServices = services.length;
    const activeServices = services.filter(s => s.isActive).length;
    const totalRevenue = services.reduce((sum, service) => sum + service.totalRevenue, 0);
    const totalUsage = services.reduce((sum, service) => sum + service.totalUsage, 0);

    // Services filtrés
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            // Filtre par recherche
            const matchesSearch = service.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                (service.description && service.description.toLowerCase().includes(serviceSearch.toLowerCase()));

            // Filtre par statut
            const matchesStatus = serviceStatusFilter === "all" ||
                (serviceStatusFilter === "active" && service.isActive) ||
                (serviceStatusFilter === "inactive" && !service.isActive);

            // Filtre par catégorie
            const matchesCategory = serviceCategoryFilter === "all" ||
                service.category === serviceCategoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [services, serviceSearch, serviceStatusFilter, serviceCategoryFilter]);

    // Catégories filtrées
    const filteredCategories = useMemo(() => {
        return categories.filter(category => {
            // Filtre par recherche
            const matchesSearch = category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                (category.description && category.description.toLowerCase().includes(categorySearch.toLowerCase()));

            // Filtre par nombre de services
            const matchesServiceCount = categoryServiceCountFilter === "all" ||
                (categoryServiceCountFilter === "empty" && category.serviceCount === 0) ||
                (categoryServiceCountFilter === "with-services" && category.serviceCount > 0);

            return matchesSearch && matchesServiceCount;
        });
    }, [categories, categorySearch, categoryServiceCountFilter]);

    // Obtenir les catégories uniques pour le filtre
    const uniqueCategories = useMemo(() => {
        const categoryNames = [...new Set(services.map(s => s.category).filter((category): category is string => category !== null))];
        return categoryNames.sort();
    }, [services]);

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

    const clearServiceFilters = () => {
        setServiceSearch("");
        setServiceStatusFilter("all");
        setServiceCategoryFilter("all");
    };

    const clearCategoryFilters = () => {
        setCategorySearch("");
        setCategoryServiceCountFilter("all");
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
                        {/* Filtres pour les services */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    Filtres
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Recherche */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input
                                            placeholder="Rechercher une prestation..."
                                            value={serviceSearch}
                                            onChange={(e) => setServiceSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    {/* Filtre par statut */}
                                    <Select value={serviceStatusFilter} onValueChange={setServiceStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les statuts</SelectItem>
                                            <SelectItem value="active">Actives</SelectItem>
                                            <SelectItem value="inactive">Inactives</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Filtre par catégorie */}
                                    <Select value={serviceCategoryFilter} onValueChange={setServiceCategoryFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Catégorie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Toutes les catégories</SelectItem>
                                            {uniqueCategories.map(category => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Bouton pour effacer les filtres */}
                                {(serviceSearch || serviceStatusFilter !== "all" || serviceCategoryFilter !== "all") && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearServiceFilters}
                                        className="flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Effacer les filtres
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Résultats */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {filteredServices.length} prestation{filteredServices.length > 1 ? 's' : ''} trouvée{filteredServices.length > 1 ? 's' : ''}
                            </p>
                        </div>

                        {filteredServices.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        {services.length === 0 ? "Aucune prestation" : "Aucun résultat"}
                                    </h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        {services.length === 0
                                            ? "Commencez par ajouter votre première prestation."
                                            : "Aucune prestation ne correspond à vos critères de recherche."
                                        }
                                    </p>
                                    {services.length === 0 && <CreateServiceButton />}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredServices.map((service) => (
                                    <ServiceCard key={service.id} service={service} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="categories" className="space-y-4">
                        {/* Filtres pour les catégories */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    Filtres
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Recherche */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input
                                            placeholder="Rechercher une catégorie..."
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    {/* Filtre par nombre de services */}
                                    <Select value={categoryServiceCountFilter} onValueChange={setCategoryServiceCountFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Services" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Toutes les catégories</SelectItem>
                                            <SelectItem value="empty">Sans prestations</SelectItem>
                                            <SelectItem value="with-services">Avec prestations</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Bouton pour effacer les filtres */}
                                {(categorySearch || categoryServiceCountFilter !== "all") && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearCategoryFilters}
                                        className="flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Effacer les filtres
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Résultats */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''} trouvée{filteredCategories.length > 1 ? 's' : ''}
                            </p>
                        </div>

                        {filteredCategories.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        {categories.length === 0 ? "Aucune catégorie" : "Aucun résultat"}
                                    </h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        {categories.length === 0
                                            ? "Créez des catégories pour organiser vos prestations."
                                            : "Aucune catégorie ne correspond à vos critères de recherche."
                                        }
                                    </p>
                                    {categories.length === 0 && <CreateCategoryButton />}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredCategories.map((category) => (
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