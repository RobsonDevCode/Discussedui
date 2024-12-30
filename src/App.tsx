import './App.css'
import './index.css'
import LoginSignUp from './Pages/LoginSignUp/LoginSignUp';
import CodeConfirmation from './Pages/LoginSignUp/CodeConfirmation';
import ErrorPage from "./Pages/Error/Error";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './Pages/Login/Login';
import ForgotPassword from './Pages/Login/ForgotPassword';
import ResetPassword from './Pages/Account/ResetPassword';
//import DisplayTopic from './Components/Topic/Topic';

function App() {

  return (
    <Router>
      <div className='flex h-screen'>
        <div className="flex-grow flex justify-center items-center">
          <Routes>
            <Route path='/' element={<LoginPage />}></Route>
            <Route path='/sign-up' element={<LoginSignUp />}></Route>
            <Route path="/code-confirmation" element={<CodeConfirmation />} />
            <Route path='/forgot-password' element={<ForgotPassword/>} ></Route>
            <Route path='/reset-password' element={<ResetPassword/>}></Route>
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
