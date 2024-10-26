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
  isDisabled: boolean
}

export default function PaymentMethods() {
  const router = useRouter()
  const [openInputId, setOpenInputId] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [paymentAddress, setPaymentAddress] = useState('')
  const [isAddressValid, setIsAddressValid] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [buttonText, setButtonText] = useState('Continue')
  const [connectButtonText, setConnectButtonText] = useState('Connect Payment Address')
  const [isConnecting, setIsConnecting] = useState(false)

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'binance',
      name: 'Binance',
      image: 'https://i.imgur.com/iM5K2ey.jpg',
      displayText: 'Binance',
      isConnected: false,
      isDisabled: false,
      placeholder: 'Enter Binance address'
    },
    {
      id: 'kucoin',
      name: 'KuCoin',
      image: 'https://i.imgur.com/jfjFkeA.jpg',
      displayText: 'KuCoin',
      isConnected: false,
      isDisabled: false,
      placeholder: 'Enter KuCoin address'
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      image: 'https://i.imgur.com/fZI0OD2.jpg',
      displayText: 'Trust Wallet',
      isConnected: false,
      isDisabled: false,
      placeholder: 'Enter Trust Wallet address'
    },
    {
      id: 'upi',
      name: 'UPI',
      image: 'https://i.imgur.com/FK31xFx.jpg',
      displayText: 'UPI',
      isConnected: false,
      isDisabled: false,
      placeholder: 'Enter UPI address'
    }
  ])

  useEffect(() => {
    checkExistingPayment()
  }, [])

  const checkExistingPayment = async () => {
    try {
      // Get telegramId from wherever you store it (localStorage, context, etc)
      const telegramId = Number(localStorage.getItem('telegramId'))
      
      if (!telegramId) return

      const response = await fetch(`/api/user/payment?telegramId=${telegramId}`)
      const data = await response.json()

      if (data.user?.paymentMethod) {
        setIsSaved(true)
        setButtonText('Next Step')
        setConnectButtonText('Disconnect Payment Address')
        setSelectedMethod(data.user.paymentMethod)
        setPaymentAddress(data.user.paymentAddress || '')

        // Update payment methods state
        setPaymentMethods(prevMethods => 
          prevMethods.map(method => ({
            ...method,
            isConnected: method.id === data.user.paymentMethod,
            isDisabled: method.id !== data.user.paymentMethod
          }))
        )
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    }
  }

  const toggleInput = (id: string) => {
    if (isConnecting || paymentMethods.find(m => m.id === id)?.isDisabled) return
    setOpenInputId(openInputId === id ? null : id)
    setSelectedMethod(id)
  }

  const handleAddressChange = (address: string) => {
    setPaymentAddress(address)
    setIsAddressValid(address.trim().length > 0)
  }

  const handleConnect = async () => {
    if (!selectedMethod || (!isAddressValid && !isSaved)) return

    try {
      const telegramId = Number(localStorage.getItem('telegramId'))
      
      if (!telegramId) {
        console.error('No telegramId found')
        return
      }

      if (isSaved) {
        // Disconnect
        const response = await fetch('/api/user/payment', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ telegramId })
        })

        if (response.ok) {
          setIsSaved(false)
          setConnectButtonText('Connect Payment Address')
          setButtonText('Continue')
          setPaymentAddress('')
          setSelectedMethod(null)
          setOpenInputId(null)
          
          // Reset all payment methods
          setPaymentMethods(prevMethods => 
            prevMethods.map(method => ({
              ...method,
              isConnected: false,
              isDisabled: false
            }))
          )
        }
      } else {
        // Connect
        setIsConnecting(true)
        const response = await fetch('/api/user/payment', {
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
          setConnectButtonText('Disconnect Payment Address')
          setButtonText('Next Step')
          
          // Update payment methods
          setPaymentMethods(prevMethods => 
            prevMethods.map(method => ({
              ...method,
              isConnected: method.id === selectedMethod,
              isDisabled: method.id !== selectedMethod
            }))
          )
        }
      }
    } catch (error) {
      console.error('Error handling payment connection:', error)
    } finally {
      setIsConnecting(false)
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
                className={`${styles.methodCard} 
                  ${method.isConnected ? styles.connected : ''} 
                  ${method.isDisabled ? styles.disabled : ''}`}
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
          ))}
        </div>

        <div className={styles.connectButton}>
          <button 
            onClick={handleConnect}
            disabled={(!selectedMethod || !isAddressValid) && !isSaved}
            className={(!selectedMethod || !isAddressValid) && !isSaved ? styles.disabled : ''}
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
