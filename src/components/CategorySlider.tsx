'use client'
import { Apple, Baby, Box, Coffee, Cookie, Flame, Heart, Home, Milk, Wheat } from 'lucide-react'
import { color } from 'motion'
import React from 'react'
import { motion } from 'motion/react'

function CategorySlider() {
  const categories = [
        {id:1,name:"Fruits & Vegetables",icon:Apple,color:"bg-green-100"},
        {id:2,name:"Dairy & Eggs",icon:Milk,color:"bg-yellow-100"},
        {id:3,name:"Rice, Atta & Grains",icon:Wheat,color:"bg-orange-100"},
        {id:4,name:"Snacks & Biscuits",icon:Cookie,color:"bg-pink-100"},
        {id:5,name:"Spices",icon:Flame,color:"bg-red-100"},
        {id:6,name:"Beverages & Drinks",icon:Coffee,color:"bg-blue-100"},
        {id:7,name:"Personal Care",icon:Heart,color:"bg-purple-100"},
        {id:8,name:"Household Essentials",icon:Home,color:"bg-lime-100"},
        {id:9,name:"Instant & Packaged Food",icon:Box,color:"bg-teal-100"},
        {id:10,name:"Baby & Pet Care",icon:Baby,color:"bg-rose-100"},
  ]
  return (
    <motion.div
    className='w-[90%] md:w-[80%] mx-auto mt-10 relative '
    initial={{opacity:0,y:50}}
    viewport={{once:false,amount:0.5}}
    whileInView={{opacity:1, y:0}}
    transition={{duration:0.6,ease:"easeInOut"}}
    >
      <h2 className='text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center'>Shop by Category</h2>
    <div className='flex gap-6 overflow-x-auto px-10 pb-4 scrollbar-hide scroll-smooth'>
    
    </div>
    </motion.div>

  )
}

export default CategorySlider