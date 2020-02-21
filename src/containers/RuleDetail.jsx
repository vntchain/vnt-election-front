import React from 'react'
import CommonPadding from 'component/layout/CommonPadding'
import MarkdownConverter from 'component/ruleDetail/MdConverter'

export default function RuleDetail() {
  return (
    <CommonPadding>
      <MarkdownConverter />
    </CommonPadding>
  )
}
