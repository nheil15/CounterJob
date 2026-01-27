import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../../styles/Product.module.css'
import productsData from '../../data/products.json'

export default function ProductDetails() {
  const router = useRouter()
  const { barcode } = router.query
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState([])

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    if (barcode) {
      // Find product in database
      const foundProduct = productsData.products.find(p => p.barcode === barcode)
      
      if (foundProduct) {
        setProduct(foundProduct)
      } else {
        setProduct({
          barcode: barcode,
          name: 'Unknown Product',
          price: 0,
          category: 'Unknown',
          stock: 0,
          description: 'This product is not in our database.',
          notFound: true
        })
      }
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [barcode, router])

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1
    if (value > 0 && value <= product.stock) {
      setQuantity(value)
    }
  }

  const addToCart = () => {
    if (!product || product.notFound) return

    const existingItemIndex = cart.findIndex(
      item => item.barcode === product.barcode
    )

    let newCart
    if (existingItemIndex >= 0) {
      newCart = [...cart]
      newCart[existingItemIndex].quantity += quantity
    } else {
      newCart = [...cart, {
        ...product,
        quantity: quantity,
        addedAt: new Date().toISOString()
      }]
    }

    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    
    // Redirect to cart or scanner
    router.push('/cart')
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{product.name} - CounterJob</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <header className={styles.header}>
        <Link href="/scanner" className={styles.backLink}>
          ← Back
        </Link>
        <h1>Product Details</h1>
        <div className={styles.headerSpace}></div>
      </header>

      <main className={styles.main}>
        <div className={styles.productDetails}>
          <div className={styles.productImage}>
            <div className={styles.imagePlaceholder}>
              📦
            </div>
          </div>
          
          <div className={styles.productInfo}>
            <h1 className={product.notFound ? styles.notFound : ''}>
              {product.name}
            </h1>
            
            {!product.notFound && (
              <div className={styles.priceTag}>
                ${product.price.toFixed(2)}
              </div>
            )}
            
            <div className={styles.description}>
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {!product.notFound && (
              <div className={styles.cartActions}>
                <div className={styles.quantityControl}>
                  <label className={styles.label}>Quantity:</label>
                  <div className={styles.quantityButtons}>
                    <button 
                      onClick={decreaseQuantity}
                      className={styles.quantityBtn}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <input 
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className={styles.quantityInput}
                      min="1"
                      max={product.stock}
                    />
                    <button 
                      onClick={increaseQuantity}
                      className={styles.quantityBtn}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className={styles.subtotalSection}>
                  <span className={styles.subtotalLabel}>Subtotal:</span>
                  <span className={styles.subtotalValue}>
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                </div>

                <button 
                  onClick={addToCart}
                  className={styles.addToCartBtn}
                >
                  Add to Cart
                </button>
              </div>
            )}

            {product.notFound && (
              <Link href="/scanner">
                <button className={styles.backToScannerBtn}>
                  Scan Another Product
                </button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
