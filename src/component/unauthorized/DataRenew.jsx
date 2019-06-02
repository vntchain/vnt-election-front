import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import PageProvider from 'containers/PageProvider'
import DataProvider from 'containers/DataProvider'
import NodeList from 'component/unauthorized/NodeList'

import { pollingInterval, pageSize } from 'constants/config'
import apis from 'constants/apis'
import r from 'constants/routes'

import { getBasePath, getBaseParams } from 'utils/tools'

const mapStateToProps = ({ pageIndex: { nodePageIndex } }) => {
  return {
    nodePageIndex
  }
}

function DataRenew(props) {
  const { locationIndex, filterParam, nodePageIndex: reduxPageIndex } = props
  const currentIndex = locationIndex || reduxPageIndex
  // console.log(props,currentIndex) //eslint-disable-line
  return (
    <DataProvider
      options={{
        path: `${apis.nodes}?${getBaseParams(currentIndex, pageSize)}`,
        ns: 'nodes',
        field: 'nodes',
        polling: pollingInterval
      }}
      render={data => (
        <PageProvider
          comp={NodeList}
          options={{
            basePath: `${getBasePath(apis.nodes, pageSize)}`, // '/nodes?limit=40'
            ns: 'nodes',
            field: 'nodes'
          }}
          refreshProof={true}
          redirectBase={r.unauthorized}
          context={data}
          currentIndex={currentIndex}
          filterParam={filterParam}
        />
      )}
    />
  )
}

DataRenew.propTypes = {
  options: PropTypes.shape({
    path: PropTypes.string.isRequired, // 请求接口地址
    ns: PropTypes.string.isRequired, // 要更新的 model 的名称
    field: PropTypes.string.isRequired, // 要更新的字段
    polling: PropTypes.number // 轮询间隔，单位毫秒
  })
}

export default connect(mapStateToProps)(DataRenew)
