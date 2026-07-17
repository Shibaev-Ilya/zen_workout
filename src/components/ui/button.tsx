import * as React from 'react'
import styles from './button.module.scss'

type ButtonVariant = 'default' | 'ghost' | 'outline' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantMap: Record<ButtonVariant, string> = {
  default: styles.default,
  ghost: styles.ghost,
  outline: styles.outline,
  destructive: styles.destructive,
};

const sizeMap: Record<ButtonSize, string> = {
  default: styles.defaultSize,
  sm: styles.sm,
  lg: styles.lg,
  icon: styles.icon,
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button className={`${styles.base} ${variantMap[variant]} ${sizeMap[size]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
