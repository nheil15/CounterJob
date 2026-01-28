import { db } from '../firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
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
    const productsRef = collection(db, 'products')
    const q = query(productsRef, where('barcode', '==', barcode))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const doc = querySnapshot.docs[0]
    return { id: doc.id, ...doc.data() }
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
    const transactionsRef = collection(db, 'transactions')
    const docRef = await addDoc(transactionsRef, {
      ...transactionData,
      date: Timestamp.fromDate(new Date(transactionData.date))
    })
    return { id: docRef.id, ...transactionData }
  } catch (error) {
    console.error('Error creating transaction:', error)
    throw error
  }
}

/**
 * Get transaction by barcode/ID
 */
export async function getTransactionByBarcode(barcode) {
  try {
    const transactionsRef = collection(db, 'transactions')
    const q = query(transactionsRef, where('barcode', '==', barcode))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const doc = querySnapshot.docs[0]
    const data = doc.data()
    return { 
      id: doc.id, 
      ...data,
      date: data.date?.toDate().toISOString()
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
    const transactionsRef = collection(db, 'transactions')
    const q = query(
      transactionsRef, 
      where('user.email', '==', userEmail),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    const transactions = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate().toISOString()
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
export async function deleteTransaction(barcode) {
  try {
    const transactionsRef = collection(db, 'transactions')
    const q = query(transactionsRef, where('barcode', '==', barcode))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      throw new Error('Transaction not found')
    }
    
    const docId = querySnapshot.docs[0].id
    await deleteDoc(doc(db, 'transactions', docId))
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
    
    if (querySnapshot.empty) {
      // Create new cart
      await addDoc(cartsRef, {
        userEmail,
        items: cartItems,
        updatedAt: Timestamp.now()
      })
    } else {
      // Update existing cart
      const docId = querySnapshot.docs[0].id
      const cartRef = doc(db, 'carts', docId)
      await updateDoc(cartRef, {
        items: cartItems,
        updatedAt: Timestamp.now()
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
    return data.items || []
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
