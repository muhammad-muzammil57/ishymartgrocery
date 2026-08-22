"use client";
import { subtle } from "crypto";
import { Leaf, Smartphone, Truck } from "lucide-react";
import { title } from "process";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { getSocket } from "@/app/lib/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

function HeroSection() {

  const {userData}=useSelector((state:RootState)=>state.user)

useEffect(() => {
  console.log("userData in hero section", userData)
  if(userData){

    let socket=getSocket()
    socket.emit("identity", userData?._id)
  }
}, [userData])

  const slides = [
    {
      id: 1,
      icon: (
        <Leaf className="w-20 h-20 sm:w-28 sm:h-28 text-green-400 drop-shadow-lg" />
      ),
      title: "Fresh Organic Groceries 🥬🥦",
      subtitle:
        "Farm-Frsh fruits, vegetables, and daily essentials delivered to your doorstep in minutes.",
      btnText: "Shop Now",
      bg: "https://plus.unsplash.com/premium_photo-1742420854915-cfe009183358?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 2,
      icon: (
        <Truck className="w-20 h-20 sm:w-28 sm:h-28 text-yellow-400 drop-shadow-lg " />
      ),
      title: "Fast & Reliable Delivery 🚚⚡",
      subtitle:
        "We ensure your groceries arrive fresh and on time, every time. Experience the convenience of our lightning-fast delivery service.",
      btnText: "Oder Now",
      bg: "https://images.unsplash.com/photo-1759301248268-b4ada0a5f964?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 3,
      icon: (
        <Smartphone className="w-20 h-20 sm:w-28 sm:h-28 text-blue-400 drop-shadow-lg " />
      ),
      title: "Shop Anything Anywhere 📱🛒",
      subtle: "Easy and seamless online grocery shoping experience.",
      subtitle:
        "Shop for your favorite groceries with our user-friendly app. Experience the convenience of online shopping at your fingertips.",
      btnText: "Get Started",
      bg: "https://plus.unsplash.com/premium_photo-1663091415799-43432ca4ff5e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-[98%] mx-auto mt-32 h-[80vh] rounded-3xl overflow-hidden shadow-lg">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.bg}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></span>
          <div
            className="absolute top-1/2 left-0 w-full transform -translate-y-1/2 
  text-white px-4 flex flex-col items-center text-center

  sm:left-1/2 sm:w-auto sm:-translate-x-1/2 sm:flex-none"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-6 max-w-3xl"
            >
              {slide.icon}
            </motion.div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 drop-shadow-lg">
              {slide.title}
            </h1>
            <p className="text-lg sm:text-xl mt-2 drop-shadow-lg">
              {slide.subtitle}
            </p>
            <motion.button
              whileHover={{ scale: 1.09 }}
              transition={{ duration: 0.2 }}
              whileTap={{ scale: 0.96 }}
              className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-700 text-white rounded-full  transition-colors duration-300"
            >
              {slide.btnText}
            </motion.button>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === current ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSection;
