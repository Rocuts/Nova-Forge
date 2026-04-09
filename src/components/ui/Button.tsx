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
    const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-cyan disabled:pointer-events-none disabled:opacity-50"

    const variants = {
      primary: "bg-gradient-to-r from-primary-cyan to-[#00b5d8] text-black font-extrabold hover:shadow-[0_0_40px_rgba(0,229,255,0.6)] shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:from-[#00f0ff] hover:to-[#00c5dd]",
      secondary: "border border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10 hover:text-white hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-xl",
      glass: "glass-panel bg-surface-elevated/40 text-zinc-100 hover:bg-white/10 border-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-xl"
    }

    const sizes = {
      sm: "px-5 py-2.5 text-xs tracking-wide",
      md: "px-8 py-3 text-sm tracking-wide",
      lg: "px-12 py-4 text-base tracking-wide"
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
