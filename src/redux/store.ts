import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import userSlice from "./userSlice";
import cartSlice from "./cartSlice";
const storage = typeof window !== "undefined" 
  ? require("redux-persist/lib/storage").default 
  : require("redux-persist/lib/storage/session").default;

const persistConfig = {
  key: "user",
  storage,
};

const persistedUserReducer = persistReducer(persistConfig, userSlice);

// Cart sessionStorage mein save hota hai taake login (Google redirect) ke baad
// bhi guest ka cart na jaye. Tab band hone par khud clear ho jata hai.
const cartPersistConfig = {
  key: "cart",
  storage: require("redux-persist/lib/storage/session").default,
};
const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    cart: persistedCartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // persist ke liye zaroori
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;