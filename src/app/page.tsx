import { Suspense } from 'react'
import SessionChecker from '@/components/SessionChecker'
import SearchParamsHandler from '@/components/SearchParamsHandler'
import HomeContent from '@/components/HomeContent'

/**
 * Page component (Server Component)
 *
 * IMPORTANT: This is a server component. Client components that use
 * useSearchParams() must be wrapped in <Suspense> to avoid hydration
 * mismatches in Next.js 16 (App Router).
 */
export default function Home() {
  return (
    <>
      <SessionChecker />
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      <HomeContent />
    </>
  )
}
