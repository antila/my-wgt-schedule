import { LoaderCircle } from 'lucide-react'
import Link from 'next/link'

export const Spinner = (): JSX.Element => {
  return (
    <div>
      <LoaderCircle className='animate-spin h-10 w-10 mr-1 inline' /> Loading
    </div>
  )
}
