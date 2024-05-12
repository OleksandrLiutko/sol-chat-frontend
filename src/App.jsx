import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';

import './App.css';
import { WalletContextProvider } from './components/WalletContextProvider';
import '@solana/wallet-adapter-react-ui/styles.css';
import BaseLayout from './pages/layout/BaseLayout';
import Scanner from './pages/Scanner/scanner';
import Mainboard from './pages/Dashboard/dashboard';
import Conversation from './pages/Conversations/conversation';
import Create from './pages/Create/create';

const theme = createTheme();

function App() {
  return (
    <>
      <WalletContextProvider>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route element={<BaseLayout />}>
              <Route path='/' element={<Mainboard />} />
              <Route path='/dashboard' element={<Mainboard />} />
              <Route path='/conversation' element={<Conversation />} />
              <Route path='/scanner' element={<Scanner />} />
              <Route path='/sign' element={<Scanner />} />
              <Route path='/create' element={<Create />} />
              <Route path='/setting' element={<Create />} />
            </Route>
          </Routes>
          <ToastContainer />
        </ThemeProvider>
      </WalletContextProvider>
    </>
  );
}

export default App;
