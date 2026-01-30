import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/Cart.module.css'
import { saveCart, getCart, clearCart as clearCartFirestore } from '../lib/firestore'

export default function Cart() {
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [showClearDialog, setShowClearDialog] = useState(false)

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

    // Load cart from Firestore
    const loadCart = async () => {
      try {
        const firestoreCart = await getCart(parsedUser.email)
        setCart(firestoreCart)
      } catch (error) {
        console.error('Error loading cart:', error)
        // Fallback to localStorage
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          setCart(JSON.parse(savedCart))
        }
      }
    }
    
    loadCart()
  }, [router])

  const updateCartQuantity = async (barcode, newQuantity) => {
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
    
    try {
      const userData = localStorage.getItem('user')
      const user = JSON.parse(userData)
      await saveCart(user.email, newCart)
    } catch (error) {
      console.error('Error saving cart:', error)
      localStorage.setItem('cart', JSON.stringify(newCart))
    }
  }

  const removeFromCart = async (barcode) => {
    const newCart = cart.filter(item => item.barcode !== barcode)
    setCart(newCart)
    
    try {
      const userData = localStorage.getItem('user')
      const user = JSON.parse(userData)
      await saveCart(user.email, newCart)
    } catch (error) {
      console.error('Error saving cart:', error)
      localStorage.setItem('cart', JSON.stringify(newCart))
    }
  }

  const clearCart = () => {
    setShowClearDialog(true)
  }

  const confirmClearCart = async () => {
    setShowClearDialog(false)
    setCart([])
    try {
      const userData = localStorage.getItem('user')
      const user = JSON.parse(userData)
      await clearCartFirestore(user.email)
    } catch (error) {
      console.error('Error clearing cart:', error)
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
                  
                  <span className={styles.itemPrice}>Php{item.price.toFixed(2)}</span>
                  <span className={styles.itemTotal}>Php{(item.price * item.quantity).toFixed(2)}</span>
                  
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
                <span>Php{(calculateTotal() * 0.88).toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>VAT (12%):</span>
                <span>Php{(calculateTotal() * 0.12).toFixed(2)}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total:</span>
                <span>Php{calculateTotal().toFixed(2)}</span>
              </div>
              <div className={styles.actionButtons}>
                <Link href="/scanner" className={styles.scannerBtn}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="7" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 4h10l2 3H5l2-3z" fill="currentColor"/>
                    <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </Link>
                <Link href="/checkout" className={styles.checkoutBtnWrapper}>
                  <button className={styles.checkoutBtn}>
                    Checkout
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Custom Clear Cart Confirmation Dialog */}
      {showClearDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialogBox}>
            <h3 className={styles.dialogTitle}>Clear Shopping Cart?</h3>
            <p className={styles.dialogMessage}>
              Are you sure you want to clear all items from your shopping cart?
            </p>
            <div className={styles.dialogActions}>
              <button 
                className={styles.dialogCancel}
                onClick={() => setShowClearDialog(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.dialogConfirm}
                onClick={confirmClearCart}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
