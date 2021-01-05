import React, { Component } from 'react'
import { Button, Collapse } from 'reactstrap'

import PropTypes from 'prop-types'

const Star = () => <span className='text-danger'>*</span>

export default class Terms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            termsCollapse: false,
            personalInfoCollapse: false,
            data: this.props.data,
            isAllChecked: false
        }

    }

    //전체체크
    onCheckAllBoxChange = (e) => {
        const data = Object.assign([], this.state.data)
        const checked = e.target.checked

        data.map((item)=>{
            item.checked = checked
        })

        this.setState({
            data: data,
            isAllChecked: checked
        })

        this.props.onCheckAll(e)
    }

    //체크박스
    onCheckBoxChange = (index) => {
        const data = Object.assign([], this.state.data)

        const checked = data[index].checked || false
        data[index].checked = !checked

        this.setState({
            data: data
        })

        this.props.onClickCheck(data, index)
    }

    // 약관 전체보기 클릭
    toggle = (index) => {
        const data = Object.assign([], this.state.data)
        const isOpen = data[index].isOpen || false
        data[index].isOpen = !isOpen

        this.setState({
            data: data
        })

    }

    render() {
        const data = this.state.data;
        return (

            <div>
                <div>
                    <input type="checkbox" id='checkAll' name="checkAll" className='mr-2' checked={this.state.isAllChecked} value="checkAll" onChange={this.onCheckAllBoxChange} />
                    <label for='checkAll' className='m-0'>전체 동의{' '}</label>
                </div>
                {
                    data.map(({name, title, content, isOpen, checked}, index)=>{
                        return (
                            <div key={index}>
                                <div className='d-flex align-items-center'>
                                    <input type="checkbox" id={`check_terms_${index}`} name={name} className='mr-2' checked={checked} onChange={this.onCheckBoxChange.bind(this, index)} />
                                    <label for={`check_terms_${index}`} className='m-0'>
                                        {title}{' '}<Star/>
                                    </label>
                                    <Button color="link" size={'sm'} className='ml-auto' onClick={this.toggle.bind(this, index)}>전체보기</Button>
                                </div>

                                <Collapse isOpen={isOpen} className={'mb-3'}>
                                    <div className='small' style={{maxHeight: 300, overflow: 'auto'}}>{content}</div>
                                </Collapse>


                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

Terms.propTypes = {
    data: PropTypes.array.isRequired
}
Terms.defaultProps = {

}