import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import mongoose from "mongoose";
interface IGrocery{
    _id?:mongoose.Types.ObjectId,
    name:string,
    price:string,
    unit:string,
    quantity:number,
    image:string,
    category:string,
    seller?: {
      _id: mongoose.Types.ObjectId
      name: string
      storeName?: string
      image?: string
    } | null,

    createdAt?:Date,
    updatedAt?:Date

}


interface ICartSlice{
    cartData:IGrocery[] ,
    subTotal:number,
    deliveryFee:number,
    finalTotal:number
}

const initialState:ICartSlice = {
cartData:[],
subTotal:0,
deliveryFee:100,
finalTotal:100
} 

const cartSlice = createSlice({
    name:'cart',
    initialState,
    reducers:{
addToCart:(state,action:PayloadAction<IGrocery>)=>{
    state.cartData.push(action.payload)
    cartSlice.caseReducers.caluclateTotals(state)
},
increaseQuantity:(state,action:PayloadAction<mongoose.Types.ObjectId>)=>{
    const item = state.cartData.find(item => item._id == action.payload)
    if(item){
        item.quantity= item.quantity + 1
}
cartSlice.caseReducers.caluclateTotals(state)

    },
decreaseQuantity:(state,action:PayloadAction<mongoose.Types.ObjectId>)=>{
    const item = state.cartData.find(item => item._id == action.payload)
    if(item){
        if(item.quantity > 1){
            item.quantity= item.quantity - 1
        }else{
            state.cartData = state.cartData.filter(cartItem => cartItem._id?.toString() !== action.payload.toString())
}
    }
    cartSlice.caseReducers.caluclateTotals(state)

    },
    removeFromCart:(state,action:PayloadAction<mongoose.Types.ObjectId>)=>{
        state.cartData = state.cartData.filter(cartItem => cartItem._id?.toString() !== action.payload.toString())
        cartSlice.caseReducers.caluclateTotals(state)

    },
    caluclateTotals:(state)=>{
        state.subTotal = state.cartData.reduce((total,item)=> total + (Number(item.price) * item.quantity),0)
        state.deliveryFee = state.subTotal>1000?0:100
        state.finalTotal = state.subTotal + state.deliveryFee
    }
    }
})

export const {addToCart,increaseQuantity,decreaseQuantity,removeFromCart} = cartSlice.actions
export default cartSlice.reducer