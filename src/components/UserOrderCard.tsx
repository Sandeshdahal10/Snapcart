'use client'
import { IOrder } from '@/models/order.model'
import { get } from 'http'
import { motion } from 'motion/react'
import React from 'react'

function UserOrderCard({order}: {order:IOrder}) {
  const getStatusColor=(status:string)=>{
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Out for Delivery":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "Delivered":
        return "bg-green-100 text-green-700 border-green-300";
      default: 
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  }
  return (
    <motion.div 
    initial={{opacity:0, y:15}}
    animate={{opacity:1, y:0}}
    transition={{duration:0.4}}
    className='bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 px-5 py-4 bg-linear-to-r from-green-50 to-white'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800'>order <span className='text-green-700 font-bold'>#{order?._id?.toString().slice(-6)}</span></h3>
          <p className='text-xs text-gray-500 mt-1'>{new Date(order?.createdAt!).toLocaleString()}</p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
            order.isPaid
            ?"bg-green-100 text-green-700 border-green-300"
            :"bg-red-100 text-red-700 border-red-300"
          }`}>
            {order.isPaid?"paid":"not paid yet"}
          </span>
          <span className={`px-3 py-1 text-xs font-semibold border rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default UserOrderCard