import { VariantProps, cva } from 'class-variance-authority'
import { ComponentProps, forwardRef } from 'react'
import { cn } from '../utils'

const buttonVariants = cva(
  'cursor-pointer rounded-md flex gap-2 items-center justify-center font-semibold p-1.5',
  {
    variants: {
      variant: {
        default:
          'bg-button-bg dark:bg-button-bg-dark border border-button-border dark:border-button-border-dark hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark hover:border-button-border-hover dark:hover:border-button-border-hover-dark',
        icon: 'p-1 bg-button-bg dark:bg-button-bg-dark border border-button-border dark:border-button-border-dark hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark hover:border-button-border-hover dark:hover:border-button-border-hover-dark',

        ghost: 'bg-transparent hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark',
        iconGhost: 'p-1 bg-transparent hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark',

        destructive:
          'bg-button-bg-error dark:bg-button-bg-error-dark hover:bg-button-bg-error-hover dark:hover:bg-button-bg-error-hover-dark border border-button-border-error dark:border-button-border-error-dark hover:border-button-border-error-hover dark:hover:border-button-border-error-hover-dark',
        iconDestructive:
          'p-1 bg-button-bg-error dark:bg-button-bg-error-dark hover:bg-button-bg-error-hover dark:hover:bg-button-bg-error-hover-dark border border-button-border-error dark:border-button-border-error-dark hover:border-button-border-error-hover dark:hover:border-button-border-error-hover-dark',
        iconDestructiveGhost:
          'text-text dark:text-text-dark hover:text-text-error dark:hover:text-text-error-dark p-1 bg-transparent hover:bg-button-bg-error-hover dark:hover:bg-button-bg-error-hover-dark',

        tab: 'bg-transparent border border-transparent hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark ',
        selectedTab:
          'bg-transparent border border-button-border dark:border-button-border-dark hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark hover:border-button-border-hover dark:hover:border-button-border-hover-dark'
      },
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-md',
        lg: 'text-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'xs'
    }
  }
)

interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  children?: React.ReactNode
}

const Button: React.FC<ButtonProps> = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          buttonVariants({ variant, size }),
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
export default Button
