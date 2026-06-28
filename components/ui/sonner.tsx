"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
toastOptions={{
        style: { zIndex: 2500 },
      }}
      {...props}
    />
  )
}

export { Toaster }
