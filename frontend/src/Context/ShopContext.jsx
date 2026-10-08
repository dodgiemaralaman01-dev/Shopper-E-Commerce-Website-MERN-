import React, { createContext, useEffect, useState } from 'react';

export const ShopContext = createContext(null);
const CART_STORAGE_KEY = 'shop-cart';

    const getDefaultCart = ()=>{
        let cart = {};
        for (let index = 0; index < 300+1; index++) {
            cart[index] = 0;
        }
        return cart;
    }

const getInitialCart = () => {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        return savedCart ? { ...getDefaultCart(), ...JSON.parse(savedCart) } : getDefaultCart();
    } catch {
        return getDefaultCart();
    }
}

const ShopContextProvider = (props) => {

    const [all_product,setAll_Product] = useState([]);
    const [allProductsLoading,setAllProductsLoading] = useState(true);
    const [allProductsError,setAllProductsError] = useState(null);
    const [cartItems,setCartItems] = useState(getDefaultCart);

    useEffect(()=>{
        fetch('http://localhost:4000/allproducts')
        .then((response)=>{
            if (!response.ok) {
                throw new Error(`Failed to load products (${response.status})`);
            }
            return response.json();
        })
        .then((data)=>{
            if (!Array.isArray(data)) {
                throw new Error('The products API returned an invalid response');
            }
            setAll_Product(data);
        })
        .catch((error)=>{
            console.error('Failed to load products:', error);
            setAllProductsError(error.message);
        })
        .finally(()=>setAllProductsLoading(false));

        if(localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/getcart',{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:"",
            }).then((response)=>response.json())
            .then((data)=>setCartItems(data));
        }
    },[])

    const addToCart = (itemId) =>{
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
        if(localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/addtocart',{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemId":itemId}),
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data));
        }
    }

    const removeFromCart = (itemId) =>{
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))
        if(localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/removefromcart',{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemId":itemId}),
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data));
        }
    } 
    
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for(const item in cartItems)
        {
            if(cartItems[item]>0)
            {
                let itemInfo = all_product.find((product)=>product.id===Number(item))
                totalAmount += itemInfo.new_price * cartItems[item];
            }
        }
        return totalAmount;
    }

    const getTotalCartItems = () => {
        let totalItem = 0;
        for(const item in cartItems)
        {
            if(cartItems[item]>0)
            {
                totalItem += cartItems[item];
            }
        }
        return totalItem;
    }
    
    const contextValue = {getTotalCartItems, getTotalCartAmount, all_product, allProductsLoading, allProductsError, cartItems, addToCart, removeFromCart};
    return(
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider