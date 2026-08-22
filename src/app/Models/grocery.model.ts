import mongoose from "mongoose";

interface IGrocery{
    _id?:mongoose.Types.ObjectId,
    name:string,
    price:string,
    unit:string,
    image:string,
    category:string,
    // agar null/undefined hai to yeh product admin (IshyMart) ka apna stock hai
    seller?:mongoose.Types.ObjectId | null,

    createdAt?:Date,
    updatedAt?:Date

}

const grocerySchema = new mongoose.Schema<IGrocery>({
    name:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    unit:{
        type:String,
        required:true,
        enum: [
            "kg",
            "gram",
            "litter",
            "ml",
            "pack",
            "piece",
        ]
    },
    image:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true,
        enum: [
            "Fruits & Vegetables",
            "Dairy & Eggs",
            "Rice, Atta & Pulses",
            "Snacks & Biscuits",
            "Beverages & Drinks",
            "Personal Care & Hygiene",
            "Household Essentials",
            "Instant & Packaged Food",
            "Baby & Pet Care",
            "Spices & Masalas",
        ]
    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },

},{
    timestamps:true
})

grocerySchema.index({ seller: 1 })

const Grocery= mongoose.models.Grocery || mongoose.model<IGrocery>("Grocery",grocerySchema)
export default Grocery