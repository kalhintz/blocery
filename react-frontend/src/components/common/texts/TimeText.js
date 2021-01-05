import React, { Component } from 'react'
import ComUtil from '../../../util/ComUtil'
import Style from './TimeText.module.scss'
import PropTypes from 'prop-types'
import moment from 'moment'
class TimeText extends Component{
    constructor(props){
        super(props)
        this.state = {}
    }
    componentWillMount(){
        clearInterval(this.state.intervalId);
    }
    componentDidMount(){

        this.timer()

        var intervalId = setInterval(this.timer, 1000);
        // store intervalId in the state so it can be accessed later:
        this.setState({intervalId: intervalId});
    }
    componentWillUnmount(){
        clearInterval(this.state.intervalId);
    }
    timer = () => {
        let future  = moment(this.props.date).format('x');
        const now = moment().format('x');

        let diff;
        if(now < future) {
            diff = ComUtil.getDateDiffTextBetweenNowAndFuture(this.props.date, this.props.formatter)
        }else{
            clearInterval(this.state.intervalId);
            diff = '00:00:00'

            // var m = moment().utcOffset(0);
            // m.set({hour:0,minute:0,second:0,millisecond:0})
            // m.toISOString()
            // diff = m.format('HH:mm:ss') //00:00:00

            //0초 일 경우 콜백실행
            if (this.props.whenTimeFinished){
                this.props.whenTimeFinished()
            }

        }

        diff = ((this.props.displayD)? 'D - ':'') + diff
        this.setState({
            diff: diff
        })
    }

    render(){

        if(!this.props.date) return null

        const {...rest} = this.props

        return(
            <span className={Style.text} {...rest}>{this.state.diff}</span>
        )
    }
}
TimeText.propTypes = {
    date: PropTypes.any.isRequired,
    formatter: PropTypes.string
}
TimeText.defaultProps = {
    formatter: 'DD[일] HH[시] mm[분] ss[초]'
}
export default TimeText