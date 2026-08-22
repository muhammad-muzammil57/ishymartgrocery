'use client'
import { setUserData } from '@/redux/userSlice';
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';

function useGetMe() {
  const [user, setUser] = useState(null);
  const dispatch=useDispatch()

  useEffect(() => {
    const getMe = async () => {
      try {
        const result = await axios.get("/api/me");
        console.log(result.data);
        dispatch(setUserData(result.data))
        setUser(result.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    getMe();
  }, []);
  return user
}

export default useGetMe
