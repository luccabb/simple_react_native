import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {

      const productsCache = await AsyncStorage.getItem('products')

      if (productsCache[1]){

        setProducts(JSON.parse(productsCache))

      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {

    console.log('----------------', products)

    console.log('-----item-----', product.id)
    const cartItemIndex = products.findIndex(item => item.id == product.id)
    console.log('cart', cartItemIndex)
    if (cartItemIndex >=0) {

      products[cartItemIndex]['quantity'] += 1

      await AsyncStorage.setItem('products', JSON.stringify(products))

      // return setProducts([...products])
      setProducts(products.map(p => p.id === product.id ? {...product, quantity: p.quantity + 1} : p))

    } else {

      console.log('vazio', product, '>>', [...products, product]);

      product['quantity'] = 1

      await AsyncStorage.setItem('products', JSON.stringify([...products, product]))

      // setProducts([...products, product])
      setProducts([...products, { ...product, quantity:1}])

    }

  }, [products]);

  const increment = useCallback(async id => {
    const cartItemIndex = products.findIndex(item => item.id == id)
    products[cartItemIndex]['quantity'] += 1

    await AsyncStorage.setItem('products', JSON.stringify([...products]))
    return setProducts([...products])
  }, [products]);

  const decrement = useCallback(async id => {
    const cartItemIndex = products.findIndex(item => item.id == id)
    if (products[cartItemIndex]['quantity'] == 1) {
      products[cartItemIndex]['quantity'] -= 1
      const removedProduct = products.filter(item => item.id != id)

      await AsyncStorage.setItem('products', JSON.stringify([removedProduct]))
      return setProducts(removedProduct)

    } else {
      products[cartItemIndex]['quantity'] -= 1

      await AsyncStorage.setItem('products', JSON.stringify([...products]))
      return setProducts([...products])
    }
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
