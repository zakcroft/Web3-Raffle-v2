import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import counter from "./counterSlice";
import balance from "./ethBalance";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { createWrapper } from "next-redux-wrapper";

const rootReducer = {
  reducer: {
    // Add the generated reducer as a specific top-level slice
    //[invoicesApi.reducerPath]: invoicesApi.reducer,
    counter,
    balance,
  },
  devTools: true,
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  // middleware: (getDefaultMiddleware) => {
  //   getDefaultMiddleware().concat([
  //     invoicesApi.middleware
  //   ]),
  // },
};

// Function to create the Redux store
const makeStore = () => configureStore(rootReducer);

// Create a wrapper instance with custom options
const wrapper = createWrapper(makeStore);

export default wrapper;

setupListeners(makeStore().dispatch);

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
