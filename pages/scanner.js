import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/Scanner.module.css'
import dynamic from 'next/dynamic'
import { getProductByBarcode, getTransactionByBarcode, getCart } from '../lib/firestore'

// Dynamically import the barcode scanner component with no SSR
const BarcodeScanner = dynamic(() => import('../components/BarcodeScanner'), {
  ssr: false,
})

export default function Scanner() {
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [user, setUser] = useState(null)

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
    setUser(parsedUser)

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

  const handleScan = async (barcode) => {
    console.log('Scanned barcode:', barcode)
    
    // Check if it's a transaction barcode
    if (barcode.startsWith('TXN')) {
      try {
        // Get user email
        const userData = localStorage.getItem('user')
        const user = JSON.parse(userData)
        
        // Look up transaction in Firestore
        const transaction = await getTransactionByBarcode(barcode, user.email)
        
        if (transaction) {
          router.push(`/receipt/${barcode}`)
          return
        }
      } catch (error) {
        console.error('Error looking up transaction:', error)
      }
    }
    
    // Always redirect to product page (will handle not found there)
    router.push(`/product/${barcode}`)
  }

  const handleError = (error) => {
    console.error('Scanner error:', error)
  }

  const calculateItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Store Counter - CounterJob</title>
        <meta name="description" content="Scan product barcodes" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/profile" className={styles.profileLink}>
            <div className={styles.userInfo}>
              {user.picture && <img src={user.picture} alt="User" className={styles.userAvatar} />}
              <span className={styles.userName}>{user.name}</span>
            </div>
          </Link>
        </div>
        <h1>Store Counter</h1>
        <div className={styles.headerRight}>
          <Link href="/cart" className={styles.cartButton}>
            🛒
            {calculateItemCount() > 0 && (
              <span className={styles.cartBadge}>{calculateItemCount()}</span>
            )}
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.scannerFullPage}>
          <div className={styles.scannerContainer}>
            <BarcodeScanner 
              onScan={handleScan}
              onError={handleError}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
