
"use client"

import { SearchIcon, Loader2 } from 'lucide-react'
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { searchFiltersAction } from '@/action/user-actions'
import { useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Card, CardContent } from '@/components/ui/card'
import { FileTextIcon, UserIcon, FileIcon, Settings } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { type SearchResult } from '@/validation/user-schema'
import { Button } from '../ui/button'

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const searchRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Configure the search action
    const { execute } = useAction(searchFiltersAction, {
        onSuccess: (data) => {
            setIsLoading(false)
            if (data.data?.success && data.data.data) {
                setSearchResults(data.data.data.results || [])
                setError(null)
            }
        },
        onError: (error) => {
            setIsLoading(false)
            console.error("Erreur de recherche:", error)
            setError("Erreur lors de la recherche")
            setSearchResults([])
        }
    })

    // Reset active index when results change
    useEffect(() => {
        setActiveIndex(-1)
    }, [searchResults])

    // Debounce search to avoid excessive server requests
    const debouncedSearch = useDebouncedCallback(
        (value: string) => {
            if (value.trim().length > 0) {
                setIsLoading(true)
                execute({ query: value })
                setIsSearchOpen(true)
            } else {
                setIsSearchOpen(false)
                setSearchResults([])
            }
        },
        300 // 300ms delay
    )

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
        debouncedSearch(value)
    }

    // Handle result click
    const handleResultClick = (url: string, result: SearchResult) => {
        // For client results, redirect to the clients page with search param
        if (result.type === 'client') {
            router.push(`/dashboard/clients?search=${encodeURIComponent(result.title)}`);
        } else if (result.type === 'service') {
            // Toujours rediriger vers l'onglet prestations avec la recherche
            router.push(`/dashboard/services?type=services&search=${encodeURIComponent(result.title)}`);
        } else {
            router.push(url);
        }
        setIsSearchOpen(false);
        setSearchQuery('');
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (!isSearchOpen || searchResults.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                if (activeIndex >= 0 && activeIndex < searchResults.length) {
                    e.preventDefault();
                    const result = searchResults[activeIndex];
                    handleResultClick(result.url, result);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsSearchOpen(false);
                break;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Get the appropriate icon for the result type
    const getResultIcon = (type: string) => {
        switch (type) {
            case 'invoice':
                return <FileTextIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            case 'quote':
                return <FileIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            case 'client':
                return <UserIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            case 'service':
                return <Settings className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            default:
                return <SearchIcon className="h-4 w-4 text-muted-foreground" />
        }
    }

    return (
        <div className="relative hidden md:block" ref={searchRef} onKeyDown={handleKeyDown}>
            <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <Input
                    type="search"
                    value={searchQuery}
                    onChange={handleInputChange}
                    placeholder="Rechercher un client, une facture ou un devis ..."
                    className="w-[200px] rounded-md pl-8 md:w-[240px] lg:w-[320px]"
                    onFocus={() => {
                        if (searchQuery.trim().length > 0) {
                            setIsSearchOpen(true)
                        }
                    }}
                />
            </motion.div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 mt-1 w-full"
                    >
                        <Card className="overflow-hidden shadow-lg">
                            <CardContent className="p-0">
                                {error ? (
                                    <p className="p-3 text-sm text-red-500">Erreur: {error}</p>
                                ) : isLoading ? (
                                    <div className="flex items-center justify-center p-6 flex-col gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Recherche en cours...</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <ul className="max-h-[400px] overflow-auto" role="listbox">
                                        {searchResults.map((result, index: number) => (
                                            <li
                                                key={`${result.type}-${result.id}`}
                                                className="border-b border-border/50 last:border-0"
                                                role="option"
                                                aria-selected={index === activeIndex}
                                            >
                                                <Button
                                                    onClick={() => handleResultClick(result.url, result)}
                                                    className={`w-full justify-start gap-3 p-3 h-auto bg-transparent hover:bg-muted/50 transition-colors duration-200 ${index === activeIndex ? 'bg-muted/50 ring-1 ring-primary/20' : ''
                                                        }`}
                                                    tabIndex={0}
                                                    onFocus={() => setActiveIndex(index)}
                                                    onMouseEnter={() => setActiveIndex(index)}
                                                >
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/80 border border-border/50 flex-shrink-0">
                                                        {getResultIcon(result.type)}
                                                    </span>
                                                    <div className="flex-1 overflow-hidden text-left min-w-0">
                                                        <p className="truncate font-medium text-foreground text-sm leading-tight">
                                                            {result.title}
                                                        </p>
                                                        <p className="truncate text-xs text-muted-foreground mt-0.5 leading-tight">
                                                            {result.description}
                                                        </p>
                                                    </div>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : searchQuery.trim().length > 0 ? (
                                    <p className="p-3 text-sm text-muted-foreground">Aucun résultat trouvé</p>
                                ) : null}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
