import connectDb from "@/app/lib/db";
import Order from "@/app/Models/order.model";
import "@/app/Models/deliveryAssignment.model";
import { auth } from "@/auth";
import { cleanupOldDeliveredOrders } from "@/app/lib/cleanupOldOrders";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    try {
        await connectDb()
        const session = await auth()
        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        // 30 din se purane delivered orders khud hi hat jayen (lazy cleanup)
        await cleanupOldDeliveredOrders()

        const orders=await Order.find({})
            .populate("user", "name email mobile")
            .populate("assignedDeliveryBoy", "name mobile image isOnline")
            .populate("assignment")
            .sort({ createdAt: -1 })
            return NextResponse.json(
                orders,{status:200}
            )
        
    } catch (error) {
        return NextResponse.json(
            {message:`get orders error:${error}`},{status:500}
        )
    }
}