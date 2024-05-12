import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import SliderBar from '../../components/SliderBar';

const BaseLayout = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    setIsMenuOpen(false);

    return () => {
      setIsMenuOpen(false);
    };
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen flex flex-row">
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0 w-[270px]`}
      >
        <SliderBar toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
      </aside>
      <div className="h-screen sm:pl-[270px] overflow-y-auto flex-1 flex flex-col bg-[#101011]">
        <Header
          isMenuOpen={isMenuOpen}
          toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        />
        <div className="h-[0.1rem] w-full bg-[#1B1B1B]" />
        <main className="z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
