import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Checkout.module.css'

export default function Checkout() {
  const router = useRouter()
  const [transaction, setTransaction] = useState(null)
  const [cart, setCart] = useState([])

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    // Load cart
    const savedCart = localStorage.getItem('cart')
    if (!savedCart || JSON.parse(savedCart).length === 0) {
      router.push('/cart')
      return
    }

    const cartItems = JSON.parse(savedCart)
    setCart(cartItems)

    // Generate transaction ID
    const transactionId = 'TXN' + Date.now()
    
    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax

    // Create transaction
    const newTransaction = {
      id: transactionId,
      barcode: transactionId,
      items: cartItems,
      subtotal: subtotal,
      tax: tax,
      total: total,
      date: new Date().toISOString(),
      user: JSON.parse(userData)
    }

    // Save transaction to history
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]')
    transactions.push(newTransaction)
    localStorage.setItem('transactions', JSON.stringify(transactions))

    setTransaction(newTransaction)

    // Clear cart
    localStorage.removeItem('cart')
  }, [router])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!transaction) {
    return <div className={styles.loading}>Processing checkout...</div>
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Checkout - CounterJob</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <header className={styles.header}>
        <Link href="/scanner" className={styles.backLink}>
          ←
        </Link>
        <h1>✓ Transaction Complete</h1>
        <div className={styles.headerSpace}></div>
      </header>

      <main className={styles.main}>
        <div className={styles.receipt}>
          <div className={styles.receiptHeader}>
            <h2>RECEIPT</h2>
            <p className={styles.storeName}>CounterJob Store</p>
            <p className={styles.receiptDate}>{formatDate(transaction.date)}</p>
          </div>

          <div className={styles.transactionInfo}>
            <div className={styles.infoRow}>
              <span>Transaction ID:</span>
              <span className={styles.transactionId}>{transaction.id.replace('TXN', '')}</span>
            </div>
          </div>

          <div className={styles.itemsList}>
            <div className={styles.itemsHeader}>
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>
            {cart.map((item, index) => (
              <div key={index} className={styles.receiptItem}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemQty}>{item.quantity}</span>
                <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                <span className={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal:</span>
              <span>${transaction.subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>VAT (12%):</span>
              <span>${transaction.tax.toFixed(2)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>TOTAL:</span>
              <span>${transaction.total.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.barcodeSection}>
            <p className={styles.barcodeLabel}>Scan to view receipt:</p>
            <svg className={styles.barcode} viewBox="0 0 200 60">
              {/* Simple barcode representation */}
              <rect x="10" y="10" width="3" height="40" fill="#000"/>
              <rect x="16" y="10" width="2" height="40" fill="#000"/>
              <rect x="21" y="10" width="4" height="40" fill="#000"/>
              <rect x="28" y="10" width="2" height="40" fill="#000"/>
              <rect x="33" y="10" width="3" height="40" fill="#000"/>
              <rect x="39" y="10" width="2" height="40" fill="#000"/>
              <rect x="44" y="10" width="4" height="40" fill="#000"/>
              <rect x="51" y="10" width="2" height="40" fill="#000"/>
              <rect x="56" y="10" width="3" height="40" fill="#000"/>
              <rect x="62" y="10" width="4" height="40" fill="#000"/>
              <rect x="69" y="10" width="2" height="40" fill="#000"/>
              <rect x="74" y="10" width="3" height="40" fill="#000"/>
              <rect x="80" y="10" width="2" height="40" fill="#000"/>
              <rect x="85" y="10" width="4" height="40" fill="#000"/>
              <rect x="92" y="10" width="2" height="40" fill="#000"/>
              <rect x="97" y="10" width="3" height="40" fill="#000"/>
              <rect x="103" y="10" width="2" height="40" fill="#000"/>
              <rect x="108" y="10" width="4" height="40" fill="#000"/>
              <rect x="115" y="10" width="3" height="40" fill="#000"/>
              <rect x="121" y="10" width="2" height="40" fill="#000"/>
              <rect x="126" y="10" width="4" height="40" fill="#000"/>
              <rect x="133" y="10" width="2" height="40" fill="#000"/>
              <rect x="138" y="10" width="3" height="40" fill="#000"/>
              <rect x="144" y="10" width="2" height="40" fill="#000"/>
              <rect x="149" y="10" width="4" height="40" fill="#000"/>
              <rect x="156" y="10" width="2" height="40" fill="#000"/>
              <rect x="161" y="10" width="3" height="40" fill="#000"/>
              <rect x="167" y="10" width="2" height="40" fill="#000"/>
              <rect x="172" y="10" width="4" height="40" fill="#000"/>
              <rect x="179" y="10" width="2" height="40" fill="#000"/>
              <rect x="184" y="10" width="3" height="40" fill="#000"/>
            </svg>
            <p className={styles.barcodeNumber}>{transaction.barcode.replace('TXN', '')}</p>
          </div>

          <div className={styles.receiptFooter}>
            <p>Thank you for your purchase!</p>
            <p>Please keep this receipt for your records</p>
          </div>
        </div>
      </main>
    </div>
  )
}
