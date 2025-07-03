"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import {
    IconDownload,
    IconEye,
    IconChartBar,
    IconReportMoney,
    IconCalculator,
    IconTrendingUp,
    IconFileText,
    IconFilter,
    IconRefresh,
    IconAlertCircle
} from "@tabler/icons-react"
import { CalendarIcon } from "lucide-react"
import {
    generateReportAction,
    getFiscalYearsAction,
    getReportStatsAction
} from "@/action/reports-actions"

interface ReportsClientProps {
    // Props initiales facultatives
    initialStats?: {
        revenue: { current: number; change: number }
        expenses: { current: number; change: number }
        netIncome: { current: number; change: number }
        pendingPayments: { current: number; change: number }
    } | null
}

interface Report {
    id: string
    name: string
    description: string
    type: "balance_sheet" | "income_statement" | "cash_flow" | "trial_balance"
    icon: any
    category: "financial" | "management" | "legal"
    frequency: "monthly" | "quarterly" | "yearly"
}

interface FiscalYear {
    id: string
    name: string
    startDate: Date
    endDate: Date
    isClosed: boolean
}

export function ReportsClient({ initialStats }: ReportsClientProps) {
    const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("")
    const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf")
    const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([])
    const [stats, setStats] = useState(initialStats)
    const [customDateRange, setCustomDateRange] = useState<{
        startDate: Date | undefined
        endDate: Date | undefined
    }>({ startDate: undefined, endDate: undefined })
    const [showCustomDateDialog, setShowCustomDateDialog] = useState(false)
    const [generatedReport, setGeneratedReport] = useState<any>(null)
    const [showReportDialog, setShowReportDialog] = useState(false)

    // Définition des rapports disponibles
    const reports: Report[] = [
        {
            id: "balance_sheet",
            name: "Bilan comptable",
            description: "Situation financière à une date donnée (actif, passif, capitaux propres)",
            type: "balance_sheet",
            icon: IconReportMoney,
            category: "financial",
            frequency: "yearly"
        },
        {
            id: "income_statement",
            name: "Compte de résultat",
            description: "Résultat de l'exercice (produits, charges, bénéfice)",
            type: "income_statement",
            icon: IconCalculator,
            category: "financial",
            frequency: "yearly"
        },
        {
            id: "cash_flow",
            name: "Tableau des flux de trésorerie",
            description: "Évolution des encaissements et décaissements",
            type: "cash_flow",
            icon: IconTrendingUp,
            category: "management",
            frequency: "monthly"
        },
        {
            id: "trial_balance",
            name: "Balance de vérification",
            description: "Vérification de l'équilibre des comptes comptables",
            type: "trial_balance",
            icon: IconChartBar,
            category: "legal",
            frequency: "quarterly"
        }
    ]

    // Actions
    const { execute: executeGenerateReport, isPending: isGeneratingReport } = useAction(generateReportAction, {
        onSuccess: (result: any) => {
            if (result?.data?.data) {
                setGeneratedReport(result.data.data);
                setShowReportDialog(true);
                toast.success(result.data.message || "Rapport généré avec succès");
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la génération du rapport");
        }
    });

    const { execute: executeGetFiscalYears, isPending: isLoadingFiscalYears } = useAction(getFiscalYearsAction, {
        onSuccess: (result: any) => {
            if (result?.data?.data) {
                setFiscalYears(result.data.data);
                // Sélectionner l'exercice en cours par défaut
                const currentYear = result.data.data.find((fy: any) => !fy.isClosed);
                if (currentYear) {
                    setSelectedFiscalYear(currentYear.id);
                }
            }
        },
        onError: (error) => {
            toast.error("Erreur lors du chargement des exercices comptables");
        }
    });

    const { execute: executeGetStats, isPending: isLoadingStats } = useAction(getReportStatsAction, {
        onSuccess: (result: any) => {
            if (result?.data?.data) {
                setStats(result.data.data);
            }
        },
        onError: (error) => {
            toast.error("Erreur lors du chargement des statistiques");
        }
    });

    // Charger les données initiales
    useEffect(() => {
        executeGetFiscalYears({});
        if (!initialStats) {
            executeGetStats({});
        }
    }, []);

    // Mettre à jour les stats quand l'exercice change
    useEffect(() => {
        if (selectedFiscalYear) {
            executeGetStats({ fiscalYearId: selectedFiscalYear });
        }
    }, [selectedFiscalYear]);

    const handleGenerateReport = (reportType: "balance_sheet" | "income_statement" | "cash_flow" | "trial_balance") => {
        const params: any = {
            type: reportType,
            format: selectedFormat
        };

        if (customDateRange.startDate && customDateRange.endDate) {
            params.startDate = format(customDateRange.startDate, "yyyy-MM-dd");
            params.endDate = format(customDateRange.endDate, "yyyy-MM-dd");
        } else if (selectedFiscalYear) {
            params.fiscalYearId = selectedFiscalYear;
        }

        executeGenerateReport(params);
    };

    const handleViewReport = (reportType: "balance_sheet" | "income_statement" | "cash_flow" | "trial_balance") => {
        // Pour l'instant, générer en format PDF pour la visualisation
        const params: any = {
            type: reportType,
            format: "pdf"
        };

        if (customDateRange.startDate && customDateRange.endDate) {
            params.startDate = format(customDateRange.startDate, "yyyy-MM-dd");
            params.endDate = format(customDateRange.endDate, "yyyy-MM-dd");
        } else if (selectedFiscalYear) {
            params.fiscalYearId = selectedFiscalYear;
        }

        executeGenerateReport(params);
    };

    const getCategoryColor = (category: Report["category"]) => {
        switch (category) {
            case "financial": return "bg-blue-100 text-blue-800";
            case "management": return "bg-green-100 text-green-800";
            case "legal": return "bg-purple-100 text-purple-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getCategoryLabel = (category: Report["category"]) => {
        switch (category) {
            case "financial": return "Financier";
            case "management": return "Gestion";
            case "legal": return "Légal";
            default: return category;
        }
    };

    const getFrequencyLabel = (frequency: Report["frequency"]) => {
        switch (frequency) {
            case "monthly": return "Mensuel";
            case "quarterly": return "Trimestriel";
            case "yearly": return "Annuel";
            default: return frequency;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    };

    return (
        <div className="space-y-6">
            {/* En-tête avec contrôles */}
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Rapports comptables</h1>
                    <p className="text-muted-foreground">
                        Générez et consultez vos rapports financiers et comptables
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Sélection de l'exercice comptable */}
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Exercice comptable</Label>
                        <Select
                            value={selectedFiscalYear}
                            onValueChange={setSelectedFiscalYear}
                            disabled={isLoadingFiscalYears}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Sélectionner..." />
                            </SelectTrigger>
                            <SelectContent>
                                {fiscalYears.map((fy) => (
                                    <SelectItem key={fy.id} value={fy.id}>
                                        <div className="flex items-center space-x-2">
                                            <span>{fy.name}</span>
                                            {fy.isClosed && (
                                                <Badge variant="secondary" className="ml-1 text-xs">
                                                    Clôturé
                                                </Badge>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Période personnalisée */}
                    <Dialog open={showCustomDateDialog} onOpenChange={setShowCustomDateDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                Période personnalisée
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Sélectionner une période</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date de début</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {customDateRange.startDate ? format(customDateRange.startDate, "dd/MM/yyyy") : "Sélectionner"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={customDateRange.startDate}
                                                    onSelect={(date) => setCustomDateRange(prev => ({ ...prev, startDate: date }))}
                                                    locale={fr}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date de fin</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {customDateRange.endDate ? format(customDateRange.endDate, "dd/MM/yyyy") : "Sélectionner"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={customDateRange.endDate}
                                                    onSelect={(date) => setCustomDateRange(prev => ({ ...prev, endDate: date }))}
                                                    locale={fr}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => setShowCustomDateDialog(false)}
                                    disabled={!customDateRange.startDate || !customDateRange.endDate}
                                >
                                    Appliquer la période
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Format d'export */}
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Format</Label>
                        <Select value={selectedFormat} onValueChange={(value: "pdf" | "excel" | "csv") => setSelectedFormat(value)}>
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="excel">Excel</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Actualiser */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            executeGetFiscalYears({});
                            executeGetStats({ fiscalYearId: selectedFiscalYear });
                        }}
                        disabled={isLoadingFiscalYears || isLoadingStats}
                    >
                        <IconRefresh className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Statistiques rapides */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
                            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.revenue.current)}</div>
                            <p className={`text-xs ${stats.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(stats.revenue.change)} vs période précédente
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Charges</CardTitle>
                            <IconCalculator className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.expenses.current)}</div>
                            <p className={`text-xs ${stats.expenses.change <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(stats.expenses.change)} vs période précédente
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Résultat net</CardTitle>
                            <IconReportMoney className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.netIncome.current)}</div>
                            <p className={`text-xs ${stats.netIncome.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(stats.netIncome.change)} vs période précédente
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Créances en attente</CardTitle>
                            <IconAlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.pendingPayments.current)}</div>
                            <p className={`text-xs ${stats.pendingPayments.change <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(stats.pendingPayments.change)} vs période précédente
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Alerte si aucun exercice sélectionné */}
            {!selectedFiscalYear && !customDateRange.startDate && (
                <Alert>
                    <IconAlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Sélectionnez un exercice comptable ou une période personnalisée pour générer des rapports.
                    </AlertDescription>
                </Alert>
            )}

            {/* Grille des rapports */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-muted rounded-lg">
                                        <report.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{report.name}</CardTitle>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Badge className={getCategoryColor(report.category)}>
                                                {getCategoryLabel(report.category)}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {getFrequencyLabel(report.frequency)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                {report.description}
                            </p>

                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleViewReport(report.type)}
                                    disabled={isGeneratingReport || (!selectedFiscalYear && !customDateRange.startDate)}
                                >
                                    <IconEye className="h-4 w-4 mr-2" />
                                    Voir
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleGenerateReport(report.type)}
                                    disabled={isGeneratingReport || (!selectedFiscalYear && !customDateRange.startDate)}
                                >
                                    <IconDownload className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Actions rapides pour la gestion */}
            <Card>
                <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Raccourcis vers les analyses courantes
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Button
                            variant="outline"
                            className="h-20 flex-col space-y-2"
                            onClick={() => handleViewReport('cash_flow')}
                            disabled={isGeneratingReport || (!selectedFiscalYear && !customDateRange.startDate)}
                        >
                            <IconTrendingUp className="h-6 w-6" />
                            <span className="text-sm">Flux de trésorerie</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex-col space-y-2"
                            onClick={() => handleViewReport('income_statement')}
                            disabled={isGeneratingReport || (!selectedFiscalYear && !customDateRange.startDate)}
                        >
                            <IconCalculator className="h-6 w-6" />
                            <span className="text-sm">Résultats</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex-col space-y-2"
                            onClick={() => handleViewReport('trial_balance')}
                            disabled={isGeneratingReport || (!selectedFiscalYear && !customDateRange.startDate)}
                        >
                            <IconChartBar className="h-6 w-6" />
                            <span className="text-sm">Balance</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex-col space-y-2"
                            onClick={() => handleViewReport('balance_sheet')}
                            disabled={isGeneratingReport || (!selectedFiscalYear && !customDateRange.startDate)}
                        >
                            <IconReportMoney className="h-6 w-6" />
                            <span className="text-sm">Bilan</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isGeneratingReport && (
                <Alert>
                    <IconRefresh className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                        Génération du rapport en cours...
                    </AlertDescription>
                </Alert>
            )}

            {/* Modal pour afficher les rapports générés */}
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {generatedReport?.type === 'balance_sheet' && 'Bilan comptable'}
                            {generatedReport?.type === 'income_statement' && 'Compte de résultat'}
                            {generatedReport?.type === 'cash_flow' && 'Tableau des flux de trésorerie'}
                            {generatedReport?.type === 'trial_balance' && 'Balance de vérification'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {generatedReport?.type === 'balance_sheet' && (
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    Date: {generatedReport.date && format(new Date(generatedReport.date), "dd/MM/yyyy")}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold mb-2">Actifs</h4>
                                        <div className="space-y-1">
                                            {generatedReport.assets.current.map((asset: any, index: number) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span>{asset.name}</span>
                                                    <span>{formatCurrency(asset.amount)}</span>
                                                </div>
                                            ))}
                                            <div className="border-t pt-1 font-semibold flex justify-between">
                                                <span>Total Actifs</span>
                                                <span>{formatCurrency(generatedReport.assets.totalAssets)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">Passifs & Capitaux propres</h4>
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium">Passifs</div>
                                            {generatedReport.liabilities.current.map((liability: any, index: number) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span>{liability.name}</span>
                                                    <span>{formatCurrency(liability.amount)}</span>
                                                </div>
                                            ))}
                                            <div className="text-sm font-medium mt-2">Capitaux propres</div>
                                            {generatedReport.equity.items.map((equity: any, index: number) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span>{equity.name}</span>
                                                    <span>{formatCurrency(equity.amount)}</span>
                                                </div>
                                            ))}
                                            <div className="border-t pt-1 font-semibold flex justify-between">
                                                <span>Total Passifs & Capitaux</span>
                                                <span>{formatCurrency(generatedReport.totalLiabilitiesAndEquity)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {generatedReport?.type === 'income_statement' && (
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    Période: {generatedReport.startDate && format(new Date(generatedReport.startDate), "dd/MM/yyyy")} - {generatedReport.endDate && format(new Date(generatedReport.endDate), "dd/MM/yyyy")}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Revenus</h4>
                                        <div className="space-y-1">
                                            {generatedReport.revenue.items.map((item: any, index: number) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span>{item.name}</span>
                                                    <span>{formatCurrency(item.amount)}</span>
                                                </div>
                                            ))}
                                            <div className="border-t pt-1 font-semibold flex justify-between">
                                                <span>Total Revenus</span>
                                                <span>{formatCurrency(generatedReport.revenue.totalRevenue)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">Dépenses</h4>
                                        <div className="space-y-1">
                                            {generatedReport.expenses.items.map((item: any, index: number) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span>{item.name}</span>
                                                    <span>{formatCurrency(item.amount)}</span>
                                                </div>
                                            ))}
                                            <div className="border-t pt-1 font-semibold flex justify-between">
                                                <span>Total Dépenses</span>
                                                <span>{formatCurrency(generatedReport.expenses.totalExpenses)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-2">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Résultat Net</span>
                                            <span className={generatedReport.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {formatCurrency(generatedReport.netIncome)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {generatedReport?.type === 'cash_flow' && (
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    Période: {generatedReport.startDate && format(new Date(generatedReport.startDate), "dd/MM/yyyy")} - {generatedReport.endDate && format(new Date(generatedReport.endDate), "dd/MM/yyyy")}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Flux d'exploitation</h4>
                                        <div className="space-y-1">
                                            {generatedReport.operating.inflows.map((item: any, index: number) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span>{item.name}</span>
                                                    <span className="text-green-600">+{formatCurrency(item.amount)}</span>
                                                </div>
                                            ))}
                                            {generatedReport.operating.outflows.map((item: any, index: number) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span>{item.name}</span>
                                                    <span className="text-red-600">-{formatCurrency(item.amount)}</span>
                                                </div>
                                            ))}
                                            <div className="border-t pt-1 font-semibold flex justify-between">
                                                <span>Flux net d'exploitation</span>
                                                <span className={generatedReport.operating.netOperating >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {formatCurrency(generatedReport.operating.netOperating)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-2">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Flux de trésorerie net</span>
                                            <span className={generatedReport.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {formatCurrency(generatedReport.netCashFlow)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {generatedReport?.type === 'trial_balance' && (
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    Période: {generatedReport.startDate && format(new Date(generatedReport.startDate), "dd/MM/yyyy")} - {generatedReport.endDate && format(new Date(generatedReport.endDate), "dd/MM/yyyy")}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-2">Code</th>
                                                <th className="text-left p-2">Compte</th>
                                                <th className="text-right p-2">Débit</th>
                                                <th className="text-right p-2">Crédit</th>
                                                <th className="text-right p-2">Solde</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {generatedReport.accounts.map((account: any, index: number) => (
                                                <tr key={index} className="border-b">
                                                    <td className="p-2">{account.code}</td>
                                                    <td className="p-2">{account.name}</td>
                                                    <td className="text-right p-2">{formatCurrency(account.debit)}</td>
                                                    <td className="text-right p-2">{formatCurrency(account.credit)}</td>
                                                    <td className="text-right p-2">{formatCurrency(account.balance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t font-semibold">
                                                <td className="p-2" colSpan={2}>Total</td>
                                                <td className="text-right p-2">{formatCurrency(generatedReport.totalDebits)}</td>
                                                <td className="text-right p-2">{formatCurrency(generatedReport.totalCredits)}</td>
                                                <td className="text-right p-2">
                                                    {generatedReport.isBalanced ? (
                                                        <span className="text-green-600">Équilibré</span>
                                                    ) : (
                                                        <span className="text-red-600">Non équilibré</span>
                                                    )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
} 