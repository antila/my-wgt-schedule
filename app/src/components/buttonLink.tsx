import Link from 'next/link'

interface ButtonLinkProps {
  href?: string
  className?: string
  noBg?: boolean
  target?: string
  children: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}
export const ButtonLink = ({ children, href, className, onClick, noBg, target }: ButtonLinkProps): JSX.Element => {
  let bg = 'border-zinc-800 bg-neutral-900'
  if (noBg) {
    bg = ''
  }
  return (
    <Link
      target={target}
      onClick={onClick}
      className={`inline-block mb-3 mr-3 py-1 px-2 rounded-md border border-solid ${bg} ${className}`}
      href={href || '#'}
    >
      {children}
    </Link>
  )
}
