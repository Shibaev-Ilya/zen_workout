import * as React from 'react'
import styles from './card.module.scss'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass';
}

const variantMap: Record<string, string> = {
  default: styles.default,
  glass: styles.glass,
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.card} ${variantMap[variant]} ${className}`}
        {...props}
      />
    )
  },
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`${styles.header} ${className}`} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`${styles.content} ${className}`} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardContent }
