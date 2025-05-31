import * as Icons from 'lucide-react'
import { FC } from 'react'

export function getIconComponent(name: string): FC<{ size?: number; strokeWidth?: number }> {
  const Icon = Icons[name as keyof typeof Icons] as FC<{ size?: number; strokeWidth?: number }>
  return Icon
}

export const getPropertyIcon = (type: string) => {
  switch (type) {
    case 'bit':
      return <Icons.Logs size={16} strokeWidth={1.5} />
    case 'text':
      return <Icons.ALargeSmall size={16} strokeWidth={1.5} />
    case 'document':
      return <Icons.FileText size={16} strokeWidth={1.5} />
    case 'number':
      return <Icons.Hash size={16} strokeWidth={1.5} />
    case 'select':
      return <Icons.Parentheses size={16} strokeWidth={1.5} />
    case 'multiselect':
      return <Icons.Brackets size={16} strokeWidth={1.5} />
    case 'date':
      return <Icons.Calendar1 size={16} strokeWidth={1.5} />
    case 'file':
      return <Icons.File size={16} strokeWidth={1.5} />
    case 'checkbox':
      return <Icons.Check size={16} strokeWidth={1.5} />
    case 'url':
      return <Icons.Link2 size={16} strokeWidth={1.5} />
    case 'email':
      return <Icons.Mail size={16} strokeWidth={1.5} />
    case 'phone':
      return <Icons.Phone size={16} strokeWidth={1.5} />
    case 'image':
      return <Icons.Image size={16} strokeWidth={1.5} />
    case 'currency':
      return <Icons.Currency size={16} strokeWidth={1.5} />
    case 'location':
      return <Icons.MapPin size={16} strokeWidth={1.5} />
    case 'color':
      return <Icons.PaintBucket size={16} strokeWidth={1.5} />
    case 'measurement':
      return <Icons.Ruler size={16} strokeWidth={1.5} />
    case 'rating':
      return <Icons.Star size={16} strokeWidth={1.5} />
    case 'percentage':
      return <Icons.Percent size={16} strokeWidth={1.5} />
    case 'range':
      return <Icons.SlidersHorizontal size={16} strokeWidth={1.5} />
    case 'time':
      return <Icons.Clock size={16} strokeWidth={1.5} />
    case 'datetime':
      return <Icons.CalendarClock size={16} strokeWidth={1.5} />
    case 'language':
      return <Icons.Languages size={16} strokeWidth={1.5} />
    case 'country':
      return <Icons.Earth size={16} strokeWidth={1.5} />
    case 'timezone':
      return <Icons.ClockFading size={16} strokeWidth={1.5} />
    case 'barcode':
      return <Icons.Barcode size={16} strokeWidth={1.5} />
    case 'audio':
      return <Icons.FileAudio size={16} strokeWidth={1.5} />
    case 'planguage':
      return <Icons.Code size={16} strokeWidth={1.5} />
    default:
      return <Icons.Text size={16} strokeWidth={1.5} />
  }
}
