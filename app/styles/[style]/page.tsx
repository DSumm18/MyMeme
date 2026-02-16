import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { styles, getStyleBySlug, getAllStyleSlugs } from '@/lib/styles-config'
import StylePageClient from './StylePageClient'

export async function generateStaticParams() {
  return getAllStyleSlugs().map((style) => ({ style }))
}

export async function generateMetadata({ params }: { params: Promise<{ style: string }> }): Promise<Metadata> {
  const { style: slug } = await params
  const style = getStyleBySlug(slug)
  if (!style) return { title: 'Style Not Found' }
  return {
    title: style.metaTitle,
    description: style.metaDescription,
    openGraph: {
      title: style.metaTitle,
      description: style.metaDescription,
      images: [{ url: style.image, width: 1024, height: 1024, alt: `${style.name} AI art style example` }],
    },
  }
}

export default async function StylePage({ params }: { params: Promise<{ style: string }> }) {
  const { style: slug } = await params
  const style = getStyleBySlug(slug)
  if (!style) notFound()

  // Get related styles (exclude current)
  const related = styles.filter((s) => s.slug !== slug).slice(0, 4)

  return <StylePageClient style={style} relatedStyles={related} />
}
