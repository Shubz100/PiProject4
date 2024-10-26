'use client'

import { useState } from 'react'
import Image from 'next/image'
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
  const [openInputId, setOpenInputId] = useState<string | null>(null)

  const paymentMethods: PaymentMethod[] = [
  {
    id: 'binance',
    name: 'Binance',
    image: 'https://i.imgur.com/iM5K2ey.jpg', // Update the image path
    displayText: 'Binance',
    isConnected: false,
    placeholder: 'Enter Binance address'
  },
  {
    id: 'kucoin',
    name: 'KuCoin',
    image: 'https://i.imgur.com/jfjFkeA.jpg', // Update the image path
    displayText: 'KuCoin',
    isConnected: false,
    placeholder: 'Enter KuCoin address'
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    image: 'https://i.imgur.com/fZI0OD2.jpg', // Update the image path
    displayText: 'Trust Wallet',
    isConnected: false,
    placeholder: 'Enter Trust Wallet address'
  },
  {
    id: 'upi',
    name: 'UPI',
    image: 'https://i.imgur.com/FK31xFx.jpg', // Update the image path
    displayText: 'UPI',
    isConnected: false,
    placeholder: 'Enter UPI address'
  }
]
  const toggleInput = (id: string) => {
    setOpenInputId(openInputId === id ? null : id)
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
                <span className={`${
                  styles.connectedStatus} ${method.isConnected ? styles.connected : styles.notConnected}`}>
                  {method.isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              
              {openInputId === method.id && (
                <div className={styles.inputContainer}>
                  <input 
                    type="text" 
                    placeholder={method.placeholder}
                    className={styles.addressInput}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.connectButton}>
          <button>Connect Payment Address</button>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelButton}>Cancel</button>
        <button className={styles.continueButton}>Continue</button>
      </div>
    </div>
  )
}
