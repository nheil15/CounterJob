import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Profile.module.css'
import { getUserTransactions } from '../lib/firestore'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedEmail, setEditedEmail] = useState('')
  const [transactions, setTransactions] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

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
      setUser(parsedUser)
      setEditedName(parsedUser.name)
      setEditedEmail(parsedUser.email)

      // Load user's transactions from Firestore
      try {
        const userTransactions = await getUserTransactions(parsedUser.email)
        setTransactions(userTransactions)
      } catch (error) {
        console.error('Error loading transactions:', error)
        // Fallback to localStorage
        const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]')
        const userTransactions = allTransactions.filter(t => t.user?.email === parsedUser.email)
        userTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
        setTransactions(userTransactions)
      }
    }
    
    loadData()
  }, [router])

  const handleLogout = () => {
    setShowLogoutDialog(true)
  }

  const confirmLogout = () => {
    setShowLogoutDialog(false)
    // Keep user profile data but mark as logged out
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      parsedUser.isLoggedIn = false
      localStorage.setItem('user', JSON.stringify(parsedUser))
    }
    localStorage.removeItem('authToken')
    localStorage.removeItem('cart')
    router.push('/login')
  }

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name: editedName,
      email: editedEmail,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(editedName)}&background=4285f4&color=fff&bold=true`,
      updatedAt: new Date().toISOString()
    }

    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedName(user.name)
    setEditedEmail(user.email)
    setIsEditing(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Profile - CounterJob</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <header className={styles.header}>
        <Link href="/scanner" className={styles.backLink}>
          ←
        </Link>
        <h1>My Profile</h1>
        <div className={styles.headerSpace}></div>
      </header>

      <main className={styles.main}>
        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <img 
              src={user.picture} 
              alt={user.name}
              className={styles.avatar}
            />
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className={styles.editButton}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          <div className={styles.profileInfo}>
            {!isEditing ? (
              <>
                <div className={styles.infoSection}>
                  <h2 className={styles.userName}>{user.name}</h2>
                  <p className={styles.userEmail}>{user.email}</p>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Account Type</span>
                    <span className={styles.detailValue}>
                      {user.email.includes('gmail.com') ? 'Gmail' : 'Google Workspace'}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Member Since</span>
                    <span className={styles.detailValue}>
                      {formatDate(user.loggedInAt)}
                    </span>
                  </div>

                  {user.updatedAt && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Last Updated</span>
                      <span className={styles.detailValue}>
                        {formatDate(user.updatedAt)}
                      </span>
                    </div>
                  )}

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Status</span>
                    <span className={styles.statusBadge}>
                      ✓ Active
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.editForm}>
                <h3>Edit Profile</h3>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={editedEmail}
                    placeholder="Enter your email"
                    readOnly
                    disabled
                    className={styles.disabledInput}
                  />
                </div>

                <div className={styles.formActions}>
                  <button 
                    onClick={handleSaveProfile}
                    className={styles.saveButton}
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History Section */}
        <div className={styles.transactionsSection}>
          <div className={styles.historyHeader}>
            <h2 className={styles.sectionTitle}>
              Purchase History
              {transactions.length > 0 && (
                <span className={styles.transactionCount}>{transactions.length}</span>
              )}
            </h2>

            {transactions.length > 0 && (
              <div 
                className={styles.viewAllLink}
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Hide All →' : 'View All →'}
              </div>
            )}
          </div>
          
          {showHistory && (
            <>
              {transactions.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No transactions yet</p>
                  <Link href="/scanner" className={styles.startShoppingLink}>
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className={styles.transactionsList}>
                  {transactions.map((transaction) => (
                    <Link
                      key={transaction.id}
                      href={`/receipt/${transaction.barcode}`}
                      className={styles.transactionCard}
                    >
                      <div className={styles.transactionHeader}>
                        <span className={styles.transactionId}>
                          {transaction.barcode.replace('TXN', '')}
                        </span>
                        <span className={styles.transactionTotal}>
                          Php{transaction.total.toFixed(2)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions Section */}
        <div className={styles.actionsSection}>
          <Link href="/cart" className={styles.actionButton}>
            View Cart
          </Link>
          <button 
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </main>

      {/* Custom Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialogBox}>
            <h3 className={styles.dialogTitle}>Logout Confirmation</h3>
            <p className={styles.dialogMessage}>
              Are you sure you want to logout?
            </p>
            <div className={styles.dialogActions}>
              <button 
                className={styles.dialogCancel}
                onClick={() => setShowLogoutDialog(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.dialogConfirm}
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
