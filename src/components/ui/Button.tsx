"use client"
import { forwardRef } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MagneticButton } from "./MagneticButton"

type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  variant?: "primary" | "secondary" | "glass"
  size?: "sm" | "md" | "lg"
  href?: string
  target?: string
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
  magnetic?: boolean
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", onClick, href, target, children, magnetic = false, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-[var(--radius-sm)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-cyan disabled:pointer-events-none disabled:opacity-50"

    const variants = {
      primary: "bg-white text-black hover:bg-gray-200 shadow-lg",
      secondary: "border border-surface-border bg-transparent text-text-primary hover:bg-surface-border",
      glass: "glass-panel text-text-primary hover:bg-surface-elevated/80"
    }

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base"
    }

    const combinedClassName = cn(baseStyles, variants[variant], sizes[size], className)
    const ariaLabel = props["aria-label"] || (typeof children === "string" ? children : undefined)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      onClick?.(e)
    }

    if (href) {
      const isExternal = /^https?:\/\//.test(href) || href.startsWith("mailto:")
      const anchor = (
        <motion.a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={isExternal ? (target || "_blank") : target}
          rel={isExternal ? "noopener noreferrer" : undefined}
          whileTap={{ scale: 0.98 }}
          className={combinedClassName}
          onClick={handleClick}
          aria-label={ariaLabel}
        >
          {children}
        </motion.a>
      )
      return magnetic ? <MagneticButton>{anchor}</MagneticButton> : anchor
    }

    const button = (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={props.type || "button"}
        whileTap={{ scale: 0.98 }}
        className={combinedClassName}
        onClick={handleClick}
        aria-label={ariaLabel}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {children}
      </motion.button>
    )
    return magnetic ? <MagneticButton>{button}</MagneticButton> : button
  }
)
Button.displayName = "Button"
