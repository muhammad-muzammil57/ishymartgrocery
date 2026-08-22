'use client'
import { ArrowLeft, Loader, PlusCircle, Upload} from 'lucide-react'
import Link from 'next/link'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import {motion} from "motion/react"
import { handleBuildComplete } from 'next/dist/build/adapter/build-complete'
import Image from 'next/image'
import axios from 'axios'

const categories = [
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

const units = [
    "kg",
    "gram",
    "litter",
    "ml",
    "pack",
    "piece",
]


function AddGrocery() {

    const [name,setName]= useState("")
    const [category,setCategory]= useState("")
    const [unit,setUnit]= useState("")
    const [preview, setPreview]= useState<string | null>()
    const [backendImage,setBackendImage]= useState<File | null>()
    const [price,setPrice]= useState("")
    const [loading,setLoading]= useState(false)
    const handleImageChange=(e:ChangeEvent<HTMLInputElement>)=>{
        const files = e.target.files
            if(!files || files.length == 0)return
            const file = files[0]

       setBackendImage(file)
       setPreview(URL.createObjectURL(file))
    }


        const handleSubmit= async (e:FormEvent)=>{
            e.preventDefault()
            setLoading(true)
            try {
                const formData = new FormData()
                formData.append("name",name)
                formData.append("category",category)
                formData.append("price",price)
                formData.append("unit",unit)
                if(backendImage){
                    formData.append("image",backendImage)

                }
                const result = await axios.post("/api/admin/add-grocery", formData)
                console.log(result.data)
                setLoading(false)
            } catch (error) {
                console.error("Error adding grocery item:", error)
                setLoading(false)
                
            }
        }

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-white py-16 px-4 relative'>
      <Link href={"/"} className='text-green-700 absolute top-6 left-6 flex items-center gap-2 font-semibold bg-white px-4 py-2 rounded-full shadow-md hover:bg-green-100 hover:shadow-lg transition-all'>
      <ArrowLeft className='w-5 h-5' />
    <span className='hidden md:flex'>  Back to Home </span>
      
      </Link>

    <motion.div 
    initial={{y:20,opacity:0}}
    animate={{y:0,opacity:1}}
    transition={{duration:0.6}}

    className='bg-white w-full max-w-2xl shadow-2xl rounded-3xl border border-green-100 p-8'
    >
        <div className='flex flex-col items-center mb-8'>
            <div className='flex items-center gap-3 hidden md:flex '>
                <PlusCircle className='text-green-600 w-8 h-8'/>
            <h1 className='text-4xl font-extrabold text-green-700 '>Add New Grocery Item</h1>
            </div>
            <div className='flex items-center gap-3 md:hidden '>
                <PlusCircle className='text-green-600 w-8 h-8'/>
            <h1 className='text-xl font-extrabold text-green-700 '>Add New Grocery Item</h1>
            </div>
            <p className='text-gray-500 text-sm mt-2 text-center'>Fill Out the details below to add new grocery item.</p>
           
        </div>

       
        <form className='flex flex-col gap-6 w-full'
        onSubmit={handleSubmit}
        >
            <div className='mb-6'>
            <label htmlFor='name' className='block text-gray-700 font-semibold mb-2'>Grocery Name <span className='text-red-600 '>*</span></label>
            <input type='text' id='name' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='Enter grocery name' onChange={(e)=>setName(e.target.value)}
            value={name} />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div>
                <label htmlFor='category' className='block text-gray-700 font-semibold mb-2'>Category<span className='text-red-600 '>*</span></label>
                <select id='category' name='category' className='w-full px-4 py-2 border  rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500' onChange={(e)=>setCategory(e.target.value)}
                    value={category}>
                <option value='' disabled selected>Select category</option>
               {categories.map(cat =>(
                <option value={cat} key={cat}>{cat}</option>
               )
               )}
            </select>
                </div>
                <div>
                <label htmlFor='category' className='block text-gray-700 font-semibold mb-2'>Unit<span className='text-red-600 '>*</span></label>
                <select id='unit' name='unit' className='w-full px-4 py-2 border  rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500' 
                onChange={(e)=>setUnit(e.target.value)}
                value={unit}
                >
                <option value='' disabled selected>Select Unit</option>
               {units.map(unit =>(
                <option value={unit} key={unit}>{unit}</option>
               )
               )}
            </select>
                </div>
            </div>

            <div className='mb-6'>
            <label htmlFor='name' className='block text-gray-700 font-semibold mb-2'>Enter Price <span className='text-red-600 '>*</span></label>
            <input type='text' id='price' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='Enter grocery price' 
            onChange={(e)=>setPrice(e.target.value)}
            value={price}
            />
            </div>
            <div className='mb-6 flex flex-col sm:flex-row gap-5 items-center justify-center'>
            <label htmlFor='image' className='cursor-pointer flex items-center justify-center gap-2 bg-green-50 text-green-700 font-semibold border border-green-200 rounded-xl px-6 py-3 hover:bg-green-100 transition-all w-full sm:w-auto'>
                <Upload/> Upload Image</label>
            <input type='file' accept='image/*' id='image' hidden
            onChange={handleImageChange}
            
            />

            {preview && <Image src={preview} alt='Image Preview' width={100} height={100} className='mt-4 rounded-lg object-cover' />}
            </div>

            
            <button type='submit' className='w-full bg-green-500 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors duration-300 flex items-center justify-center' disabled={loading}>
                {loading ? <Loader className='w-5 h-5 animate-spin'/> : "Add Grocery Item"}
                </button>
        </form>
    </motion.div>
      
    </div>
  )
}

export default AddGrocery
