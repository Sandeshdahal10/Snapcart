'use client'
import React from 'react'
import {motion} from "motion/react"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

function Checkout() {
  const router=useRouter();
  return (
    <div className='w-[92%] md:w-[80%] mx-auto py-10 relative'>
      <motion.button
      
      whileTap={{scale:0.96}}
      className='absolute left-0 top-2 flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold'
      onClick={()=>router.push("/user/cart")}>
        <ArrowLeft size={16}/>
        <span>Back to Cart</span>
        
      </motion.button>
      <motion.h1 className='text-3xl md:text-4xl font-bold text-green-700 text-center mb-10'
      initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        >Checkout</motion.h1>
        <div className='grid md:grid-cols-2 gap-8'>
          <motion.div
          className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100'
          initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}>
          <h2>
            
          </h2>
          </motion.div>
        </div>
    </div>
  )
}

export default Checkout