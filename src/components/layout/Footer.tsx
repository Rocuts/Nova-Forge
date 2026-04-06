import Link from "next/link"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { siteConfig } from "@/config/site"
import { navItems } from "@/content/landing"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-surface-base/70 backdrop-blur-sm border-t border-surface-border pt-16 pb-8 relative z-10">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <h3 className="font-heading text-2xl font-semibold text-white mb-4">
              {siteConfig.name}
            </h3>
            <p className="text-text-secondary max-w-sm mb-6 leading-relaxed">
              Fábrica de software. Aplicaciones empresariales, plataformas SaaS y agentes de IA.
            </p>
            <div className="flex items-center gap-4">
              <a href={siteConfig.links.twitter} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-white transition-colors">Twitter X</a>
              <a href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-4">Navegación</h4>
            <ul className="space-y-3 text-text-secondary">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-primary-cyan transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-text-secondary">
              <li><TransitionLink href={siteConfig.legal.privacy} className="hover:text-white transition-colors">Privacidad</TransitionLink></li>
              <li><TransitionLink href={siteConfig.legal.terms} className="hover:text-white transition-colors">Términos</TransitionLink></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-surface-border text-center text-text-secondary text-sm">
          &copy; {currentYear} {siteConfig.legalName}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
