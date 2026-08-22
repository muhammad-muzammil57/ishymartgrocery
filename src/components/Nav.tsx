"use client";
import {
  Boxes,
  ClipboardCheck,
  LogOut,
  Menu,
  Package,
  PlusCircle,
  Search,
  Settings,
  ShoppingCartIcon,
  Store,
  Users,
  Wallet,
  User,
  X,
  MessageCircle,
  MessageSquare
} from "lucide-react";
import mongoose from "mongoose";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import dynamic from "next/dynamic";
const SupportWidget = dynamic(() => import('./SupportWidget'), { ssr: false })
const MessagesWidget = dynamic(() => import('./MessagesWidget'), { ssr: false })
const SellerSubNav = dynamic(() => import('./SellerSubNav'), { ssr: false })

interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
}

function Nav({ user }: { user: IUser }) {
  const [open, setOpen] = useState(false);
  const profileDropDown = useRef<HTMLDivElement>(null);
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartData } = useSelector((state: RootState) => state.cart)
  const [showSupport, setShowSupport] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showMessages, setShowMessages] = useState(false)

  // Portal ke liye mount check
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropDown.current &&
        !profileDropDown.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── SIDEBAR PORTAL ───────────────────────────────────────────────────────
  const SideBar = menuOpen && mounted
    ? createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 14 }}
            className="fixed top-0 left-0 w-[75%] sm:w-[60%] h-screen bg-gradient-to-b from-green-800/90 via-green-700/80 to-green-900/90 backdrop-blur-xl border-r border-green-400/20 shadow-[0_0_50px_-10px_rgba(0,255,100,0.3)] z-50 text-white"
          >
            <div className="flex justify-between items-center mb-2 mt-2.5">
              <h1 className="pl-4 font-extrabold text-2xl tracking-wide text-white/90">Admin Pannal</h1>
              <span className="md:hidden bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:scale-105 transition mr-2 mt-2">
                <button className="text-green-600 hover:text-red-400 text-2xl font-bold transition" onClick={() => setMenuOpen(false)}>
                  <X />
                </button>
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 mt-3 ml-2 mr-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all shadow-inner">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-green-400/60 shadow-lg">
                {user.image ? <Image src={user.image} alt="Admin User" fill className="object-cover rounded-full" /> : <User />}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{user.name}</h2>
                <p className="text-xs text-green-200 capitalize tracking-wide">{user.role}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 font-medium mt-6">
              {/* <Link href={"/admin/add-grocery"} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all hover:pl-4 ml-2 mr-2">
                <PlusCircle className="w-5 h-5" /> Add Grocery
              </Link>
              <Link href={"/admin/view-grocery"} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all hover:pl-4 ml-2 mr-2">
                <Boxes className="w-5 h-5" /> View Grocery
              </Link>
              <Link href={"/admin/mange-orders"} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all hover:pl-4 ml-2 mr-2">
                <ClipboardCheck className="w-5 h-5" /> Mange Oders
              </Link> */}
              <Link href={"/admin/seller-applications"} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all hover:pl-4 ml-2 mr-2">
                <Store className="w-5 h-5" /> Seller Applications
              </Link>
              <Link href={"/admin/sellers"} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all hover:pl-4 ml-2 mr-2">
                <Users className="w-5 h-5" /> Sellers
              </Link>
              <Link href={"/admin/withdrawals"} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all hover:pl-4 ml-2 mr-2">
                <Wallet className="w-5 h-5" /> Withdrawal Requests
              </Link>
            </div>

            <div className="my-5 border-t border-white/20"></div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50/80 hover:bg-red-50 transition-all hover:pl-4 ml-2 mr-2 text-red-600 font-medium cursor-pointer"
              onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/login" }) }}>
              <LogOut />
              Log Out
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )
    : null;

  // ─── SUPPORT WIDGET PORTAL ────────────────────────────────────────────────
  // ✅ YEH CHANGE KIYA: SupportWidget ab document.body mein render hoga
  // Nav ke andar nahi — isliye Nav ke upar nahi aayega
  const SupportPortal = showSupport && mounted
    ? createPortal(
        <AnimatePresence>
          <SupportWidget onClose={() => setShowSupport(false)} />
        </AnimatePresence>,
        document.body
      )
    : null;

    const MessagesPortal = showMessages && mounted
  ? createPortal(
      <AnimatePresence>
        <MessagesWidget onClose={() => setShowMessages(false)} />
      </AnimatePresence>,
      document.body
    )
  : null;


  return (
    <div className="w-[95%] fixed top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-green-500 to-green-700 rounded-2xl shadow-lg shadow-black/30 flex justify-between items-center h-20 px-4 md:px-8 z-50">
      <Link
        href={"/"}
        className="hidden md:block text-white font-extrabold text-2xl sm:text-3xl tracking-wide hover:scale-105 transition-transform"
      >
        IshyMart
      </Link>
      <Link
        href={"/"}
        className="block md:hidden text-white font-bold text-xl sm:text-xl tracking-wide hover:scale-105 transition-transform"
      >
        IM
      </Link>

      {user.role == "user" && (
        <form className="hidden md:flex items-center bg-white rounded-full px-4 py-3 w-1/2 max-w-lg shadow-md">
          <Search className="text-gray-500 w-5 h-5 mr-2 ml-2" />
          <input
            type="text"
            placeholder="Search which you need...?"
            className="w-full outline-none text-gray-700 placeholder:text-gray-400"
          />
        </form>
      )}

      <div className="flex items-center gap-3 md:gap-6 relative">
        {user.role == "user" && (
          <>
            <div
              className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition md:hidden"
              onClick={() => setSearchBarOpen((prev) => !prev)}
            >
              <Search className="text-green-600 w-6 h-6" />
            </div>

            <Link
              href={"/user/cart"}
              className="relative bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition"
            >
              <ShoppingCartIcon className="text-green-600 w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold shadow">
                {cartData.length}
              </span>
            </Link>

            {/* ✅ YEH CHANGE KIYA: Support button wahi rakha
                lekin SupportWidget ko Nav se bahar Portal mein bheja */}
            <button
            id="support-widget-btn"
              onClick={() => setShowSupport(true)}
              className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition"
              title="Support"
            >
              <MessageCircle className="text-green-600 w-6 h-6" />
            </button>
            <button
  onClick={() => setShowMessages(true)}
  className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition"
  title="Messages"
>
  <MessageSquare className="text-green-600 w-6 h-6" />
</button>
          </>
        )}

        {user.role == "admin" && (
          <>
            <div className="hidden md:flex items-center gap-4">
              <Link href={"/admin/add-grocery"} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all">
                <PlusCircle className="w-5 h-5" /> Add Grocery
              </Link>
              <Link href={"/admin/view-grocery"} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all">
                <Boxes className="w-5 h-5" /> View Grocery
              </Link>
              <Link href={"/admin/mange-orders"} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all">
                <ClipboardCheck className="w-5 h-5" /> Mange Oders
              </Link>
              <Link href={"/admin/bulk-email"} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all">
                <ClipboardCheck className="w-5 h-5" /> Send Bulk Emails
              </Link>
              <Link href={"/admin/seller-applications"} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all">
                <Store className="w-5 h-5" /> Seller Applications
              </Link>
              <Link href={"/admin/sellers"} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all">
                <Users className="w-5 h-5" /> Sellers
              </Link>
              <Link href={"/admin/withdrawals"} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all">
                <Wallet className="w-5 h-5" /> Withdrawals
              </Link>
            </div>

            <div
              className="md:hidden bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:scale-105 transition"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <Menu className="text-green-600 w-6 h-6" />
            </div>
          </>
        )}

        <div className="relative" ref={profileDropDown}>
          <div
            className="bg-white rounded-full w-11 h-11 flex items-center justify-center overflow-hidden shadow-md hover:scale-105 transition-transform"
            onClick={() => setOpen((prev) => !prev)}
          >
            {user.image ? (
              <Image src={user.image} alt="user" fill className="object-cover rounded-full" />
            ) : (
              <User />
            )}
          </div>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 z-999"
              >
                <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-100">
                  <div className="w-10 h-10 relative rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                    {user.image ? (
                      <Image src={user.image} alt="user" fill className="object-cover rounded-full" />
                    ) : (
                      <User />
                    )}
                  </div>
                  <div>
                    <div className="text-gray-800 font-semibold">{user.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                </div>

                {user.role == "user" && (
                  <>
                    <Link href={"/user/my-order"} className="flex items-center gap-2 px-3 py-3 hover:bg-green-50 rounded-lg text-gray-700 font-medium" onClick={() => setOpen(false)}>
                      <Package className="w-5 h-5 text-green-600" />
                      My Oders
                    </Link>
                    <Link href={"/seller/apply"} className="flex items-center gap-2 px-3 py-3 hover:bg-amber-50 rounded-lg text-gray-700 font-medium" onClick={() => setOpen(false)}>
                      <Boxes className="w-5 h-5 text-amber-600" />
                      Selling Account
                    </Link>
                  </>
                )}

                <button
                  className="flex items-center gap-2 w-full text-left px-3 py-3 hover:bg-red-50 rounded-lg text-gray-700 font-medium"
                  onClick={() => { setOpen(false); signOut({ callbackUrl: "/login" }); }}
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                  Log Out
                </button>

                <Link href={"/settings"} className="flex items-center gap-2 px-3 py-3 hover:bg-green-50 rounded-lg text-gray-700 font-medium" onClick={() => setOpen(false)}>
                  <Settings className="w-5 h-5 text-green-600" />
                  Account Settings
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {searchBarOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white rounded-full shadow-lg flex items-center px-4 py-3 z-50"
              >
                <Search className="text-gray-500 w-5 h-5 mr-2" />
                <form className="grow">
                  <input
                    type="text"
                    placeholder="Search which you need...?"
                    className="w-full outline-none text-gray-700 placeholder:text-gray-400"
                  />
                </form>
                <button onClick={() => setSearchBarOpen(false)}>
                  <X className="text-gray-500 w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ✅ YEH CHANGE KIYA: SideBar aur SupportPortal dono
          return ke end mein hain — Nav ke bahar document.body mein render honge */}
      {SideBar}
      {SupportPortal}
      {MessagesPortal}

      {/* Selling account sub-nav — sirf normal user account ke liye, admin/delivery boy ke liye nahi */}
      {user.role == "user" && <SellerSubNav />}
    </div>
  );
}

export default Nav;
