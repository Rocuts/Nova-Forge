import { notFound } from "next/navigation"

// Catch-all for unmatched routes: triggers the branded not-found page
// within the locale layout (header + footer).
export default function CatchAllPage() {
  notFound()
}
