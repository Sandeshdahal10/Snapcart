import { div } from 'motion/react-client'
import React from 'react'

function Unauthorized() {
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
      <h1 className='text-3xl font-bold text-red-600 '>Access Denied 🚫</h1>
      <p className='mt-2 text-gray-700'>You do not have permission to access this page.</p>
    </div>
  )
}

export default Unauthorized