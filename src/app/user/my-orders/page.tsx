'use client'
import { IOrder } from '@/models/order.model'
import axios from 'axios'
import { ArrowLeft, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

function MyOrder() {
  const router= useRouter();
  const [orders,setOrders]=useState<IOrder[]>();
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    const getMyOrders = async () => {
      try {
        const result=await axios.get("/api/user/my-orders")
        setOrders(result.data)
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
    getMyOrders();
  },[])

if(loading){
  return <div className='flex items-center justify-center min-h-[50vh] text-gray-600'>Loading...</div>
}

  return (
    <div className='bg-linear-to-b from white to-gray-100 min-h-screen w-full'>
      <div className='max-w-3xl mx-auto px-4 pt-16 pb-10 relative'>
        <div className='fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50'>
          <div className='max-w-3xl mx-auto flex items-center gap-4 px-4 py-3'>
            <button className='p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition' onClick={()=>router.push("/")}><ArrowLeft className='text-green-700' size={24} /></button>
            <h1 className='text-xl font-bold text-gray-800'>My Orders</h1>
          </div>
        </div>
        {orders?.length==0? (
          <div >
            <Package/>
            <h2>No orders found.</h2>
            <p>Start shopping to place your first order.</p>
          </div>
        ):<div></div>}

      </div>
    </div>
  )
}

export default MyOrder