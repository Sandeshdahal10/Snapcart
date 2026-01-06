'use client'
import { Leaf, Smartphone, Truck } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import React, { useEffect, useState } from 'react'
import {motion} from "motion/react"
import Image from 'next/image'
function HeroSection() {
  const slides=[{
    id:1,
    icon:<Leaf className="w-20 h-20 sm:w-28 sm:h-28 text-green-400 drop-shadow-lg"/>,
    title:"Fresh Organic Groceries 🍅",
    subtitle:"Delivered to Your Doorstep",
    btnText:"Shop Now",
    bg:"https://images.unsplash.com/photo-1741515043161-e97d05e5cfcc?q=80&w=901&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
{
    id:2,
    icon:<Truck className="w-20 h-20 sm:w-28 sm:h-28 text-yellow-400 drop-shadow-lg"/>,
    title:"Fast & Reliable Delivery",
    subtitle:"From Our Store to Your Home",
    btnText:"Order Now",
    bg:"https://media.istockphoto.com/id/1660811686/photo/automated-grocery-bag-on-wheels.jpg?s=1024x1024&w=is&k=20&c=dETs8_I86yee6Myr5qqpKn0_cV8ywwF19TOOIKikzmQ="
},
{
    id:3,
    icon:<Smartphone className="w-20 h-20 sm:w-28 sm:h-28 text-blue-400 drop-shadow-lg"/>,
    title:"Easy Mobile Shopping 📱",
    subtitle:"Groceries at Your Fingertips",
    btnText:"Get Started",
    bg:"https://plus.unsplash.com/premium_photo-1663091378026-7bee6e1c7247?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
}]
const [currentSlide,setCurrentSlide]=useState(0);
useEffect(()=>{
 const timer = setInterval(()=>{
    setCurrentSlide((prev)=>(prev+1) %(slides.length))
  },4000)
  return ()=> clearInterval(timer)
},[])
  return (
    <div className='relative  w-[98%] mx-auto mt-32 h-[80vh] rounded-3xl overflow-hidden shadow-2xl'>
      <AnimatePresence mode='wait'>
      <motion.div
      initial={{opacity:0}}
      animate={{opacity:1}}
      transition={{duration:0.8}}
      exit={{opacity:0}}
      className='absolute inset-0'
      >
      <Image
      src={slides[currentSlide]?.bg}
      fill
      alt='slides'
      priority
      />
        
      
      </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default HeroSection