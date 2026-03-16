import { headers } from 'next/headers'

export async function getBaseUrl() {
  try {
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = host?.includes('localhost') ? 'http' : 'https'
    
    if (host) {
      return `${protocol}://${host}`
    }
  } catch (e) {
    // Fallback if headers() is not available (e.g. static gen)
  }

  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? 
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? 
    'http://localhost:3000'

  url = url.includes('http') ? url : `https://${url}`
  return url.replace(/\/$/, '')
}
