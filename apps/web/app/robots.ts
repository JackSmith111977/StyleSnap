import { type MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stylesnap.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/auth/callback',
          '/api/',
          '/actions/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
