import React from 'react'
const active = {borderBottom: '3px solid'}


const Categories = (props) => {

    const Item = (name, index) => <div key={'categoryItem'+index} className='cursor-default pt-2 pr-2 pb-1 pl-2 flex-shrink-0' onClick={props.onClick.bind(this, name)} >{name}</div>
    const ActiveItem = (name, index) => <div key={'activeCategoryItem'+index} className='cursor-default pt-2 pr-2 pb-1 pl-2 flex-shrink-0 border-secondary font-weight-bold' style={active} onClick={props.onClick.bind(this, name)}>{name}</div>


    const { data = [], value = '' } = props
    return(
        <div className='d-flex overflow-auto f7 pl-1 pr-1 bg-light'>
            {
                data.map((name, index) => name === value ? ActiveItem(name, index) : Item(name, index))
            }
        </div>
    )
}
export default Categories