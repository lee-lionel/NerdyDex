import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Pokedex from "./pages/Pokedex";
import TeamBuilder from "./pages/TeamBuilder";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="App">
      <Router>
      <Navbar />
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/pokedex' element={<Pokedex />} />
          <Route path='/teamBuilder' element={<TeamBuilder />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
