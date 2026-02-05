import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[
      {hostname:"lh3.googleusercontent.com"},
      {hostname:"images.unsplash.com"},
      {hostname:"media.istockphoto.com"},
      {hostname:"plus.unsplash.com"},
      {hostname:"res.cloudinary.com"}


    ]
  }
};

export default nextConfig;
