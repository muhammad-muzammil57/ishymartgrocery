import connectDb from "@/app/lib/db";
import Order from "@/app/Models/order.model";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    try {
        await connectDb()
        const session=await auth()
        const orders = await Order.find({
            user:session?.user?.id
        }).populate("user")
        if(!orders){
            return NextResponse.json({message:"orders not found"},{status:400})
        }

        return NextResponse.json(orders,{status:200})

    } catch (error) {
        return NextResponse.json({message:`get all orders error:${error}`},{status:500})

    }
}