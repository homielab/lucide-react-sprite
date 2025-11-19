import React from 'react'

type CustomIconProps = {
  name: string
  size?: number
  color?: string
} & React.SVGProps<SVGSVGElement>

export const CustomIcon = ({ name, size = 24, color = 'currentColor', ...props }: CustomIconProps) => (
  <svg width={size} height={size} color={color} {...props} data-testid='custom-icon-prod'>
    <use href={`/icons.svg#extend-${name}`} />
  </svg>
)
