import mongoose from "mongoose";

interface IDeliveryAssignment{
    _id?:mongoose.Types.ObjectId
    order:mongoose.Types.ObjectId
    brodcastedTo:mongoose.Types.ObjectId[]
    // Jin delivery boys ne reject kiya — sirf unki apni broadcast list se ghaib hoti hai
    rejectedBy:mongoose.Types.ObjectId[]
    assignedTo:mongoose.Types.ObjectId | null
    status: "brodcasted" | "assigned" | "completed"
    acceptedAt:Date
    createdAt?:Date
    updatedAt?:Date
}

const deliveryAssignmentSchema=new mongoose.Schema<IDeliveryAssignment>({
    order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    },
    brodcastedTo:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    rejectedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        enum:["brodcasted" , "assigned" , "completed"],
        default:"brodcasted"
    },
    acceptedAt:{
        type:Date
    }
},{timestamps:true})

deliveryAssignmentSchema.index({ order: 1 })
deliveryAssignmentSchema.index({ brodcastedTo: 1, status: 1 })

if (mongoose.models.DeliveryAssignment) {
  delete (mongoose.models as any).DeliveryAssignment
}
const DeliveryAssignment=mongoose.model("DeliveryAssignment", deliveryAssignmentSchema)

export default DeliveryAssignment