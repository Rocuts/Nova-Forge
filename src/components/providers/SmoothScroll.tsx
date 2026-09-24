"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

/**
 * The element the URL's fragment names (#gobierno), or null. A malformed
 * escape in the hash (decodeURIComponent throws) counts as no target.
 */
function fragmentTarget(): HTMLElement | null {
  const id = window.location.hash.slice(1)
  if (!id) return null
  try {
    return document.getElementById(decodeURIComponent(id))
  } catch {
    return null
  }
}

/**
 * Anchor links to this same page (#gobierno, #capacidades…) stay native <a>,
 * scrolled smoothly by globals.css: the browser moves the Tab starting point to
 * the section and scrolls again on a second click, which <Link> does not do.
 * But the history entry the browser creates for them has no state (null), and
 * the App Router ignores a popstate without state: after following a link from
 * that section to another page, Back changed the URL to /es#gobierno and left
 * the other page on screen. Once the native navigation has happened, the new
 * entry gets the router state of the entry the visitor came from, as Next does
 * itself for pushState calls from app code.
 */
function useNativeAnchorHistory() {
  useEffect(() => {
    // Router state for the entry the anchor navigation creates, bound to the
    // anchor's URL: taken on the click, spent on the first entry with exactly
    // that URL. A click that does not navigate here (a handler that takes over)
    // can leave it behind, but then it can only ever reach an entry of this
    // same page, never one of another page the visitor reaches later (a
    // fragment typed there would get this page's tree, and Back/Forward would
    // show this page under the other page's URL).
    let pending: { state: unknown; href: string } | null = null
    const restore = () => {
      const entry = pending
      if (entry === null || window.location.href !== entry.href) return
      pending = null
      if (window.history.state === null) window.history.replaceState(entry.state, "")
    }
    const onClick = (event: MouseEvent) => {
      // Clicks that open the link elsewhere (new tab or window, download),
      // filtered like <Link> does: the current page does not navigate.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = event.target instanceof Element ? event.target.closest("a") : null
      if (!(link instanceof HTMLAnchorElement) || !link.hash) return
      if ((link.target && link.target !== "_self") || link.hasAttribute("download")) return
      const { origin, pathname, search } = window.location
      if (link.origin !== origin || link.pathname !== pathname || link.search !== search) return
      // Nothing to copy from an entry without state (and replaceState(null)
      // would store {} through Next's patch, which a later popstate answers
      // with a full reload).
      const state: unknown = window.history.state
      pending = state === null ? null : { state, href: link.href }
      if (pending === null) return
      // The fragment navigation runs right after this click event, so the
      // timeout finds the new entry. It also covers a second click on the same
      // anchor, which fires no hashchange (a browser that follows the spec
      // replaces the entry, again without state; Chromium keeps the state);
      // hashchange covers a browser that navigates in a later task.
      window.setTimeout(restore)
    }
    // Capture phase: no handler on the way can stop it from seeing the click.
    document.addEventListener("click", onClick, true)
    window.addEventListener("hashchange", restore)
    return () => {
      document.removeEventListener("click", onClick, true)
      window.removeEventListener("hashchange", restore)
    }
  }, [])
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Last pathname the effect saw (null before the first run). Comparing paths,
  // not a "first run" flag, keeps StrictMode's double mount on the mount branch.
  const previousPathname = useRef<string | null>(null)

  useEffect(() => {
    const isRouteChange = previousPathname.current !== null && previousPathname.current !== pathname
    previousPathname.current = pathname

    // A URL that points at an element of the page (a shared link to
    // /es#gobierno, a reload after an anchor link, Back to /es#gobierno) keeps
    // the position the browser gave it: going to the top would undo exactly
    // what the URL asks for.
    if (fragmentTarget()) return

    if (isRouteChange) {
      // Instant on purpose: with `scroll-behavior: smooth` on <html> a plain
      // scrollTo animates, and it used to race Next's own scroll after a
      // navigation and leave the new page halfway down. data-scroll-behavior on
      // <html> (layout) now makes Next's scroll instant, but only that one: this
      // scrollTo runs later, in an effect, so it still opts out itself. Anchor
      // links keep the native smooth scroll.
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    } else {
      // Mount keeps the plain (smooth) scrollTo it always had. The page is
      // almost always at the top already; if the visitor scrolled before
      // hydration, an instant jump would yank them to the top and swallow the
      // click they were making, while a smooth scroll gives way to their own.
      window.scrollTo(0, 0)
    }
  }, [pathname])

  useNativeAnchorHistory()

  return <>{children}</>
}
