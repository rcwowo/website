import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { type ButtonProps, buttonVariants } from '@/components/ui/button'

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

type PaginationLinkProps = {
  isActive?: boolean
  isDisabled?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>

const PaginationLink = ({
  className,
  isActive,
  isDisabled,
  size = 'icon',
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'default' : 'ghost',
        size,
      }),
      isDisabled && 'pointer-events-none opacity-50',
      className,
    )}
    {...props}
  />
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({
  className,
  isDisabled,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn('gap-1 pl-2.5', className)}
    isDisabled={isDisabled}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({
  className,
  isDisabled,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn('gap-1 pr-2.5', className)}
    isDisabled={isDisabled}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

const PaginationComponent: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  baseUrl,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const getPageUrl = (page: number) => {
    if (page === 1) return baseUrl
    return `${baseUrl}${page}`
  }

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <div className="flex items-center justify-between py-4">
      {/* Previous */}
      {hasPrev ? (
        <a
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent"
          href={getPageUrl(currentPage - 1)}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Prev</span>
        </a>
      ) : (
        <span className="text-sm text-muted-foreground/20">Prev</span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <a
            key={page}
            href={getPageUrl(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors duration-200',
              page === currentPage
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50',
            )}
          >
            {page}
          </a>
        ))}
      </div>

      {/* Next */}
      {hasNext ? (
        <a
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent"
          href={getPageUrl(currentPage + 1)}
          aria-label="Go to next page"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </a>
      ) : (
        <span className="text-sm text-muted-foreground/20">Next</span>
      )}
    </div>
  )
}

export default PaginationComponent
