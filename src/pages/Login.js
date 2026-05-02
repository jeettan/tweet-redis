import '../App.css';
import Navbar from '../components/Navbar'
import RegisterLogin from '../components/RegisterLogin'
import Lines from '../components/Lines'

function Login() {

  return (
    <div className="App">
      <Navbar />
      <Lines />
      <RegisterLogin />
    </div >
  );
}

export default Login;
