import React from 'react'
import HeroSection from './HeroSection'
import CategorySlider from './CategorySlider'
import GroceryCard from './GroceryCard'
import connectDb from '@/lib/db'
import Grocery from '@/models/grocery.model'

 async function UserDashboard() {
  await connectDb();
  const groceries = await Grocery.find({});
  const plainGrocery = JSON.parse(JSON.stringify(groceries))
  return (
    <>
    <HeroSection/>
    <CategorySlider/>
    {plainGrocery.map((items:any, index:number)=>(
      <GroceryCard item={items} key={index}/>
    ))}
    </>
  )
}

export default UserDashboard