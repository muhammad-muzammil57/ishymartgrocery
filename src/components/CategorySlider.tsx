'use client'

import { motion } from "motion/react";
import {
  Apple,
  Baby,
  Box,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Cookie,
  Flame,
  Heart,
  Home,
  Milk,
  Wheat,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

function CategorySlider() {
  const categories = [
    { id: 1, name: "Fruits & Vegetables", icon: Apple, color: "bg-green-100" },
    { id: 2, name: "Dairy & Eggs", icon: Milk, color: "bg-yellow-100" },
    { id: 3, name: "Rice, Atta & Pulses", icon: Wheat, color: "bg-orange-100" },
    { id: 4, name: "Snacks & Biscuits", icon: Cookie, color: "bg-pink-100" },
    { id: 5, name: "Beverages & Drinks", icon: Coffee, color: "bg-blue-100" },
    {
      id: 6,
      name: "Personal Care & Hygiene",
      icon: Heart,
      color: "bg-purple-100",
    },
    { id: 7, name: "Household Essentials", icon: Home, color: "bg-red-100" },
    { id: 8, name: "Instant & Packaged Food", icon: Box, color: "bg-lime-100" },
    { id: 9, name: "Baby & Pet Care", icon: Baby, color: "bg-teal-100" },
    { id: 10, name: "Spices & Maslas", icon: Flame, color: "bg-rose-100" },
  ];

  const [showLeft, setShowLeft] =useState<boolean>();
  const [showRight, setShowRight] =useState<boolean>();
  const scrollRef =useRef<HTMLDivElement | null>(null)
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current)return
      const scrollAmount = direction == "left" ? -200 : 200
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    
  }


    const checkScroll = () => {
      if (!scrollRef.current)return
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight((scrollLeft + clientWidth) <= scrollWidth-5);
      
    }

    useEffect(()=>{
     const autoScroll = setInterval(()=>{
        if(!scrollRef.current)return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if((scrollLeft + clientWidth) >= scrollWidth-5){
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        }else{
            scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
          }
      },2000)
      return ()=>clearInterval(autoScroll)
    },[])

    useEffect(()=>{
      scrollRef.current?.addEventListener("scroll", checkScroll)
      checkScroll();
      return ()=>removeEventListener("scroll", checkScroll)
    },[])
  return (
    <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: false, amount: 0.5 }}
    className="w-[90%] md:w-[80%] mx-auto mt-10 relative"
    >
      <h2 className="text-2xl md:text-3xl text-green-700 text-center font-bold mb-6">📮Shop by Category</h2>

      {showLeft &&
      <button onClick={()=>scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-green-100 rounded-full w-10 h-10 flex items-center justify-center transition-all" ><ChevronLeft className="w-6 h-6 text-green-700"/></button>}
      <div className="flex gap-6 overflow-x-auto px-10 pb-4 scrollbar-hide scroll-smooth" ref={scrollRef}>
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.id}
              className={`${category.color} min-w-[150px] md:min-w-[180px] shadow-md flex-shrink-0 w-40 h-40 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-transform transform hover:scale-105`}
            >
             <div className="flex flex-col items-center justify-center p-5">
              <Icon className="text-3xl mb-3  w-10 h-10 text-green-700 " />
              <span className="text-sm font-medium text-gray-800 text-center">{category.name}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      {showRight &&
      <button onClick={()=>scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-green-100 rounded-full w-10 h-10 flex items-center justify-center transition-all"><ChevronRight className="w-6 h-6 text-green-700"/></button>}
    </motion.div>
  )
}

export default CategorySlider;
