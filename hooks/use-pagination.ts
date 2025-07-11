interface UsePaginationProps {
    currentPage: number
    totalPages: number
    paginationItemsToDisplay: number
}

interface UsePaginationReturn {
    pages: number[]
    showLeftEllipsis: boolean
    showRightEllipsis: boolean
}

export function usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay,
}: UsePaginationProps): UsePaginationReturn {
    const halfDisplay = Math.floor(paginationItemsToDisplay / 2)

    let startPage = Math.max(1, currentPage - halfDisplay)
    let endPage = Math.min(totalPages, startPage + paginationItemsToDisplay - 1)

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < paginationItemsToDisplay) {
        startPage = Math.max(1, endPage - paginationItemsToDisplay + 1)
    }

    const pages = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    )

    const showLeftEllipsis = startPage > 1
    const showRightEllipsis = endPage < totalPages

    return {
        pages,
        showLeftEllipsis,
        showRightEllipsis,
    }
} 