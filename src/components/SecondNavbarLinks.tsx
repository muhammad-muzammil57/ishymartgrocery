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
import React from 'react';
import Link from 'next/link'; // Agar Next.js hai
// import { Link } from 'react-router-dom'; // Agar React Router hai to ise uncomment karein

export default function Navbar() {
  return (
    <nav className="mt-[100px] bg-[#e8f5e9] p-4 flex justify-between items-center shadow-sm">
      {/* Logo Section */}
      <div className="text-xl font-bold text-emerald-800">
        Logo
      </div>

      {/* Navigation Links */}
      <div className="flex gap-6 items-center justify-center">
      <Link href={"/admin/add-grocery"} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all hover:pl-4 ml-2 mr-2">
                <PlusCircle className="w-5 h-5" /> Add Grocery
              </Link>
              <Link href={"/admin/view-grocery"} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all hover:pl-4 ml-2 mr-2">
                <Boxes className="w-5 h-5" /> View Grocery
              </Link>
              <Link href={"/admin/mange-orders"} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all hover:pl-4 ml-2 mr-2">
                <ClipboardCheck className="w-5 h-5" /> Mange Oders
              </Link>
      </div>
    </nav>
  );
}
