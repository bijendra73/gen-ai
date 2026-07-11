import { useEffect } from 'react'
import './toast.scss'

const Toast = ({ message, onClose }) => {
    useEffect(() => {
        if (!message) return
        const timer = setTimeout(onClose, 3500)
        return () => clearTimeout(timer)
    }, [message, onClose])

    if (!message) return null

    return (
        <div className='toast-container'>
            <div className='toast-message'>{message}</div>
        </div>
    )
}

export default Toast
