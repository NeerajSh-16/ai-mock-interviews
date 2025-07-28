"use client"; // Required for useEffect and hooks

import Link from 'next/link'
import Image from 'next/image'
import React, { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/client'

const RootLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/sign-in") // redirect to sign-in if not logged in
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return <div className="text-center p-10">Loading...</div>
  }

  return (
    <div className="root-layout">
      <nav>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
          <h2 className="text-primary-100">PrepWise</h2>
        </Link>
      </nav>

      {children}
    </div>
  )
}

export default RootLayout
