import uploadOnCloudinary from "@/app/lib/cloudinary";
import connectDb from "@/app/lib/db";
import Grocery from "@/app/Models/grocery.model";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {

        await connectDb();

        const session = await auth();
        if (!session || session?.user?.role !== "admin") {
            return NextResponse.json(
                { Message:"Unauthorized.This only admin can add grocery items" },
                  {status:400})
        }

        const formData = await request.formData()
        const name = formData.get("name") as string;

        const price = formData.get("price") as string;
        const unit = formData.get("unit") as string;
        const category = formData.get("category") as string;
        
        const file = formData.get("image") as Blob | null;
        let imageUrl
       if(file){
        imageUrl = await uploadOnCloudinary(file);
       }

       const grocery = await Grocery.create({
        name,
        price,
        unit,
        category,
        
        image:imageUrl || ""
       })

       return NextResponse.json(
        grocery,
        { status: 200 })

    } catch (error) {
        console.error("Error adding grocery item:", error);
        return new Response(JSON.stringify({ error: "Failed to add grocery item" }), { status: 500 });
    } 
}