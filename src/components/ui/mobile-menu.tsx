import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu } from 'lucide-react'

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleViewTransitionStart = () => {
      setIsOpen(false)
    }

    document.addEventListener('astro:before-swap', handleViewTransitionStart)

    return () => {
      document.removeEventListener(
        'astro:before-swap',
        handleViewTransitionStart,
      )
    }
  }, [])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className="md:hidden"
          title="Menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background">
        <DropdownMenuItem>
          <a
            href="https://memos.ltwilson.tv"
            className="w-full text-lg font-medium capitalize"
            onClick={() => setIsOpen(false)}
          >
            Memos
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a
            href="/blog"
            className="w-full text-lg font-medium capitalize"
            onClick={() => setIsOpen(false)}
          >
            Blog
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a
            href="https://vods.ltwilson.tv"
            className="w-full text-lg font-medium capitalize"
            onClick={() => setIsOpen(false)}
          >
            VOD Vault
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MobileMenu
