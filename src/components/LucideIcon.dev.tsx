import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import React from 'react'

type LucideIconProps = {
  name: IconName
  size?: number
} & React.SVGProps<SVGSVGElement>

export const LucideIcon = ({ name, ...props }: LucideIconProps) => {
  return <DynamicIcon name={name} {...props} />
}
