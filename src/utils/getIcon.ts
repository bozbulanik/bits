import * as Icons from 'lucide-react'
import { FC } from 'react'

export function getIconComponent(name: string): FC<{ size?: number; strokeWidth?: number }> {
  const Icon = Icons[name as keyof typeof Icons] as FC<{ size?: number; strokeWidth?: number }>
  return Icon
}
