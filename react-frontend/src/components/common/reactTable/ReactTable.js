import React from 'react'



const Cell = (props) => {

    const getStyle = (props) => {
        let justifyContent = 'center'//기본값
        switch(props.textAlign){
            case 'left':
                justifyContent = 'start'
                break
            case 'right':
                justifyContent = 'right'
                break;
        }

        return {
            display: 'flex',
            justifyContent: justifyContent,     //[가로정렬] start, center, end
            alignItems: 'center',               //[세로정렬] start, center, end
            width: '100%',
            height: props.height ? props.height : '100%'
        }
    }


    return <div style={getStyle(props)}>{props.children}</div>
}




export {
    Cell
}