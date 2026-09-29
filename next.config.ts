import type { NextConfig } from "next";

// Security scan (OWASP ZAP) ne jo missing headers flag kiye the, unko yahan
// add kiya hai. Yeh sab responses server se hi bhej diye jate hain, isliye
// koi existing feature (images, forms, API calls) nahi tootta.
const securityHeaders = [
  // Clickjacking se bachata hai — site ko kisi aur website ke <iframe> mein
  // load nahi hone deta (\"Missing Anti-clickjacking Header\")
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Browser ko file ka type khud \"guess\" karne se rokta hai
  // (\"X-Content-Type-Options Header Missing\")
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Purane browsers ke liye extra XSS protection layer
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Har request https par force karta hai (\"Strict-Transport-Security Header Not Set\")
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Dusri site ko yeh pata nahi chalne deta ke user is site se aaya
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Content Security Policy (\"CSP Header Not Set\") — sirf apni site (self)
  // se scripts/styles/fonts allow karta hai, aur images apni site + jo
  // remote image domains next.config.ts mein already allowed hain unse.
  // Payment gateway ka checkout page alag origin (iframe/redirect) par hota
  // hai isliye usay nahi chahiye; agar app mein koi payment widget isi page
  // ke andar (embed/iframe) dikhta ho to us gateway ka domain frame-src mein
  // add karna hoga.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // \"Server Leaks Information via X-Powered-By\" — Next.js khud yeh header
  // bhejta hai jo batata hai site Next.js par bani hai; isay band kar diya
  poweredByHeader: false,

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

async headers() {
  return [
    {
      source: "/:path*",
      headers: securityHeaders,
    },
  ];
},

};

export default nextConfig;
