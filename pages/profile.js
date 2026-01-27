import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Profile.module.css'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedEmail, setEditedEmail] = useState('')

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setEditedName(parsedUser.name)
    setEditedEmail(parsedUser.email)
  }, [router])

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user')
      localStorage.removeItem('authToken')
      localStorage.removeItem('cart')
      router.push('/login')
    }
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
          ← Back
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
                    onChange={(e) => setEditedEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div className={styles.formActions}>
                  <button 
                    onClick={handleSaveProfile}
                    className={styles.saveButton}
                  >
                    💾 Save Changes
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

          <div className={styles.actionsSection}>
            <Link href="/cart" className={styles.actionButton}>
              🛒 View Cart
            </Link>
            <button 
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
