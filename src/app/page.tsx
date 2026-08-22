import React from 'react'
import connectDb from './lib/db'
import User from './Models/user.model'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import EditRoleMobile from '@/components/EditRoleMobile'
import Nav from '@/components/Nav'
import UserDashboard from '@/components/UserDashboard'
import AdminDashboard from '@/components/AdminDashboard'
import DeliveryBoy from '@/components/DeliveryBoy'
import Footer from '@/components/Footer'


async function Home(){
await connectDb()
const session = await auth()

if(!session?.user){
  redirect("/login")
}

const user=await User.findById(session?.user?.id)
if(!user){
  redirect("/api/auth/signout?callbackUrl=/login")
}
const inComplete=!user.mobile || !user.role || (!user.mobile && user.role=="user")
if(inComplete){
  return <EditRoleMobile/>
}

const plainUser=JSON.parse(JSON.stringify(user))
  return (
    <>
      <Nav user={plainUser}/>
      {user.role=="user" ?(
        <>
        <UserDashboard/>
        <Footer />
        
        </>
      ):user.role=="admin" ?(
        <AdminDashboard/>
      ):<DeliveryBoy/>}
    </>
  )
}

export default Home
