import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    // Check if user is logged in (but don't redirect)
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      if (user.isLoggedIn === true) {
        setUserName(user.name?.split(' ')[0] || 'there')
      }
    }

    // Scroll listener to detect active section
    const handleScroll = () => {
      const sections = ['hero', 'about', 'features', 'cta']
      const scrollPosition = window.scrollY + window.innerHeight / 2

      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i]
        const element = document.getElementById(sectionId)
        if (element) {
          const rect = element.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY
          
          if (scrollPosition >= elementTop) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [router])

  const handleStartShopping = (e) => {
    e.preventDefault()
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    
    const user = JSON.parse(userData)
    if (user.isLoggedIn === false) {
      router.push('/login')
      return
    }
    
    // User is logged in, go to scanner
    router.push('/scanner')
  }

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>CounterJob - Fast Queue, No Wait</title>
        <meta name="description" content="Skip the long queues at the counter. Self-scan, self-checkout, and breeze through your shopping." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <span className={styles.logoText}>CounterJob</span>
            <span className={styles.logoBadge}>FAST</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero') }}>HOME</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about') }}>ABOUT</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features') }}>FEATURES</a>
            <a href="#cta" onClick={(e) => { e.preventDefault(); scrollToSection('cta') }} className={styles.contactsLink}>SCAN</a>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Hero Section */}
        <section id="hero" className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroPattern}></div>
            <h1 className={styles.heroTitle}>
              <span className={styles.theText}>the</span>
              <span className={styles.bestText}>best</span>
              <span className={styles.solutionsText}>solutions.</span>
            </h1>
            <div className={styles.heroUnderline}></div>
            <p className={styles.heroTagline}>Fresh Ideas for Your Business</p>
            <div className={styles.scrollDown}>
              <div className={styles.scrollIcon}>↓</div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className={styles.aboutSection}>
          <div className={styles.aboutContent}>
            <div className={styles.aboutImage}>
              <div className={styles.imagePlaceholder}>🛒</div>
            </div>
            <div className={styles.aboutText}>
              <div className={styles.aboutLabel}>ABOUT US</div>
              <h2 className={styles.aboutTitle}>
                What We <span className={styles.doText}>Do</span>
              </h2>
              <div className={styles.aboutUnderline}></div>
              <p className={styles.aboutDescription}>
                With CounterJob, you can scan products yourself, manage your cart in real-time, and complete your purchase - all from your phone. No more standing in endless queues. Just scan, pay, and go!
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={styles.featuresSection}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📱</div>
              <h3>Scan Products</h3>
              <p>Use your phone's camera to scan product barcodes as you shop.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🛒</div>
              <h3>Review Cart</h3>
              <p>Check items and adjust quantities in real-time.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💳</div>
              <h3>Quick Checkout</h3>
              <p>Complete purchase instantly and skip the line.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>The future is fast and convenient.</h2>
            <p>Experience seamless shopping with our self-checkout system</p>
            <button onClick={handleStartShopping} className={styles.ctaButton}>Start Shopping Now</button>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>CounterJob © 2026 - Making Shopping Faster, One Scan at a Time</p>
      </footer>
    </div>
  )
}
