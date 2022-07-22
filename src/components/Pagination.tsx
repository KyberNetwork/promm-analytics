import { PageButtons, Arrow } from 'components/shared'
import React from 'react'
import { TYPE } from 'theme'
export default function Pagination({
  setPage,
  page,
  maxPage,
  padding = 0,
}: {
  page: number
  setPage: (val: number) => void
  maxPage: number
  padding?: number | string
}): JSX.Element {
  return (
    <PageButtons style={{ padding }}>
      <div
        onClick={() => {
          setPage(page === 1 ? page : page - 1)
        }}
      >
        <Arrow faded={page === 1 ? true : false}>←</Arrow>
      </div>
      <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
      <div
        onClick={() => {
          setPage(page === maxPage ? page : page + 1)
        }}
      >
        <Arrow faded={page === maxPage ? true : false}>→</Arrow>
      </div>
    </PageButtons>
  )
}
