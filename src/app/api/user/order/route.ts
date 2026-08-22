import connectDb from "@/app/lib/db";
import Order from "@/app/Models/order.model";
import User from "@/app/Models/user.model";
import Grocery from "@/app/Models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        await connectDb()
        const {userId,items,paymentMethod,totalAmount,address}=await req.json()
        if(!items || !userId || !paymentMethod || !totalAmount || !address){
            return NextResponse.json(
                {message:"please send all credentials"},
                {status:400}
            )
        }
        const user=await User.findById(userId)
        if(!user){
            return NextResponse.json(
                {message:"user not found"},
                {status:400}
            )
        }

        // Security: seller attribution client se trust nahi karte — har item ke
        // liye grocery record se authoritative seller nikalte hain taake
        // seller earnings/withdrawals galat na ho sakein.
        const groceryIds = items.map((it: any) => it.grocery)
        const groceries = await Grocery.find({ _id: { $in: groceryIds } }).select("seller")
        const sellerMap = new Map(groceries.map((g: any) => [g._id.toString(), g.seller || null]))

        const enrichedItems = items.map((it: any) => ({
            ...it,
            seller: sellerMap.get(it.grocery?.toString()) ?? null,
        }))

        const newOrder=await Order.create({
            user:userId,
            items: enrichedItems,
            paymentMethod,
            totalAmount,
            address
        })
        return NextResponse.json(
            newOrder,
            {status:201}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`place order error ${error}`},
            {status:500}
        )
    }
}