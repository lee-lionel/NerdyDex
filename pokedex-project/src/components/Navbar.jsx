import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
    const linkClass = ({ isActive }) =>
        isActive ? 'nav-link nav-link-active' : 'nav-link'

    return (
        <nav className='navbar'>
            <div className='navbar-inner'>
                <NavLink to='/' className='navbar-brand'>
                    <span className='navbar-brand-mark' aria-hidden='true' />
                    NerdyDex
                </NavLink>
                <div className='nav-links'>
                    <NavLink to='/' className={linkClass} end>Home</NavLink>
                    <NavLink to='/pokedex' className={linkClass}>Pokedex</NavLink>
                    <NavLink to='/teamBuilder' className={linkClass}>TeamBuilder</NavLink>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
