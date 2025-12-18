import { ArrowLeft, Leaf, User } from 'lucide-react'
import {motion} from "motion/react"

type propType={
  previousStep:(s:number)=>void
}

function RegisterForm({previousStep}:propType) {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative'>
      <div className='absolute top-6 left-6 items-center flex  gap-2 text-green-700 hover:text-green-800 transition-colors cursor-pointer' onClick={()=>previousStep(1)}>
        <ArrowLeft className='w-5 h-5' />
        <span className='font-medium'>Back</span>
      </div>
      <motion.h1
      initial={{
        y:-10,
        opacity:0
      }}
      animate={{
        y:0,
        opacity:1
      }}
      transition={{
        duration:0.6
      }}
      className='text-4xl font-extrabold text-green-700 mb-2'>
        Create Account
      </motion.h1>
      <p className='text-gray-600 mb-8 flex items-center'>Join SnapCart today <Leaf className='w-5 h-5 text-green-600'/></p>
      <motion.form 
      initial={{
        
        opacity:0
      }}
      animate={{
        opacity:1
      }}
      transition={{
        duration:0.6
      }}
      className='flex flex-col gap-5 w-full max-w-sm'>
        <div className='relative'>
          <User className='absolute left-3 top-3.5 w-5 h-5 text-gray-400'/>
          <input type="text" placeholder='Enter your Name' className='w-full border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none' />
        </div>
      </motion.form>
    </div>
  )
}

export default RegisterForm