import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/Cart.module.css'

export default function Cart() {
  const router = useRouter()
  const [cart, setCart] = useState([])

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    // Check if user is actually logged in (undefined means old user, treat as logged in)
    if (parsedUser.isLoggedIn === false) {
      router.push('/login')
      return
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [router])

  const updateCartQuantity = (barcode, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(barcode)
      return
    }

    const newCart = cart.map(item => 
      item.barcode === barcode 
        ? { ...item, quantity: newQuantity }
        : item
    )
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const removeFromCart = (barcode) => {
    const newCart = cart.filter(item => item.barcode !== barcode)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const clearCart = () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      setCart([])
      localStorage.removeItem('cart')
    }
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const calculateItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Shopping Cart - CounterJob</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <header className={styles.header}>
        <Link href="/scanner" className={styles.backLink}>
          ←
        </Link>
        <h1>Shopping Cart</h1>
        {cart.length > 0 && (
          <button onClick={clearCart} className={styles.clearCartBtn}>
            Clear
          </button>
        )}
      </header>

      <main className={styles.main}>
        {cart.length === 0 ? (
          <div className={styles.emptyCart}>
            <div className={styles.emptyCartIcon}>🛒</div>
            <p>Your cart is empty</p>
            <p className={styles.emptyCartSubtext}>Scan products to add them to cart</p>
            <Link href="/scanner">
              <button className={styles.startScanningBtn}>
                Start Scanning
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.cartItems}>
              {cart.map((item, index) => (
                <div key={index} className={styles.cartItem}>
                  <span className={styles.itemName}>{item.name}</span>
                  
                  <div className={styles.quantityControl}>
                    <button 
                      onClick={() => updateCartQuantity(item.barcode, item.quantity - 1)}
                      className={styles.quantityBtn}
                    >
                      −
                    </button>
                    <span className={styles.quantityDisplay}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateCartQuantity(item.barcode, item.quantity + 1)}
                      className={styles.quantityBtn}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  
                  <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                  <span className={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</span>
                  
                  <button 
                    onClick={() => removeFromCart(item.barcode)}
                    className={styles.removeBtn}
                    title="Remove from cart"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.cartSummary}>
              <div className={styles.summaryRow}>
                <span>Total Items:</span>
                <span>{calculateItemCount()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>${(calculateTotal() * 0.88).toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>VAT (12%):</span>
                <span>${(calculateTotal() * 0.12).toFixed(2)}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <Link href="/checkout">
                <button className={styles.checkoutBtn}>
                  Checkout
                </button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
