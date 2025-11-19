import { type IconName } from 'lucide-react/dynamic'
import React from 'react'

type LucideIconProps = {
  name: IconName
  size?: number
} & React.SVGProps<SVGSVGElement>

export const LucideIcon = ({ name, size = 24, ...props }: LucideIconProps) => (
  <svg width={size} height={size} {...props} data-testid='lucide-icon-prod'>
    <use href={`/icons.svg#${name}`} />
  </svg>
)
