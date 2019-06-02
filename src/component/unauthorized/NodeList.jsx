import React from 'react'
import NodeListTable from 'component/BaseTable'
import { FormattedMessage, injectIntl } from '@translate'

import { Spin } from 'antd'
import styles from 'containers/Common.scss'
import { pageSize } from 'constants/config'

function NodeListUnauthorized(props) {
  const { context, currentIndex, flipPage } = props
  const finishFetching = context && context.hasOwnProperty('data')
  return (
    <div>
      <Spin spinning={context && context.isLoading}>
        <div className={styles.tableWithCount}>
          {finishFetching && (
            <NodeListTable
              columns={columns}
              data={genTableData(context.data, currentIndex)}
              count={context.count + 1}
              currentIndex={currentIndex}
              flipPage={flipPage}
              tableType="list"
            />
          )}
        </div>
      </Spin>
    </div>
  )
}

export default injectIntl(NodeListUnauthorized)

const genTableData = (data, current) => {
  if (!Array.isArray(data) || data.length === 0) {
    return []
  }

  const result = []
  data.forEach((item, i) => {
    result.push({
      key: item.Address + i,
      ranking: {
        ranking: i + 1 + (current - 1) * pageSize,
        isSuper: item.IsSuper
      },
      location: item.City || '',
      home: item.Home || '',
      name: { name: item.Vname, address: item.Address },
      votes: item.Votes,
      percentage: item.VotesPercent + '%',
      status: item.IsAlive,
      currentIndex: current
    })
  })

  if (current == 1) {
    result.splice(19, 0, {
      key: 'text',
      ranking: {
        ranking: <FormattedMessage id="nodeText" />,
        isSuper: false
      },
      location: '',
      home: '',
      name: { name: '', address: '' },
      votes: '',
      percentage: '',
      currentIndex: current
    })
  }
  return result
}

const renderContent = (value, record, index) => {
  const obj = {
    children: value,
    props: {}
  }
  if (record.currentIndex === 1 && index === 19) {
    obj.props.colSpan = 0
  }
  return obj
}

const renderRank = (value, record, index) => {
  if (record.currentIndex === 1 && index === 19) {
    return {
      children: <div style={{ textAlign: 'center' }}>{value.ranking}</div>,
      props: {
        colSpan: 6
      }
    }
  }
  return {
    children: (
      <span style={{ color: value.isSuper ? '#3389ff' : '#ff9603' }}>
        {value.ranking}
      </span>
    ),
    props: {}
  }
}

const renderName = (value, record, index) => {
  if (record.currentIndex === 1 && index === 19) {
    return {
      children: '',
      props: {
        colSpan: 0
      }
    }
  }
  return {
    children: (
      <a href={`//hubscan.vnt.link/account/${value.address}`}>{value.name}</a>
    ),
    props: {}
  }
}

const columns = [
  {
    title: <FormattedMessage id="nodeColumn1" />,
    dataIndex: 'ranking',
    key: 'ranking',
    // eslint-disable-next-line react/display-name
    render: renderRank
  },
  {
    title: <FormattedMessage id="nodeColumn2" />,
    dataIndex: 'name',
    key: 'name',
    // eslint-disable-next-line react/display-name
    render: renderName
  },
  {
    title: <FormattedMessage id="nodeColumn3" />,
    dataIndex: 'location',
    key: 'location',
    render: renderContent
  },
  {
    title: <FormattedMessage id="nodeColumn4" />,
    dataIndex: 'home',
    key: 'home',
    render: renderContent
  },
  {
    title: <FormattedMessage id="nodeColumn5" />,
    dataIndex: 'votes',
    key: 'votes',
    render: renderContent
  },
  {
    title: <FormattedMessage id="nodeColumn6" />,
    dataIndex: 'percentage',
    key: 'percentage',
    render: renderContent
  }
]
