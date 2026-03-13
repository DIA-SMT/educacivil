export function getBaseUrl() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your production URL in Vercel dashboard
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    'http://localhost:3000'

  // Make sure to include `https://` when not localhost
  url = url.includes('http') ? url : `https://${url}`
  
  // Remove trailing slash if present
  return url.replace(/\/$/, '')
}
