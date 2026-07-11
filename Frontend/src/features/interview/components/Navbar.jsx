import { useContext } from 'react'
import { useNavigate } from 'react-router'
import { AuthContext } from '../../auth/services/auth.context.jsx'

const Navbar = ({ showFeatures = true, showHistory = true, showHome = false }) => {
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)

    const getInitials = (name) => {
        if (!name) return 'U'
        return name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('')
    }

    return (
        <nav className='page-nav'>
            <div className='nav-brand'>InterviewAI</div>
            <div className='nav-right'>
                <div className='nav-links'>
                    {showFeatures && (
                        <button type='button' onClick={() => navigate('/features')}>Features</button>
                    )}
                    {showHome && (
                        <button type='button' onClick={() => navigate('/')}>Home</button>
                    )}
                    {showHistory && (
                        <button type='button' onClick={() => window.dispatchEvent(new CustomEvent('scrollToHistory'))}>History</button>
                    )}
                </div>
                {user ? (
                    <div className='nav-profile'>
                        <div className='nav-avatar'>{getInitials(user.username || user.email)}</div>
                        <span className='nav-user'>{user.username || user.email}</span>
                    </div>
                ) : (
                    <button className='nav-signin' type='button' onClick={() => navigate('/login')}>Sign In</button>
                )}
            </div>
        </nav>
    )
}

export default Navbar
