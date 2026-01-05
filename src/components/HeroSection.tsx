import { Leaf, Smartphone, Truck } from 'lucide-react'
import { sub } from 'motion/react-client'
import React from 'react'

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
  return (
    <div>

    </div>
  )
}

export default HeroSection