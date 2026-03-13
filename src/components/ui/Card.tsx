import React from 'react'

interface CardProps {
  children: React.ReactNode
  padding?: 'sm' | 'md' | 'lg'
  border?: boolean
  shadow?: boolean
  hover?: boolean
  className?: string
  onClick?: () => void
  style?: React.CSSProperties
}

export default function Card({ 
  children, 
  padding = 'md', 
  border = false, 
  shadow = true, 
  hover = false,
  className = '',
  onClick,
  style
}: CardProps) {
  const baseClasses = 'bg-white rounded-lg transition-all duration-200'
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6', 
    lg: 'p-8'
  }
  
  const conditionalClasses = [
    shadow ? 'shadow-md' : '',
    border ? 'border border-gray-200' : '',
    hover ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : '',
    onClick ? 'cursor-pointer' : ''
  ].filter(Boolean).join(' ')

  return (
    <div 
      className={`${baseClasses} ${paddingClasses[padding]} ${conditionalClasses} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  )
}
