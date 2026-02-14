'use client';
import axios from 'axios'
import React, { useEffect } from 'react'

function DeliveryBoyDashboard() {
  useEffect(()=>{
    const fetchAssignments=async()=>{
      try {
        const result=await axios.get('/api/delivery/get-assignments');
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    }
    fetchAssignments();
  },[])
  return (
    <div>
      
    </div>
  )
}

export default DeliveryBoyDashboard