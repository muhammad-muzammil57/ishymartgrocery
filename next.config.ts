import type { NextConfig } from "next";

const nextConfig: NextConfig = {
images:{
  remotePatterns:[
    {hostname:"lh3.googleusercontent.com"},
      {hostname:"cdn.shopify.com"},
      {hostname:"res.cloudinary.com"},
      {hostname:"images.unsplash.com"},
      {hostname:"media.istockphoto.com"},
  ]
},

outputFileTracingIncludes: {
  "/*": ["./src/proxy.ts"],
},

};

export default nextConfig;
