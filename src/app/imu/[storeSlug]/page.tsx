// /imu/<store-name> — har seller store ka apna public link (login ki zaroorat nahi)
import connectDb from '@/app/lib/db'
import { backfillProductNumbers } from '@/app/lib/productNumber'
import { backfillStoreSlugs } from '@/app/lib/storeSlug'
import Feedback from '@/app/Models/feedback.model'
import Grocery from '@/app/Models/grocery.model'
import User from '@/app/Models/user.model'
import { auth } from '@/auth'
import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import StoreProfile from '@/components/StoreProfile'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

async function getStore(slugParam: string) {
  let slug = slugParam
  try {
    slug = decodeURIComponent(slugParam)
  } catch {}
  slug = slug.trim().toLowerCase()
  if (!slug) return null

  await connectDb()
  await backfillStoreSlugs()
  await backfillProductNumbers()

  const seller = await User.findOne({
    storeSlug: slug,
    sellerStatus: { $in: ['approved', 'suspended'] },
  }).select('name image storeName storeSlug createdAt sellerStatus')
  if (!seller) return null

  const [products, feedbacks] = await Promise.all([
    Grocery.find({ seller: seller._id }).sort({ createdAt: -1 }),
    Feedback.find({ seller: seller._id }).populate('buyer', 'name image').sort({ createdAt: -1 }),
  ])

  const avgRating =
    feedbacks.length > 0 ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length : 0

  return JSON.parse(
    JSON.stringify({ seller, products, feedbacks, avgRating, totalReviews: feedbacks.length })
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>
}): Promise<Metadata> {
  const { storeSlug } = await params
  const data = await getStore(storeSlug)
  if (!data) return { title: 'Store not found | Ishymart' }
  const name = data.seller.storeName || data.seller.name
  return { title: `${name} | Ishymart`, description: `Shop from ${name} on Ishymart` }
}

async function StorePage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params
  const data = await getStore(storeSlug)
  if (!data) notFound()

  // Nav ko user chahiye (guest ke liye null) — home page wali tarah
  const session = await auth()
  const user = session?.user?.id ? await User.findById(session.user.id) : null
  const plainUser = user ? JSON.parse(JSON.stringify(user)) : null

  const sinceLabel = new Date(data.seller.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <>
      <Nav user={plainUser} />
      <StoreProfile
        seller={data.seller}
        sinceLabel={sinceLabel}
        products={data.products}
        feedbacks={data.feedbacks}
        avgRating={data.avgRating}
        totalReviews={data.totalReviews}
      />
      <Footer />
    </>
  )
}

export default StorePage
