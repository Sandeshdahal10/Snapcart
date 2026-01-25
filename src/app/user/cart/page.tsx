'use client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {motion} from "motion/react"
import React from 'react'

function CartPage() {
  return (
    <div className='w-[95%] sm:w-[90%] md:w-[80%] mx-auto mt-8 mb-24 relative'>
      <Link href={"/"} className='absolute -top-2 left-0 flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-all'>
      <ArrowLeft className='w-5 h-5'/>
      <span className='hidden sm:inline'>Back to Home</span>
      </Link>
      <motion.h2
      initial={{opacity:0,y:10}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.3}}
      className='text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 text-center mb-10'
      >
        Your Cart 🛒
      </motion.h2>
      
    </div>
  )
}

export default CartPage