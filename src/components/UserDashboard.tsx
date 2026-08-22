import React from 'react'
import HeroSection from './HeroSection'
import CategorySlider from './CategorySlider'
import connectDb from '@/app/lib/db'
import Grocery from '@/app/Models/grocery.model'
import Feedback from '@/app/Models/feedback.model'
import GroceryItemCard from './GroceryItemCard'
import type { IGrocery } from './GroceryItemCard'

async function UserDashboard() {
  await connectDb()
  const groceries = await Grocery.find({}).populate('seller', 'name storeName image')
  const plainGrocery = JSON.parse(JSON.stringify(groceries))

  // Sellers jo is page par nazar aa rahe hain unki average rating nikal lete hain
  const sellerIds = [...new Set(plainGrocery.map((g: any) => g.seller?._id).filter(Boolean))]
  const ratingAgg = sellerIds.length
    ? await Feedback.aggregate([
        { $match: { seller: { $in: sellerIds } } },
        { $group: { _id: '$seller', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      ])
    : []
  const ratingMap: Record<string, { avgRating: number; count: number }> = {}
  ratingAgg.forEach((r: any) => {
    ratingMap[r._id.toString()] = { avgRating: r.avgRating, count: r.count }
  })

  return (
    <>
      <HeroSection/>
      <CategorySlider/>
      <div className='w-[90%] md:w-[80%] mx-auto mt-10'>
        <h2 className='text-2xl md:text-3xl font-bold mb-8 text-center text-green-700'>Featured Products</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>

      {plainGrocery.map((item:IGrocery)=>(
        <GroceryItemCard
          key={item._id?.toString()}
          item={item}
          sellerRating={item.seller ? ratingMap[item.seller._id?.toString()] : undefined}
        />
      ))}
        </div>
      </div>
    </>
  )
}

export default UserDashboard
