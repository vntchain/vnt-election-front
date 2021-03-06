import React from 'react'
//import { push } from 'react-router-redux'
import BaseTable from 'component/BaseTable'
import { FormattedMessage } from '@translate'

import { Spin } from 'antd'
import { pageSize, pollingInterval } from 'constants/config'
import { connect } from 'react-redux'
import apis from 'constants/apis'
import {
  walletState,
  maximumVoteNum,
  txActions
  //  forbiddenActionTime
} from 'constants/config'
import {
  getBaseParams,
  lessThanOneDay,
  getBasePath,
  formatName
} from 'utils/tools'
import CountDown from 'component/CountDownNewFormat'
import MessageConfirm from 'component/MessageConfirm'

import styles from './NodeList.scss'

const mapStateToProps = ({
  nodes: { nodes },
  auth: { authStatus },
  calculatedDetails: { stake },
  dataRelayNew: { nodeAddrBaseurl },
  intervalManager: { detailVoteTimer }
}) => {
  return {
    nodes,
    authStatus,
    stake,
    nodeAddrBaseurl,
    detailVoteTimer
  }
}

const genTableData = (data, current) => {
  if (!Array.isArray(data) || data.length === 0) {
    return []
  }

  const result = []

  data.forEach((item, i) => {
    result.push({
      key: item.Address,
      ranking: {
        ranking: i + 1 + (current - 1) * pageSize,
        isSuper: item.IsSuper
      },
      location: item.City || '',
      home: item.Home || '',
      name: { name: formatName(item.Vname), address: item.Address },
      votes: item.Votes,
      percentage: item.VotesPercent + '%',
      currentIndex: current, // 当前是第几页
      totalCnt: data.length // 该页原始数据总共有多少条
    })
  })

  if (current == 1) {
    let startIndex = 0
    if (data.length < 19) {
      startIndex = data.length
    } else {
      startIndex = 19
    }
    result.splice(startIndex, 0, {
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
      currentIndex: current,
      totalCnt: data.length
    })
  }
  return result
}

class NodeList extends React.Component {
  constructor(props) {
    super(props)
    this.timerID = null
    this.state = {
      currentPage: 1,
      candidates: {},
      messageDetail: {
        showMessageModal: false,
        id: ''
      }
    }
  }

  getNodesData = () => {
    clearInterval(this.timerID)
    this.props.dispatch({
      type: 'dataRelayNew/fetchData',
      payload: {
        path: `${apis.nodes}?${getBaseParams(
          this.state.currentPage,
          pageSize
        )}`,
        ns: 'nodes',
        field: 'nodes'
      }
    })
    this.timerID = setInterval(() => {
      //console.log('定时去取的nodelist') //eslint-disable-line
      this.props.dispatch({
        type: 'dataRelayNew/fetchData',
        payload: {
          path: `${apis.nodes}?${getBaseParams(
            this.state.currentPage,
            pageSize
          )}`,
          ns: 'nodes',
          field: 'nodes'
        }
      })
    }, pollingInterval * 1000)
  }

  getNewVotesDetail = voteDetail => {
    const { candidates } = voteDetail
    const result = {}
    for (let key of candidates) {
      result[key] = {
        checked: true
      }
    }
    return result
  }

  componentDidMount() {
    this.getNodesData()
    this.setState({
      candidates: this.getNewVotesDetail(this.props.voteDetail)
    })
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.authStatus === walletState.authorized &&
      this.props.voteDetail !== prevProps.voteDetail
    ) {
      //console.log('vote发生变化',prevProps.voteDetail,this.props.voteDetail ) //eslint-disable-line
      this.setState({
        candidates: this.getNewVotesDetail(this.props.voteDetail)
      })
    }
    if (this.props.nodeAddrBaseurl !== prevProps.nodeAddrBaseurl) {
      //console.log('didUpdate 请求数据') //eslint-disable-line
      this.getNodesData()
    }
  }

  componentWillUnmount() {
    if (this.timerID) {
      clearInterval(this.timerID)
    }
  }

  handleFlipPage = p => {
    this.setState({
      currentPage: p
    })
    //this.props.dispatch(push(`${p}`))
    this.props.dispatch({
      type: 'pageIndex/setNodePageIndex',
      payload: p
    })

    this.props.dispatch({
      type: 'dataRelayNew/fetchData',
      payload: {
        path: `${getBasePath(apis.nodes, pageSize)}&offset=${(parseInt(p, 10) -
          1) *
          pageSize}`,
        ns: 'nodes',
        field: 'nodes'
      }
    })
  }

  clickDisabledVoteBtn = (useProxy, lastVoteInOneDay) => {
    if (useProxy) {
      // 弹出modal框，显示的内容是 '正在使用代理，无法投票'
      this.setState({
        messageDetail: {
          showMessageModal: true,
          id: 'voteMessage1'
        }
      })
    } else if (lastVoteInOneDay) {
      // 弹出modal框，显示的内容是 '24h内已经设置代理或者投票，无法投票'
      this.setState({
        messageDetail: {
          showMessageModal: true,
          id: 'modal9'
        }
      })
    }
  }

  clickVoteBtn = (addr, prevCheckedStatus) => {
    let newCandidates = this.state.candidates
    if (
      Object.keys(newCandidates).length === maximumVoteNum &&
      !newCandidates.hasOwnProperty(addr)
    ) {
      // 弹窗提示已经达到最大数量，需要取消后再勾选
      this.setState({
        messageDetail: {
          showMessageModal: true,
          id: 'modal4'
        }
      })
      return
    }
    if (prevCheckedStatus) {
      delete newCandidates[addr]
    } else {
      newCandidates[addr] = {
        useProxy: false,
        checked: true,
        lastVoteInOneDay: false
      }
    }
    this.setState({ candidates: newCandidates })
  }

  clickConfirmVoteBtn = () => {
    // 需要先检查抵押VNT的数量，若数量为0，提示需要抵押VNT后投票
    if (this.props.stake === 0) {
      this.setState({
        messageDetail: {
          showMessageModal: true,
          id: 'modal3'
        }
      })
    } else {
      const selected = Object.keys(this.state.candidates)
      if (selected.length > 0) {
        // 走投票接口
        this.props.dispatch({
          type: 'account/sendTx',
          payload: {
            funcName: txActions.vote,
            needInput: true,
            inputData: [selected]
          },
          callback: () => this.handleTxSuccessResult(txActions.vote, selected)
        })
      } else {
        // 走取消投票接口
        this.props.dispatch({
          type: 'account/sendTx',
          payload: {
            funcName: txActions.cancelVote,
            needInput: false
          },
          callback: () => this.handleTxSuccessResult(txActions.cancelVote)
        })
      }
    }
    // 清掉选中的内容
    // const { candidates } = this.props.voteDetail
    // const result = {}
    // for (let key of candidates) {
    //   result[key] = {
    //     checked: true
    //   }
    // }
    // this.setState({ candidates: result })
  }

  // onCountDownFinish = () => {
  //   console.log('nodelist 倒计时结束')  //eslint-disable-line
  //   this.forceUpdate()
  // }

  cancelMessageModal = () => {
    const newMessageDetail = {
      showMessageModal: false,
      id: ''
    }
    this.setState({ messageDetail: newMessageDetail })
  }

  handleTxSuccessResult = (funcName, selected = []) => {
    switch (funcName) {
      case txActions.vote: {
        const result = {}
        for (let key of selected) {
          result[key] = {
            useProxy: false,
            checked: true,
            lastVoteInOneDay: lessThanOneDay(Date.now())
          }
        }
        this.setState({ candidates: result })
        // 还要修改时间戳
        break
      }
      case txActions.cancelVote: {
        // 取消投票 也是投票
        break
      }
      default:
        console.error('undefined vote actions!') // eslint-disable-line
    }
  }

  render() {
    const nodeList = this.props.nodes
    const finishFetching = nodeList && nodeList.hasOwnProperty('data')

    const renderVoteBtn = (value, record, index) => {
      if (
        record.currentIndex === 1 &&
        (index === 19 || (record.totalCnt === index && record.totalCnt < 19))
      ) {
        return {
          children: '',
          props: {
            colSpan: 0
          }
        }
      }
      let useProxy = this.props.voteDetail.useProxy,
        checked = false,
        lastVoteInOneDay = lessThanOneDay(this.props.voteDetail.lastVoteTime)
      let btnDom, classNames
      if (this.state.candidates.hasOwnProperty(record.key)) {
        //const details = this.state.candidates[record.key]
        //checked = details.checked
        checked = true
      }

      if (useProxy || lastVoteInOneDay) {
        classNames = checked
          ? `${styles['voteBtn']} ${styles['disabled']} ${styles['checked']}`
          : `${styles['voteBtn']} ${styles['disabled']}`
        btnDom = (
          <span
            className={classNames}
            onClick={() =>
              this.clickDisabledVoteBtn(useProxy, lastVoteInOneDay)
            }
          >
            <FormattedMessage id="nodeVoteBtn" />
          </span>
        )
      } else {
        classNames = checked
          ? `${styles['voteBtn']} ${styles['checked']}`
          : `${styles['voteBtn']}`
        btnDom = (
          <button
            className={classNames}
            onClick={() => this.clickVoteBtn(record.key, checked)}
          >
            <FormattedMessage id="nodeVoteBtn" />
          </button>
        )
      }

      return {
        children: btnDom,
        props: {}
      }
    }

    const renderConfirmVoteBtn = voteDetail => {
      // 确认投票按钮的样式
      const { useProxy, candidates, lastVoteTime } = voteDetail
      let confirmVoteBtnDom
      if (lessThanOneDay(lastVoteTime)) {
        confirmVoteBtnDom = (
          <div
            className={`${styles['confirmVoteBtn']} ${styles['countDown']}`}
            onClick={() => this.clickDisabledVoteBtn(false, true)}
          >
            <FormattedMessage id="nodeColumn7" label={true} />
            <CountDown
              time={
                (this.props.detailVoteTimer &&
                  this.props.detailVoteTimer.time) ||
                0
              }
            />
            {/* <CountDown
              time={lastVoteTime}
              onFinish={this.onCountDownFinish}
              totalCountDownTime={forbiddenActionTime}
            /> */}
          </div>
        )
      } else if (useProxy) {
        confirmVoteBtnDom = (
          <div
            className={`${styles['confirmVoteBtn']} ${styles['disabled']}`}
            onClick={() => this.clickDisabledVoteBtn(true, false)}
          >
            <FormattedMessage id="nodeColumn7" label={true} />
            <span>{`(${candidates.length}/${maximumVoteNum})`}</span>
          </div>
        )
      } else {
        confirmVoteBtnDom = (
          <button
            className={`${styles['confirmVoteBtn']}`}
            onClick={this.clickConfirmVoteBtn}
          >
            <FormattedMessage id="nodeColumn7" label={true} />
            <span>{`(${
              Object.keys(this.state.candidates).length
            }/${maximumVoteNum})`}</span>
          </button>
        )
      }
      return confirmVoteBtnDom
    }

    const renderContent = (value, record, index) => {
      const obj = {
        children: value,
        props: {}
      }
      if (
        record.currentIndex === 1 &&
        (index === 19 || (record.totalCnt === index && record.totalCnt < 19))
      ) {
        obj.props.colSpan = 0
      }
      return obj
    }

    const renderRank = (value, record, index) => {
      if (
        record.currentIndex === 1 &&
        (index === 19 || (record.totalCnt === index && record.totalCnt < 19))
      ) {
        return {
          children: <div style={{ textAlign: 'center' }}>{value.ranking}</div>,
          props: {
            colSpan: this.props.authStatus === walletState.authorized ? 7 : 6
          }
        }
      }
      return {
        children: <span style={{ color: '#333' }}>{value.ranking}</span>,
        props: {}
      }
    }

    const renderName = (value, record, index) => {
      if (
        record.currentIndex === 1 &&
        (index === 19 || (record.totalCnt === index && record.totalCnt < 19))
      ) {
        return {
          children: '',
          props: {
            colSpan: 0
          }
        }
      }
      return {
        children: (
          <a
            href={`${this.props.nodeAddrBaseurl}${value.address}`}
            target="__blank"
          >
            {value.name}
          </a>
        ),
        props: {}
      }
    }
    const renderHomePage = (value, record, index) => {
      if (
        record.currentIndex === 1 &&
        (index === 19 || (record.totalCnt === index && record.totalCnt < 19))
      ) {
        return {
          children: '',
          props: {
            colSpan: 0
          }
        }
      }
      let homeUrl = null
      if (value.match(/^(https?:)?\/\//)) {
        homeUrl = value
      } else {
        homeUrl = `//${value}`
      }
      return {
        children: value ? (
          <a href={homeUrl} target="__blank">
            {value}
          </a>
        ) : (
          ''
        ),
        props: {}
      }
    }

    const genColumns = authStatus => {
      const baseColumns = [
        {
          title: <FormattedMessage id="nodeColumn1" />,
          dataIndex: 'ranking',
          key: 'ranking',
          render: renderRank
        },
        {
          title: <FormattedMessage id="nodeColumn2" />,
          dataIndex: 'name',
          key: 'name',
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
          render: renderHomePage
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
      if (authStatus === walletState.authorized) {
        baseColumns.push({
          title: renderConfirmVoteBtn(this.props.voteDetail),
          key: 'voteBtn',
          render: renderVoteBtn,
          align: 'center'
        })
      }
      return baseColumns
    }

    return (
      <div>
        <Spin spinning={nodeList && nodeList.isLoading}>
          <div className={styles.tableWithCount}>
            {finishFetching && (
              <BaseTable
                columns={genColumns(this.props.authStatus)}
                data={genTableData(nodeList.data, this.state.currentPage)}
                count={nodeList.count + 1}
                currentIndex={this.state.currentPage}
                flipPage={this.handleFlipPage}
                tableType="list"
              />
            )}
            <MessageConfirm
              id={this.state.messageDetail.id}
              visible={this.state.messageDetail.showMessageModal}
              onCancel={this.cancelMessageModal}
            />
          </div>
        </Spin>
      </div>
    )
  }
}

export default connect(mapStateToProps)(NodeList)
