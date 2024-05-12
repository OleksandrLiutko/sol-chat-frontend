import { Link, useLocation } from 'react-router-dom';

const SliderBar = ({ toggleMenu }) => {
  const location = useLocation();

  const isActive = (path) => {
    if (location.pathname === path) return true;
    return false;
  };

  return (
    <div className='w-full border-r border-gray-500 h-screen overflow-y-auto flex flex-col text-letter bg-[#1B1B1B] text-white  px-[10px] py-1 sm:py-2'>
      <button onClick={toggleMenu} className='sm:hidden fixed top-4 right-4'>
        <svg
          fill='none'
          width='28'
          color='gray'
          strokeWidth={1.5}
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
          aria-hidden='true'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M6 18 18 6M6 6l12 12'
          />
        </svg>
      </button>
      <div className='flex h-full flex-col mx-2'>
        <div className='grid mx-2 font-bold'>
          <div className='flex flex-row branding-header items-center my-7'>
            <Link
              // to="/dashboard"s
              className='MuiTypography-root MuiLink-root justify-self-center MuiLink-underlineHover MuiTypography-colorPrimary mr-2'
            >
              <img
                className='w-10 h-10'
                src='./icons/solchat.svg'
                alt='no image'
              />
            </Link>
            <h1 className='text-3xl'>SolDocs</h1>
          </div>
        </div>
        <div className='dapp-sidebar flex flex-1 flex-col justify-between text-2xl'>
          <div className='flex-1'>
            <div className='dapp-menu-links'>
              <div className='dapp-nav font-semibold'>
                <Link
                  to='/dashboard'
                  className='text-xl MuiTypography-root MuiLink-root MuiLink-underlineHover button-dapp-menu MuiTypography-colorPrimary active'
                >
                  <div
                    className={`px-4 py-3 text-2xl dapp-menu-item${
                      isActive('/dashboard') || isActive('/') ? '-active' : ''
                    } flex flex-row`}
                  >
                    <img className='w-7 mr-2' src='./icons/home.svg' alt='' />
                    <p>Dashboard</p>
                  </div>
                </Link>
                <Link
                  to='/conversation'
                  className='text-xl MuiTypography-root  MuiLink-root MuiLink-underlineHover button-dapp-menu MuiTypography-colorPrimary'
                >
                  <div
                    className={`px-4 py-3 text-2xl dapp-menu-item${
                      isActive('/conversation') ? '-active' : ''
                    } flex flex-row`}
                  >
                    <img
                      className='w-7 mr-2'
                      alt=''
                      src='./icons/conversation.svg'
                    ></img>
                    <p>Conversations</p>
                  </div>
                </Link>
                <Link
                  to='/scanner'
                  className='text-xl MuiTypography-root MuiLink-root MuiLink-underlineHover button-dapp-menu MuiTypography-colorPrimary'
                >
                  <div
                    className={`px-4 py-3 text-2xl dapp-menu-item${
                      isActive('/scanner') ? '-active' : ''
                    } flex flex-row`}
                  >
                    <img
                      className='mr-2 w-7'
                      alt=''
                      src='./icons/scan.svg'
                    ></img>
                    <p>Scanner</p>
                  </div>
                </Link>
                <Link
                  to='/sign'
                  className='MuiTypography-root  MuiLink-root MuiLink-underlineHover button-dapp-menu MuiTypography-colorPrimary'
                >
                  <div
                    className={`px-4 py-3 text-2xl dapp-menu-item${
                      isActive('/sign') ? '-active' : ''
                    } flex flex-row`}
                  >
                    <img
                      className='w-7 mr-2'
                      alt=''
                      src='./icons/sign.svg'
                    ></img>
                    <p>Sign</p>
                  </div>
                </Link>
                <Link
                  to='/create'
                  className='MuiTypography-root  MuiLink-root MuiLink-underlineHover button-dapp-menu MuiTypography-colorPrimary'
                >
                  <div
                    className={`px-4 py-3 text-2xl dapp-menu-item${
                      isActive('/create') ? '-active' : ''
                    } flex flex-row`}
                  >
                    <img
                      className='w-7 mr-2'
                      alt=''
                      src='./icons/create.svg'
                    ></img>
                    <p>Create</p>
                  </div>
                </Link>
                <Link
                  to='/setting'
                  className='MuiTypography-root  MuiLink-root MuiLink-underlineHover button-dapp-menu MuiTypography-colorPrimary'
                >
                  <div
                    className={`px-4 py-3 text-2xl dapp-menu-item${
                      isActive('/setting') ? '-active' : ''
                    } flex flex-row`}
                  >
                    <img
                      className='w-7 mr-2'
                      alt=''
                      src='./icons/settings.svg'
                    ></img>
                    <p>Storage</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          <div className='flex-col grid bg-[#4E31AA] p-4 rounded-lg mb-4'>
            <div className='flex flex-row justify-between items-center'>
              <>
                <p style={{ fontSize: '18px' }} className='font-semibold'>
                  TOKEN <br />
                  REQUIREMENT
                </p>
              </>
              <img
                className='w-8 h-8'
                src='./icons/solchat.svg'
                alt='no image'
              />
            </div>
            <div className='my-5'>
              <>
                <p style={{ fontSize: '14px', color: '#a3a3a3' }}>
                  Hold 2,500 DOCS Utility Tokens to Utilize dApp
                </p>
              </>
            </div>
            <div className='flex flex-row'>
              <img className='w-6 h-6' src='./icons/arrow.svg' alt='no image' />
              <img className='w-6 h-6' src='./icons/arrow.svg' alt='no image' />
              <img className='w-6 h-6' src='./icons/arrow.svg' alt='no image' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliderBar;
