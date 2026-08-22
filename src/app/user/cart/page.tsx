"use client";
import {
  ArrowLeft,
  BatteryWarningIcon,
  ShoppingCartIcon,
  MinusCircle,
  PlusCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/redux/store";
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from "@/redux/cartSlice";
import { useRouter } from "next/navigation";

function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter()

  const { cartData, subTotal, finalTotal, deliveryFee } = useSelector((state: RootState) => state.cart);
  // Removed unused cartItem variable as it is not needed
  return (
    <div className="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] mx-auto py-10 mb-24 mt-8 relative">
      <Link
        href="/"
        className="absolute -top-2 left-0 flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="hidden sm:inline">Back To Home</span>
      </Link>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 mb-10 flex items-center gap-2 text-center justify-center"
      >
        Your Shopping Cart
        <ShoppingCartIcon size={30} />
      </motion.h2>
      {cartData.length === 0 ? (
        <div className="flex flex-col items-center gap-4 justify-center mt-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-gray-500 text-lg flex items-center gap-2 justify-center"
          >
            <ShoppingCartIcon className="hidden md:inline" />
            Your cart is empty. Start shopping now!
            <ShoppingCartIcon />
          </motion.p>
          <BatteryWarningIcon size={100} className="text-red-600" />
          <Link
            href={"/"}
            className="bg-green-600 text-white font-medium py-2 px-4 rounded-lg mt-4 flex items-center justify-center hover:bg-green-700 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-8">
          <AnimatePresence>
            {cartData.map((item) => (
              <motion.div
                key={item._id?.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col sm:flex-row bg-white items-center gap-4 p-5 border rounded-2xl  shadow-md hover:shadow-xl transition-all duration-300 border-green-700"
              >
                <div>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-contain p-3 transition-transform duration-300 hover:scale-105 rounded"
                />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{item.name}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-green-700 font-bold">
                    Rs:{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-3 mt-3 sm:mt-0 bg-gray-50 px-3 py-2 rounded-full">
                  <button
                    onClick={() =>
                      item._id && dispatch(decreaseQuantity(item._id))
                    }
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition-all"
                  >
                    <MinusCircle size={16} />
                  </button>
                  <span className="text-gray-800 text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      item._id && dispatch(increaseQuantity(item._id))
                    }
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition-all"
                  >
                    <PlusCircle size={16} />
                  </button>
                </div>
                <button>
                  <Trash2
                    onClick={() =>
                      item._id && dispatch(removeFromCart(item._id))
                    }
                    size={18}
                    className="sm:ml-4 mt-3 sm:mt-0 text-red-500 hover:text-red-700 transition-all"
                  />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          </div>
          <motion.div className="bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-24 border border-gray-100 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          >
            <h2 className="text-center text-xl font-bold mb-4 text-green-700">Order Summary</h2>
            <div className="bg-white p-5 rounded-2xl shadow-md border border-green-700">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">SubTotal</span>
                <span className="font-bold text-green-700">Rs:{subTotal}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-bold text-green-700">{deliveryFee}</span>
              </div>
              <div className="flex justify-between mb-4 border-t pt-4">
                <span className="text-gray-600 font-bold">Total</span>
                <span className="font-bold text-green-700 text-lg">Rs:{finalTotal}</span>
              </div>
              <button onClick={()=>router.push("/user/checkout")} className="w-full bg-green-600 text-white font-medium py-2 rounded-lg mt-4 flex items-center justify-center hover:bg-green-700 transition-colors">
                Proceed to Checkout
              </button>
            </div>
          </motion.div>
        </div>
        
      )}
    </div>
  );
}

export default CartPage;
