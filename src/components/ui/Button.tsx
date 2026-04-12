"use client"
import { forwardRef } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MagneticButton } from "./MagneticButton"

type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  href?: string
  target?: string
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
  magnetic?: boolean
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", onClick, href, target, children, magnetic = false, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-[2px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variants = {
      primary: "bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]",
      secondary: "border border-[#d4d4d4] bg-transparent text-[#0a0a0a] hover:bg-[#f5f5f5] hover:border-[#a3a3a3]",
      ghost: "bg-transparent text-[#525252] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]",
    }

    const sizes = {
      sm: "px-5 py-2.5 text-xs font-medium tracking-wide",
      md: "px-7 py-3 text-sm font-medium",
      lg: "px-10 py-4 text-base font-medium",
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
