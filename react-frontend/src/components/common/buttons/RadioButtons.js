import React, { Component } from 'react'
import { ButtonGroup, Button } from 'reactstrap'
import Style from './Style.module.scss'
import PropTypes from 'prop-types'

export default class RadioButtons extends Component{
    constructor(props){
        super(props)
        this.state = {
            value: null,
        }
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.value !== nextProps.value) {
            // if(!prevState.value || prevState.value === {} && nextProps.defaultValue) return { value: nextProps.defaultValue }
            return { value: nextProps.value }
        }

        return null;
    }
    componentDidMount(){
        // console.log('child componentDidMount ', this.state)
    }
    //아래코드는 사실 없어도 무방하나 value가 빈값이거나 options 가 비어 있으면 rendering을 하지 않도록 함(성능)
    shouldComponentUpdate(nextProps, nextState){
        if(!nextProps.value || !nextProps.options){
            return false
        }
        return true
    }
    onClick = (index) => {

        const { options } = this.props
        const value = options[index]
        this.setState({value})

        // this.setState({ rSelected: rSelected });
        this.props.onClick(value)
    }
    render(){

        if(!this.props.options || this.props.options.length <= 0) return null

        return (
            <div>
                <ButtonGroup size={this.props.size} className={Style.wrap}>
                    {
                        this.props.options && this.props.options.map((item, index)=>{
                            return (
                                <Button
                                    key={'radio_option_'+index}
                                    color={this.props.color}
                                    onClick={() => this.onClick(index)}
                                    active={this.state.value === item}>{item.label}</Button>
                            )
                        })
                    }
                </ButtonGroup>
            </div>
        )
    }
}

RadioButtons.propTypes = {
    options: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    value: PropTypes.object,
    defaultValue: PropTypes.object,
    size: PropTypes.string,
    color: PropTypes.string
}
RadioButtons.defaultProps = {
    options: [],
    value: {},
    size: 'md',
    color: 'info'
}