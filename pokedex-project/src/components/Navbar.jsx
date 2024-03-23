import {Link} from 'react-router-dom'

function Navbar() {
    return (
        <nav style={{display:'inline-flex', position:'fixed', top:'0', right:'0'}}>
<div style={{margin:'20px'}}><Link to='/'>Home</Link></div>
<div style={{margin:'20px'}}><Link to='/pokedex'>Pokedex</Link></div>
<div style={{margin:'20px'}}><Link to='/teamBuilder'>TeamBuilder</Link></div>


        </nav>
    )
}

export default Navbar