import connectDb from "@/app/lib/db";
import Order from "@/app/Models/order.model";
import DeliveryAssignment from "@/app/Models/deliveryAssignment.model";
import User from "@/app/Models/user.model";
import { auth } from "@/auth";
import { creditSellerEarningsForOrder } from "@/app/lib/sellerEarnings";
import { emitSocketEvent } from "@/app/lib/emitSocketEvent";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_STATUSES = ["pending", "out of delivery", "delivered", "cancelled"]

export async function POST(req:NextRequest,{params}:{params:Promise<{orderId:string}>}) {
    try {
        await connectDb()

        const session = await auth()
        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const {orderId}=await params
        const {status, reason}=await req.json()

        if (!ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 })
        }

        const order=await Order.findById(orderId).populate("user")
        if(!order){
            return NextResponse.json(
                {message:"order not found"},
                {status:400}
            )
        }
        if (order.status === "delivered" || order.status === "cancelled") {
            return NextResponse.json(
                { message: `Order is already ${order.status} and cannot be changed` },
                { status: 400 }
            )
        }

        const wasDelivered = order.status === "delivered"
        order.status=status

        if (status === "cancelled") {
            order.cancelReason = reason || "Cancelled by admin"
        }

        // ─── Broadcast to all online delivery boys ────────────────
        // Jab admin order ko "out of delivery" karta hai, sab online delivery
        // boys ko notification (broadcast record) chali jati hai. Jo pehle
        // accept karega, wahi assign hoga — baqiyon ki list se ghaib ho jata hai.
        let broadcastCount = 0
        if (status === "out of delivery" && !order.assignment) {
            const onlineDeliveryBoys = await User.find({
                role: "deliveryBoy",
                isOnline: true,
            }).select("_id")

            const assignment = await DeliveryAssignment.create({
                order: order._id,
                brodcastedTo: onlineDeliveryBoys.map((d) => d._id),
                status: "brodcasted",
            })
            order.assignment = assignment._id
            broadcastCount = onlineDeliveryBoys.length
        }

        if (status === "delivered") {
            order.deliveredAt = new Date()
        }

        // ─── Seller earnings ─────────────────────────────────────
        // Jab order pehli baar "delivered" mark ho, tab hi har seller item
        // ka amount (price * quantity) uske sellerBalance mein credit karo.
        if (status === "delivered" && !wasDelivered) {
            await creditSellerEarningsForOrder(order)
        }

        await order.save()

        // ─── Real-time updates (polling ki jagah) ──────────────────
        // 1) Is order ke room mein jo bhi hai (buyer / delivery boy), unhe
        //    naya status turant mil jaye.
        await emitSocketEvent(`order:${orderId}`, "order:statusUpdate", {
            status: order.status,
            cancelReason: order.cancelReason,
        })

        // 2) Naya broadcast bana hai to sab online delivery boys ko turant
        //    dikhna chahiye — unhe apna "Incoming Orders" refresh nahi karna
        //    padega.
        if (status === "out of delivery" && broadcastCount > 0) {
            const populatedOrder = await Order.findById(order._id).populate("user", "name mobile")
            await emitSocketEvent("onlineDeliveryBoys", "delivery:newBroadcast", {
                _id: order.assignment,
                order: populatedOrder,
            })
        }

        // 3) Admin ke "Manage Orders" page ko bhi batao — ab yeh page 5-second
        //    polling ki jagah isi event par khud ko refresh karta hai.
        await emitSocketEvent("adminOrders", "admin:ordersChanged", { orderId })

        return NextResponse.json({ order, broadcastCount }, { status: 200 })
    } catch (error) {
        console.error("update-order-status error:", error)
        return NextResponse.json(
            {message:"Internal server error"},
            {status:500}
        )
    }
}