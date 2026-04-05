"use client"
import Link, { type LinkProps } from "next/link"
import { useRouter } from "next/navigation"
import { type ReactNode, useCallback } from "react"

interface TransitionLinkProps extends LinkProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function TransitionLink({ children, className, onClick, href, ...props }: TransitionLinkProps) {
  const router = useRouter()

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    onClick?.()

    const url = typeof href === "string" ? href : href.pathname || "/"

    // Use View Transitions API if available
    if ("startViewTransition" in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        router.push(url)
      })
    } else {
      router.push(url)
    }
  }, [href, onClick, router])

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
