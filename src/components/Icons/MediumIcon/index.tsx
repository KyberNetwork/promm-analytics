import React from 'react'

const MediumIcon = ({ width, height, color }: { width?: number; height?: number; color?: string }): JSX.Element => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width || 14} height={height || 12} viewBox="0 0 14 12">
      <g fill="none" fillRule="evenodd">
        <g>
          <g>
            <g>
              <g>
                <g stroke={color || '#fff'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.8">
                  <path
                    d="M2.053 8.32L2.053 2.973M8.975 1.863v7.073l-.77 1.539v.192h4.616v-.193l-1.154-1.538V2.473l1.146-1.059h.004v-.77h.004H9.34L6.333 10.668h-.628L2.517 3.58c-.077-.17-.184-.324-.316-.456L.513 1.436v-.77h3.839L7.329 7.35M.513 10.474L.513 10.667 3.59 10.667 3.59 10.474 2.051 8.322z"
                    transform="translate(-88 -971) translate(28 800) translate(0 169) translate(59) translate(1.333 2)"
                  />
                </g>
                <path
                  d="M0 0L16 0 16 16 0 16z"
                  transform="translate(-88 -971) translate(28 800) translate(0 169) translate(59)"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

export default MediumIcon
