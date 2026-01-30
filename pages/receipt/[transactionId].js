import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import BarcodeScanner from '../../components/BarcodeScanner'
import styles from '../../styles/Receipt.module.css'
import { getTransactionByBarcode, deleteTransaction, getAllProducts } from '../../lib/firestore'

export default function Receipt() {
  const router = useRouter()
  const { transactionId } = router.query
  const [transaction, setTransaction] = useState(null)
  const [showScanner, setShowScanner] = useState(false)
  const [scannedProduct, setScannedProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const loadData = async () => {
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

      // Load products from Firestore
      try {
        const productsData = await getAllProducts()
        setProducts(productsData)
      } catch (error) {
        console.error('Failed to load products:', error)
      }

      if (transactionId) {
        try {
          const userData = localStorage.getItem('user')
          const user = JSON.parse(userData)
          
          // Load transaction from Firestore
          const found = await getTransactionByBarcode(transactionId, user.email)
          
          if (found) {
            setTransaction(found)
          } else {
            // Transaction not found
            router.push('/scanner')
          }
        } catch (error) {
          console.error('Error loading transaction:', error)
          // Fallback to localStorage
          const transactions = JSON.parse(localStorage.getItem('transactions') || '[]')
          const found = transactions.find(t => t.barcode === transactionId)
          
          if (found) {
            setTransaction(found)
          } else {
            router.push('/scanner')
          }
        }
      }
    }
    
    loadData()
  }, [transactionId, router])

  const handleScan = (barcode) => {
    console.log('Scanned barcode:', barcode)
    
    // Find product by barcode
    const product = products.find(p => p.barcode === barcode)
    
    if (product) {
      setScannedProduct(product)
    } else {
      // Show error if product not found
      setScannedProduct({ error: 'Product not found', barcode })
    }
  }

  const handleScanError = (error) => {
    console.error('Scanner error:', error)
  }

  const toggleScanner = () => {
    setShowScanner(!showScanner)
    if (showScanner) {
      setScannedProduct(null)
    }
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    setShowDeleteDialog(false)
    try {
      const userData = localStorage.getItem('user')
      const user = JSON.parse(userData)
      
      // Delete from Firestore
      await deleteTransaction(transactionId, user.email)
      // Redirect to profile
      router.push('/profile')
    } catch (error) {
      console.error('Error deleting transaction:', error)
      // Fallback to localStorage
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]')
      const updatedTransactions = transactions.filter(t => t.barcode !== transactionId)
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions))
      router.push('/profile')
    }
  }

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
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Receipt - {transaction.id}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <header className={styles.header}>
        <Link href="/scanner" className={styles.backLink}>
          ←
        </Link>
        <h1>Receipt</h1>
        <div className={styles.headerSpace}></div>
      </header>

      <main className={styles.main}>
        <div className={styles.receipt}>
          <button 
            className={styles.deleteButton}
            onClick={handleDelete}
            title="Delete receipt"
          >
            🗑️
          </button>
          
          <div className={styles.receiptHeader}>
            <h2>RECEIPT</h2>
            <p className={styles.storeName}>Sari-Sari Store</p>
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
            {transaction.items.map((item, index) => (
              <div key={index} className={styles.receiptItem}>
                <span className={styles.itemName}>{item.item || item.name}</span>
                <span className={styles.itemQty}>{item.qty || item.quantity}</span>
                <span className={styles.itemPrice}>Php{item.price.toFixed(2)}</span>
                <span className={styles.itemTotal}>Php{item.subtotal ? item.subtotal.toFixed(2) : (item.price * (item.qty || item.quantity)).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal:</span>
              <span>Php{(transaction.subtotal || transaction.total * 0.88).toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>VAT (12%):</span>
              <span>Php{(transaction.tax || transaction.total * 0.12).toFixed(2)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>TOTAL:</span>
              <span>Php{transaction.total.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.barcodeSection}>
            <p className={styles.barcodeLabel}>Transaction Barcode:</p>
            <svg className={styles.barcode} viewBox="0 0 200 60">
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
          </div>
        </div>
      </main>

      {/* Custom Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialogBox}>
            <h3 className={styles.dialogTitle}>Delete Receipt?</h3>
            <p className={styles.dialogMessage}>
              Are you sure you want to delete this receipt? This action cannot be undone.
            </p>
            <div className={styles.dialogActions}>
              <button 
                className={styles.dialogCancel}
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.dialogConfirm}
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
