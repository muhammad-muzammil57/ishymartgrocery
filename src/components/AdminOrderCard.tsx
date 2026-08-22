"use client";
import { IOrder } from "@/app/Models/order.model";
import React, { useState } from "react";
import { motion } from "motion/react";
import axios from "axios";
import {
  Banknote,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Loader,
  Mail,
  MapPin,
  Package,
  Phone,
  Trash2,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import Image from "next/image";

const nextStatusOptions: Record<string, string[]> = {
  pending: ["out of delivery", "cancelled"],
  "out of delivery": [],
  delivered: [],
  cancelled: [],
}

function AdminOrderCard({
  order: initialOrder,
  onUpdated,
  onDeleted,
}: {
  order: any;
  onUpdated?: () => void;
  onDeleted?: (orderId: string) => void;
}) {
  const [order, setOrder] = useState(initialOrder);
  const [expended, setExpended] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [onlineDeliveryBoys, setOnlineDeliveryBoys] = useState<any[] | null>(null);
  const [loadingDeliveryBoys, setLoadingDeliveryBoys] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const changeStatus = async (status: string, reason?: string) => {
    setUpdating(true);
    try {
      const res = await axios.post(`/api/admin/update-order-status/${order._id}`, {
        status,
        reason,
      });
      setOrder(res.data.order);
      setShowCancelForm(false);
      setCancelReason("");
      if (status === "out of delivery") {
        loadOnlineDeliveryBoys();
      }
      onUpdated?.();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  // ─── Delivered order ko database se hamesha ke liye hata do. 30 din baad
  // yeh khud-ba-khud bhi ho jata hai, lekin admin chahe to yahan se turant
  // manually bhi delete kar sakta hai ─────────────────────────────────
  const handleDelete = async () => {
    if (!confirm("Kya aap waqai is order ko hamesha ke liye delete karna chahte hain?")) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/admin/delete-order/${order._id}`);
      onDeleted?.(order._id);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  const loadOnlineDeliveryBoys = async () => {
    setLoadingDeliveryBoys(true);
    try {
      const res = await axios.get("/api/admin/delivery-boys");
      setOnlineDeliveryBoys(res.data);
    } catch {
      // ignore
    } finally {
      setLoadingDeliveryBoys(false);
    }
  };

  const statusColor =
    order.status === "delivered"
      ? "bg-green-100 text-green-700"
      : order.status === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : order.status === "cancelled"
      ? "bg-red-100 text-red-700"
      : "bg-blue-100 text-blue-700";

  return (
    <motion.div
      key={order._id?.toString()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white shadow-md hover:shadow-lg border border-gray-100 rounded-2xl p-6 transition-all "
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-lg font-bold flex items-center gap-2 text-green-700">
            <Package size={20} />
            Order #
            <span className="text-red-700 border px-2 bg-red-50">
              {order._id?.toString().slice(-6)}
            </span>
          </p>

          <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${
              order.isPaid
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
            }`}
          >
            {order.isPaid ? "Paid" : "UnPaid"}
          </span>

          <p className="text-gray-500 text-sm mt-2">
            {new Date(order.createdAt!).toLocaleString()}
          </p>

          <div className="mt-3 space-y-1 text-gray-700 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <User size={16} className="text-green-700" />
              <span>{order?.address.fullName}</span>
              <span className="text-xs text-gray-400 font-normal">
                (Buyer: {order.user?.name})
              </span>
            </p>
            <p className="flex items-center gap-2 font-semibold">
              <Phone size={16} className="text-green-700" />
              <span>{order?.address.mobile}</span>
            </p>
            <p className="flex items-center gap-2 font-semibold">
              <MapPin size={16} className="text-green-700" />
              <span>{order?.address.fullAddress}</span>
            </p>
            <p className="flex items-center gap-2 font-semibold">
              <Mail size={16} className="text-green-700" />
              <span>{order?.address.city}</span>
            </p>
          </div>
          <p className="mt-3 flex items-center gap-2 font-bold text-sm text-gray-700">
            <CreditCard size={16} className="text-green-700" />
            <span>
              {order?.paymentMethod === "cod"
                ? "Cash On Delivery"
                : "Paid | Online Payment"}
            </span>
          </p>
          <p className="flex items-center gap-2 font-bold text-sm text-green-700">
            <Banknote size={16} /> Total: Rs {order.totalAmount}
          </p>

          {order.cancelReason && (
            <p className="text-xs text-red-600 mt-2">Cancel reason: {order.cancelReason}</p>
          )}
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 min-w-[220px]">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColor}`}>
            {order.status}
          </span>

          {order.status === "delivered" && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200 disabled:opacity-60"
            >
              {deleting ? (
                <Loader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              {deleting ? "Deleting..." : "Delete Order"}
            </button>
          )}

          {nextStatusOptions[order.status]?.length > 0 && !showCancelForm && (
            <div className="flex flex-col gap-2 w-full">
              {order.status === "pending" && (
                <button
                  disabled={updating}
                  onClick={() => changeStatus("out of delivery")}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                >
                  <Truck size={16} /> Mark Out for Delivery
                </button>
              )}
              {order.status === "pending" && (
                <button
                  disabled={updating}
                  onClick={() => setShowCancelForm(true)}
                  className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold px-4 py-2 rounded-lg"
                >
                  <XCircle size={16} /> Cancel Order
                </button>
              )}
            </div>
          )}

          {showCancelForm && (
            <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3">
              <textarea
                className="w-full border rounded-lg px-2 py-1 text-sm mb-2"
                placeholder="Reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  disabled={updating || !cancelReason.trim()}
                  onClick={() => changeStatus("cancelled", cancelReason)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowCancelForm(false)}
                  className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {order.status === "out of delivery" && order.assignedDeliveryBoy && (
            <div className="w-full bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs text-green-800 font-semibold mb-1">Assigned Delivery Partner</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">{order.assignedDeliveryBoy.name}</span>
                {order.assignedDeliveryBoy.mobile && (
                  <a
                    href={`tel:${order.assignedDeliveryBoy.mobile}`}
                    className="flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    <Phone size={12} /> Call
                  </a>
                )}
              </div>
            </div>
          )}

          {order.status === "out of delivery" && !order.assignedDeliveryBoy && (
            <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-800 font-semibold mb-2">
                Waiting for a delivery partner to accept...
              </p>
              {loadingDeliveryBoys ? (
                <p className="text-xs text-gray-500">Loading online delivery boys...</p>
              ) : onlineDeliveryBoys === null ? (
                <button
                  onClick={loadOnlineDeliveryBoys}
                  className="text-xs text-blue-700 underline"
                >
                  Show online delivery boys
                </button>
              ) : onlineDeliveryBoys.length === 0 ? (
                <p className="text-xs text-gray-500">No delivery boys online right now.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {onlineDeliveryBoys.map((d) => (
                    <div key={d._id} className="flex items-center justify-between bg-white rounded-lg px-2 py-1.5">
                      <span className="text-xs font-medium text-gray-700">{d.name}</span>
                      {d.mobile && (
                        <a
                          href={`tel:${d.mobile}`}
                          className="flex items-center gap-1 text-blue-700 text-xs font-semibold"
                        >
                          <Phone size={12} /> Call
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3 mt-3">
        <button
          onClick={() => setExpended((prev) => !prev)}
          className="w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-green-700 transition"
        >
          <span className="flex items-center gap-2">
            <Package size={18} className="text-green-700" />
            {expended
              ? "Hide Order Item"
              : `View ${order.items.length} Order Item`}
          </span>
          {expended ? <ChevronUp /> : <ChevronDown />}
        </button>

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ height: expended ? "auto" : 0, opacity: expended ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden"
        >
          <div className="mt-3 space-y-3 ">
            {order.items.map((item: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center bg-amber-50 rounded-xl px-3 py-2 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className=" rounded-lg object-cover border border-gray-200"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 ">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x {item.unit}
                    </p>
                  </div>
                </div>
                <div>Rs. {Number(item.price) * item.quantity}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default AdminOrderCard;
