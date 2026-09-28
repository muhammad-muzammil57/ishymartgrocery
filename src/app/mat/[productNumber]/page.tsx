// /mat/1000, /mat/1001 ... — har product ka apna direct link (ebay /itm/ jaisa)
import connectDb from '@/app/lib/db'
import { backfillProductNumbers } from '@/app/lib/productNumber'
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
  const product = await Grocery.findOne({ productNumber: Number(productNumberParam) }).populate(
    'seller',
    'name storeName image'
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

  return (
    <>
      <Nav user={plainUser} />
      <ProductDetail item={product} />
      <Footer />
    </>
  )
}

export default ProductPage
