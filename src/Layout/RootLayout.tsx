import { useLocation } from 'react-router-dom';
import SideNav from '../Components/Navigation/SideNav';

const PUBLIC_ROUTES = ['/login', '/sign-up', '/forgot-password', '/code-confirmation', '/reset-password'];

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  return (
    <div className="flex h-screen ">
      {!isPublicRoute && <SideNav />}
      <main className={`flex-1 ${!isPublicRoute ? 'lg:ml-64' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default RootLayout;
