import {
  Brackets,
  Calendar1,
  Check,
  File,
  Hash,
  Link2,
  Logs,
  Mail,
  Parentheses,
  Phone,
  Text,
  ALargeSmall,
  Image
} from 'lucide-react'

import * as Icons from 'lucide-react'
import { FC } from 'react'

export function getIconComponent(name: string): FC<{ size?: number; strokeWidth?: number }> {
  const Icon = Icons[name as keyof typeof Icons] as FC<{ size?: number; strokeWidth?: number }>
  return Icon
}

export const getPropertyIcon = (type: string) => {
  switch (type) {
    case 'bit':
      return <Logs size={14} strokeWidth={1.5} />
    case 'text':
      return <ALargeSmall size={14} strokeWidth={1.5} />
    case 'number':
      return <Hash size={14} strokeWidth={1.5} />
    case 'select':
      return <Parentheses size={14} strokeWidth={1.5} />
    case 'multiselect':
      return <Brackets size={14} strokeWidth={1.5} />
    case 'date':
      return <Calendar1 size={14} strokeWidth={1.5} />
    case 'file':
      return <File size={14} strokeWidth={1.5} />
    case 'checkbox':
      return <Check size={14} strokeWidth={1.5} />
    case 'url':
      return <Link2 size={14} strokeWidth={1.5} />
    case 'email':
      return <Mail size={14} strokeWidth={1.5} />
    case 'phone':
      return <Phone size={14} strokeWidth={1.5} />
    case 'image':
      return <Image size={14} strokeWidth={1.5} />
    default:
      return <Text size={14} strokeWidth={1.5} />
  }
}
