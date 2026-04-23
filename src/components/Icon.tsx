import type { SVGProps } from 'react'

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const make = (path: React.ReactNode) => (props: IconProps) => {
  const { size = 16, ...rest } = props
  return (
    <svg width={size} height={size} {...base} {...rest}>
      {path}
    </svg>
  )
}

export const IconParagraph = make(
  <>
    <path d="M5 5h14" />
    <path d="M5 10h14" />
    <path d="M5 15h10" />
  </>,
)
export const IconHeading = make(
  <>
    <path d="M5 4v16" />
    <path d="M19 4v16" />
    <path d="M5 12h14" />
  </>,
)
export const IconSubheading = make(
  <>
    <path d="M5 6v12" />
    <path d="M17 6v12" />
    <path d="M5 12h12" />
  </>,
)
export const IconQuote = make(
  <>
    <path d="M7 7h4v4c0 2-1 3-3 3" />
    <path d="M15 7h4v4c0 2-1 3-3 3" />
  </>,
)
export const IconImage = make(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="M21 16l-5-5-9 9" />
  </>,
)
export const IconDivider = make(
  <>
    <path d="M4 12h16" />
  </>,
)
export const IconUp = make(<path d="M6 14l6-6 6 6" />)
export const IconDown = make(<path d="M6 10l6 6 6-6" />)
export const IconTrash = make(
  <>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
    <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
  </>,
)
export const IconPlus = make(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
)
export const IconExport = make(
  <>
    <path d="M12 4v12" />
    <path d="M7 9l5-5 5 5" />
    <path d="M5 20h14" />
  </>,
)
export const IconSave = make(
  <>
    <path d="M5 4h11l3 3v13a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
    <path d="M7 4v6h8V4" />
    <path d="M7 14h10v6H7z" />
  </>,
)
export const IconOpen = make(
  <>
    <path d="M3 7h6l2 2h10v9a2 2 0 01-2 2H3z" />
  </>,
)
export const IconReset = make(
  <>
    <path d="M3 12a9 9 0 1015-6.7" />
    <path d="M19 3v5h-5" />
  </>,
)
export const IconUpload = make(
  <>
    <path d="M12 16V4" />
    <path d="M7 9l5-5 5 5" />
    <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
  </>,
)
export const IconDrag = make(
  <>
    <circle cx="9" cy="6" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="6" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="18" r="1" />
  </>,
)
