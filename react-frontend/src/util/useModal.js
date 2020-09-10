import React, {useState} from 'react'
export const useModal = (
    initialMode = false,
    initialSelected = null
) =>{
    const [modalOpen, setModalOpen] = useState(initialMode)
    const [selected, setSelected] = useState(initialSelected)
    const setModalState = state => {
        setModalOpen(state)
        if(state === false){
            setSelected(null)
        }
    }
    return [modalOpen, setModalOpen, selected, setSelected, setModalState]
}
