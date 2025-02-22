import './App.css'
import './index.css'
import LoginSignUp from './Pages/LoginSignUp/LoginSignUp';
import CodeConfirmation from './Pages/LoginSignUp/CodeConfirmation';
import ErrorPage from "./Pages/Error/Error";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './Pages/Login/Login';
import ForgotPassword from './Pages/Login/ForgotPassword';
import ResetPassword from './Pages/Account/ResetPassword';
import Comments from './Pages/Comments/Comments';
import RootLayout from './Layout/RootLayout';
//import DisplayTopic from './Components/Topic/Topic';

function App() {

  return (
    <Router>
      <RootLayout>
        <div className='flex h-screen dark:text-white'>
          <Routes>
            <Route path='/' element={<Comments />}></Route>
            <Route path='/login' element={<LoginPage />}></Route>
            <Route path='/sign-up' element={<LoginSignUp />}></Route>
            <Route path="/code-confirmation" element={<CodeConfirmation />} />
            <Route path='/forgot-password' element={<ForgotPassword />} ></Route>
            <Route path='/reset-password' element={<ResetPassword />}></Route>
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
        </div>
      </RootLayout>
    </Router>

  );
}

export default App;
