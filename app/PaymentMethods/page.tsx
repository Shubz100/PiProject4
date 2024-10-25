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
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedMethod, setConnectedMethod] = useState<string | null>(null)
  const [connectButtonText, setConnectButtonText] = useState('Connect Payment Address')

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
        const telegramId = localStorage.getItem('telegramId')
        if (!telegramId) return

        const response = await fetch(`/api/user?telegramId=${telegramId}`)
        const userData = await response.json()
        
        if (userData.paymentMethod) {
          setIsSaved(true)
          setButtonText('Next Step')
          setConnectedMethod(userData.paymentMethod)
          setSelectedMethod(userData.paymentMethod)
          setPaymentAddress(userData.paymentAddress || '')
          setConnectButtonText('Disconnect Payment Address')
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }

    checkExistingPayment()
  }, [])

  const handleAddressChange = (address: string) => {
    setPaymentAddress(address)
    setIsAddressValid(address.trim().length > 0)
  }

  const handleConnect = async () => {
    if (connectButtonText === 'Disconnect Payment Address') {
      await handleDisconnect()
      return
    }

    if (!selectedMethod || !isAddressValid) return

    setIsConnecting(true)
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
        setConnectedMethod(selectedMethod)
        setConnectButtonText('Disconnect Payment Address')
        setOpenInputId(null) // Close all dropdowns
      }
    } catch (error) {
      console.error('Error saving payment method:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      const telegramId = localStorage.getItem('telegramId')
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId,
          paymentMethod: null,
          paymentAddress: null
        }),
      })

      if (response.ok) {
        setIsSaved(false)
        setButtonText('Continue')
        setConnectedMethod(null)
        setSelectedMethod(null)
        setPaymentAddress('')
        setConnectButtonText('Connect Payment Address')
        setOpenInputId(null)
      }
    } catch (error) {
      console.error('Error disconnecting payment method:', error)
    }
  }

  const toggleInput = (id: string) => {
    if (isConnecting || connectedMethod) return // Prevent toggling if connecting or already connected
    setOpenInputId(openInputId === id ? null : id)
    setSelectedMethod(id)
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
          {paymentMethods.map((method) => {
            const isMethodConnected = method.id === connectedMethod
            const isDisabled = connectedMethod && !isMethodConnected

            return (
              <div key={method.id}>
                <div 
                  className={`${styles.methodCard} 
                    ${isMethodConnected ? styles.connectedCard : ''} 
                    ${isDisabled ? styles.disabledCard : ''}`}
                  onClick={() => !isDisabled && toggleInput(method.id)}
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
                  <span className={`${styles.connectedStatus} 
                    ${isMethodConnected ? styles.connected : styles.notConnected}`}>
                    {isMethodConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                
                {openInputId === method.id && !isConnecting && (
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
            )
          })}
        </div>

        <div className={styles.connectButton}>
          <button 
            onClick={handleConnect}
            disabled={connectButtonText === 'Connect Payment Address' && (!selectedMethod || !isAddressValid)}
            className={connectButtonText === 'Disconnect Payment Address' ? styles.disconnectButton : ''}
          >
            {connectButtonText}
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
