'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from './PaymentMethods.module.css'

interface PaymentMethod {
  id: string
  name: string
  image: string
  displayText: string
  isConnected: boolean
  placeholder: string
}

export default function PaymentMethods() {
  const router = useRouter()
  const [openInputId, setOpenInputId] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [paymentAddress, setPaymentAddress] = useState('')
  const [isAddressValid, setIsAddressValid] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [buttonText, setButtonText] = useState('Continue')

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'binance',
      name: 'Binance',
      image: 'https://i.imgur.com/iM5K2ey.jpg',
      displayText: 'Binance',
      isConnected: false,
      placeholder: 'Enter Binance address'
    },
    {
      id: 'kucoin',
      name: 'KuCoin',
      image: 'https://i.imgur.com/jfjFkeA.jpg',
      displayText: 'KuCoin',
      isConnected: false,
      placeholder: 'Enter KuCoin address'
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      image: 'https://i.imgur.com/fZI0OD2.jpg',
      displayText: 'Trust Wallet',
      isConnected: false,
      placeholder: 'Enter Trust Wallet address'
    },
    {
      id: 'upi',
      name: 'UPI',
      image: 'https://i.imgur.com/FK31xFx.jpg',
      displayText: 'UPI',
      isConnected: false,
      placeholder: 'Enter UPI address'
    }
  ]

  useEffect(() => {
    const checkExistingPayment = async () => {
      try {
        // Assuming you store telegramId in localStorage or similar
        const telegramId = localStorage.getItem('telegramId')
        if (!telegramId) return

        const response = await fetch(`/api/user?telegramId=${telegramId}`)
        const userData = await response.json()
        
        if (userData.paymentMethod) {
          setIsSaved(true)
          setButtonText('Next Step')
          // Find and mark the connected payment method
          const method = paymentMethods.find(m => m.id === userData.paymentMethod)
          if (method) {
            method.isConnected = true
            setSelectedMethod(method.id)
            setPaymentAddress(userData.paymentAddress || '')
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }

    checkExistingPayment()
  }, [])

  const handleAddressChange = (address: string) => {
    setPaymentAddress(address)
    // Add your address validation logic here
    setIsAddressValid(address.trim().length > 0)
  }

  const handleConnect = async () => {
    if (!selectedMethod || !isAddressValid) return

    try {
      const telegramId = localStorage.getItem('telegramId')
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId,
          paymentMethod: selectedMethod,
          paymentAddress: paymentAddress
        }),
      })

      if (response.ok) {
        setIsSaved(true)
        setButtonText('Next Step')
        // Update the connected status of the selected method
        const updatedMethods = paymentMethods.map(method => ({
          ...method,
          isConnected: method.id === selectedMethod
        }))
        paymentMethods.splice(0, paymentMethods.length, ...updatedMethods)
      }
    } catch (error) {
      console.error('Error saving payment method:', error)
    }
  }

  const handleContinue = () => {
    if (isSaved) {
      router.push('/verify')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <i className="fas fa-arrow-left"></i>
          <h1>Payment Methods</h1>
        </div>
        
        <div className={styles.methodsList}>
          {paymentMethods.map((method) => (
            <div key={method.id}>
              <div 
                className={styles.methodCard}
                onClick={() => toggleInput(method.id)}
              >
                <div className={styles.methodInfo}>
                  <Image
                    src={method.image}
                    alt={`${method.name} logo`}
                    width={40}
                    height={40}
                    className={styles.methodLogo}
                  />
                  <span className={styles.methodName}>{method.displayText}</span>
                </div>
                <span className={`${styles.connectedStatus} ${method.isConnected ? styles.connected : styles.notConnected}`}>
                  {method.isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              
              {openInputId === method.id && (
                <div className={styles.inputContainer}>
                  <input 
                    type="text" 
                    placeholder={method.placeholder}
                    className={styles.addressInput}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    value={paymentAddress}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.connectButton}>
          <button 
            onClick={handleConnect}
            disabled={!selectedMethod || !isAddressValid}
            className={(!selectedMethod || !isAddressValid) ? styles.disabled : ''}
          >
            Connect Payment Address
          </button>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelButton}>Cancel</button>
        <button 
          className={`${styles.continueButton} ${!isSaved ? styles.disabled : ''}`}
          onClick={handleContinue}
          disabled={!isSaved}
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}
