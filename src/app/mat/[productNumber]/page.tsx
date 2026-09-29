// /mat/1000, /mat/1001 ... — har product ka apna direct link (ebay /itm/ jaisa)
import connectDb from '@/app/lib/db'
import { backfillProductNumbers } from '@/app/lib/productNumber'
import { backfillStoreSlugs } from '@/app/lib/storeSlug'
import Grocery from '@/app/Models/grocery.model'
import User from '@/app/Models/user.model'
import { auth } from '@/auth'
import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import ProductDetail from '@/components/ProductDetail'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

async function getProduct(productNumberParam: string) {
  if (!/^\d+$/.test(productNumberParam)) return null
  await connectDb()
  await backfillProductNumbers()
  await backfillStoreSlugs()
  const product = await Grocery.findOne({ productNumber: Number(productNumberParam) }).populate(
    'seller',
    'name storeName storeSlug image'
  )
  return product ? JSON.parse(JSON.stringify(product)) : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productNumber: string }>
}): Promise<Metadata> {
  const { productNumber } = await params
  const product = await getProduct(productNumber)
  if (!product) return { title: 'Product not found | Ishymart' }
  return {
    title: `${product.name} | Ishymart`,
    description: `${product.name} - Rs ${product.price} / ${product.unit}`,
  }
}

async function ProductPage({ params }: { params: Promise<{ productNumber: string }> }) {
  const { productNumber } = await params
  const product = await getProduct(productNumber)
  if (!product) notFound()

  // Nav ko user chahiye (guest ke liye null) — home page wali tarah
  const session = await auth()
  const user = session?.user?.id ? await User.findById(session.user.id) : null
  const plainUser = user ? JSON.parse(JSON.stringify(user)) : null

  // Google ke liye product structured data (JSON-LD) — rich search result
  // (naam, price, availability) dikhne ke chances behtar karta hai
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://ishymart-grocery.vercel.app').replace(/\/$/, '')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    category: product.category,
    url: `${siteUrl}/mat/${product.productNumber}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/mat/${product.productNumber}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav user={plainUser} />
      <ProductDetail item={product} />
      <Footer />
    </>
  )
}

export default ProductPage
