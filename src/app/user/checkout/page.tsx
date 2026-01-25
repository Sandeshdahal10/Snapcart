'use client'
import React, { useEffect, useState } from 'react'
import {motion} from "motion/react"
import { ArrowLeft, HomeIcon, MapPin, Phone, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import Home from '@/app/page'

function Checkout() {
  const router=useRouter();
  const {userData}=useSelector((state:RootState)=>state.user)
  const [address,setAddress]=useState({
    fullName:userData?.name,
    mobile:userData?.mobile,
    city:"",
    state:"",
    pin:"",
    fullAddress:"",
  })

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
          <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <MapPin className='text-green-700'/>
            Delivery Address
          </h2>
          <div className='space-y-4'>
            <div className='relative'>
              <User className='absolute left-3 top-3 text-green-600' size={18}/>
              <input type="text" value={address.fullName} onChange={(e)=>setAddress({...address,fullName:e.target.value})} className='pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50'/>
            </div>
            <div className='relative'>
              <Phone className='absolute left-3 top-3 text-green-600' size={18}/>
              <input type="text" value={address.mobile} onChange={(e)=>setAddress({...address,mobile:e.target.value})} className='pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50'/>
            </div>
            <div className='relative'>
              <HomeIcon className='absolute left-3 top-3 text-green-600' size={18}/>
              <input type="text" value={address.fullAddress} onChange={(e)=>setAddress({...address,fullAddress:e.target.value})} className='pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50'/>
            </div>
          </div>
          </motion.div>
        </div>
    </div>
  )
}

export default Checkout