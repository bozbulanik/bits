import React, { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

const inputVariants = cva('flex-1 w-full focus:outline-none bg-transparent disabled:cursor-not-allowed disabled:opacity-50 p-1', {
  variants: {
    variant: {
      default: 'placeholder:text-text-input-placeholder',
      ghost: 'placeholder:text-text-input-placeholder',
      error: 'placeholder:text-text-error dark:placeholder:text-text-error-dark',
      ghostError: 'placeholder:text-text-error dark:placeholder:text-text-error-dark'
    },
    inputSize: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-md',
      lg: 'text-lg'
    },
    fieldSizing: {
      fixed: 'field-sizing-fixed',
      content: 'field-sizing-content '
    }
  },
  defaultVariants: {
    variant: 'default',
    inputSize: 'sm'
  }
})

const wrapperVariants = cva('flex items-center rounded-md', {
  variants: {
    variant: {
      default:
        'h-7 bg-input-bg dark:bg-input-bg-dark border border-input-border dark:border-input-border-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark hover:border-input-border-hover dark:hover:border-input-border-hover-dark',
      ghost: '',
      error:
        'h-7 placeholder:text-white bg-input-bg dark:bg-input-bg-dark hover:bg-input-bg-error-hover dark:hover:bg-input-bg-error-hover-dark border border-input-border-error dark:border-input-border-error-dark hover:border-input-border-error-hover dark:hover:border-input-border-error-hover-dark',
      ghostError:
        'placeholder:text-white bg-input-bg-error dark:bg-input-bg-error-dark hover:bg-input-bg-error-hover dark:hover:bg-input-bg-error-hover-dark'
    },
    inputSize: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-md',
      lg: 'text-lg'
    }
  },
  defaultVariants: {
    variant: 'default',
    inputSize: 'md'
  }
})

export interface InputProps extends ComponentProps<'input'>, VariantProps<typeof inputVariants> {
  leftSection?: React.ReactNode
  rightSection?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, fieldSizing, leftSection, rightSection, ...props }, ref) => {
    return (
      <div className={cn(wrapperVariants({ variant, inputSize }), className)}>
        {leftSection && leftSection}
        <input spellCheck={false} ref={ref} className={cn(inputVariants({ variant, inputSize, fieldSizing }))} {...props} />
        {rightSection && rightSection}
      </div>
    )
  }
)

export default Input
