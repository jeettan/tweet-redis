import '../App.css';
import Navbar from '../components/Navbar'
import Feed from '../components/Feed/Feed'
import Lines from '../components/Lines'

function App() {

  return (
    <div className="App">
      <Navbar />
      <Lines />
      <Feed />
    </div >
  );
}

export default App;
