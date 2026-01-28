import { db } from '../firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore'

// ============ PRODUCTS ============

/**
 * Get all products from Firestore
 */
export async function getAllProducts() {
  try {
    const productsCol = collection(db, 'products')
    const productSnapshot = await getDocs(productsCol)
    const productList = productSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return productList
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

/**
 * Get product by barcode
 */
export async function getProductByBarcode(barcode) {
  try {
    console.log('Searching for barcode:', barcode)
    const productsRef = collection(db, 'products')
    const q = query(productsRef, where('barcode', '==', barcode))
    const querySnapshot = await getDocs(q)
    
    console.log('Query result - found documents:', querySnapshot.size)
    
    if (querySnapshot.empty) {
      console.log('No product found with barcode:', barcode)
      return null
    }
    
    const doc = querySnapshot.docs[0]
    const productData = { id: doc.id, ...doc.data() }
    console.log('Found product:', productData)
    return productData
  } catch (error) {
    console.error('Error fetching product by barcode:', error)
    throw error
  }
}

/**
 * Add a new product
 */
export async function addProduct(productData) {
  try {
    const productsRef = collection(db, 'products')
    const docRef = await addDoc(productsRef, productData)
    return docRef.id
  } catch (error) {
    console.error('Error adding product:', error)
    throw error
  }
}

/**
 * Update product stock
 */
export async function updateProductStock(barcode, newStock) {
  try {
    const product = await getProductByBarcode(barcode)
    if (!product) {
      throw new Error('Product not found')
    }
    const productRef = doc(db, 'products', product.id)
    await updateDoc(productRef, { stock: newStock })
  } catch (error) {
    console.error('Error updating product stock:', error)
    throw error
  }
}

// ============ TRANSACTIONS ============

/**
 * Create a new transaction
 */
export async function createTransaction(transactionData) {
  try {
    const userEmail = transactionData.user.email
    // Remove TXN prefix from barcode for cleaner storage
    const transactionId = transactionData.barcode.replace('TXN', '')
    
    // Transform items to simplified structure
    const simplifiedItems = transactionData.items.map(item => ({
      item: item.name,
      qty: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity
    }))
    
    // Use transactionId as document ID in receipts subcollection
    const transactionDocRef = doc(db, 'transactions', userEmail, 'receipts', transactionId)
    await setDoc(transactionDocRef, {
      email: userEmail,
      datepurchased: Timestamp.fromDate(new Date(transactionData.date)),
      items: simplifiedItems,
      total: transactionData.total
    })
    return { id: transactionId, ...transactionData }
  } catch (error) {
    console.error('Error creating transaction:', error)
    throw error
  }
}

/**
 * Get transaction by barcode/ID
 */
export async function getTransactionByBarcode(barcode, userEmail) {
  try {
    // Remove TXN prefix if present
    const cleanBarcode = barcode.replace('TXN', '')
    
    const transactionDocRef = doc(db, 'transactions', userEmail, 'receipts', cleanBarcode)
    const docSnap = await getDoc(transactionDocRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    const data = docSnap.data()
    return { 
      id: cleanBarcode, 
      barcode: 'TXN' + cleanBarcode,
      date: data.datepurchased?.toDate().toISOString(),
      items: data.items,
      total: data.total,
      email: data.email
    }
  } catch (error) {
    console.error('Error fetching transaction:', error)
    throw error
  }
}

/**
 * Get all transactions for a user
 */
export async function getUserTransactions(userEmail) {
  try {
    const userTransactionsRef = collection(db, 'transactions', userEmail, 'receipts')
    const q = query(userTransactionsRef, orderBy('datepurchased', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const transactions = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        barcode: 'TXN' + doc.id,
        date: data.datepurchased?.toDate().toISOString(),
        items: data.items,
        total: data.total,
        email: data.email
      }
    })
    return transactions
  } catch (error) {
    console.error('Error fetching user transactions:', error)
    throw error
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(barcode, userEmail) {
  try {
    // Remove TXN prefix if present
    const cleanBarcode = barcode.replace('TXN', '')
    
    const transactionDocRef = doc(db, 'transactions', userEmail, 'receipts', cleanBarcode)
    await deleteDoc(transactionDocRef)
  } catch (error) {
    console.error('Error deleting transaction:', error)
    throw error
  }
}

// ============ CART (User-specific) ============

/**
 * Save cart to Firestore for a user
 */
export async function saveCart(userEmail, cartItems) {
  try {
    const cartsRef = collection(db, 'carts')
    const q = query(cartsRef, where('userEmail', '==', userEmail))
    const querySnapshot = await getDocs(q)
    
    // Transform cart items to only include specified fields
    const simplifiedItems = cartItems.map(item => ({
      addedAt: item.addedAt || Timestamp.now(),
      barcode: item.barcode,
      brand: item.brand || '',
      name: item.name,
      qty: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity
    }))
    
    // Calculate total for the entire cart
    const total = simplifiedItems.reduce((sum, item) => sum + item.subtotal, 0)
    
    if (querySnapshot.empty) {
      // Create new cart
      await addDoc(cartsRef, {
        userEmail,
        items: simplifiedItems,
        total
      })
    } else {
      // Replace existing cart completely to remove any other fields
      const docId = querySnapshot.docs[0].id
      const cartRef = doc(db, 'carts', docId)
      await setDoc(cartRef, {
        userEmail,
        items: simplifiedItems,
        total
      })
    }
  } catch (error) {
    console.error('Error saving cart:', error)
    throw error
  }
}

/**
 * Get cart for a user
 */
export async function getCart(userEmail) {
  try {
    const cartsRef = collection(db, 'carts')
    const q = query(cartsRef, where('userEmail', '==', userEmail))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return []
    }
    
    const data = querySnapshot.docs[0].data()
    // Transform back to the format expected by the app
    const items = (data.items || []).map(item => ({
      barcode: item.barcode,
      brand: item.brand,
      name: item.name,
      quantity: item.qty,
      price: item.price,
      addedAt: item.addedAt
    }))
    return items
  } catch (error) {
    console.error('Error fetching cart:', error)
    throw error
  }
}

/**
 * Clear cart for a user
 */
export async function clearCart(userEmail) {
  try {
    const cartsRef = collection(db, 'carts')
    const q = query(cartsRef, where('userEmail', '==', userEmail))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id
      await deleteDoc(doc(db, 'carts', docId))
    }
  } catch (error) {
    console.error('Error clearing cart:', error)
    throw error
  }
}
