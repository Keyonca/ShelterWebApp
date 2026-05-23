import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { isLoggedIn, user, logout } = useAuth();

  // Helper to get custom greeting based on user role
  const getGreeting = () => {
    if (!user) return '';
    if (user.role === 'admin') return 'Администратор';
    return user.name || user.email;
  };

  // Helper to get CTA link based on user role
  const getCtaLink = () => {
    if (!isLoggedIn) return '/login-volunteer';
    if (user.role === 'admin') return '/admin-verification';
    if (user.role === 'shelter') return '/shelter-profile';
    return '/requests';
  };

  // Helper to get CTA text based on user role
  const getCtaText = () => {
    if (!isLoggedIn) return 'Перейти к заявкам';
    if (user.role === 'admin') return 'В панель администратора';
    if (user.role === 'shelter') return 'В кабинет приюта';
    return 'Перейти к заявкам';
  };

  // Unified button styles for pixel-perfect design alignment
  const btnClass = "bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 hover:shadow-md transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] font-medium px-4 sm:px-6 lg:px-8 h-[40px] sm:h-[46px] rounded-full shadow-sm text-xs sm:text-sm inline-flex items-center justify-center text-center whitespace-nowrap";
  const logoutBtnClass = "border-2 border-[#8E8981] hover:border-[#5C4A3D] hover:scale-105 hover:shadow-md transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] font-medium px-4 sm:px-6 lg:px-8 h-[40px] sm:h-[46px] rounded-full shadow-sm text-xs sm:text-sm inline-flex items-center justify-center text-center whitespace-nowrap";

  return (
    <>
      <header className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-4 sm:px-8 py-6 max-w-[1400px] w-full mx-auto">
        <Link to="/" className="flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105 transform-gpu mb-4 lg:mb-0">
          <img 
            src="/logo.png" 
            alt="Логотип" 
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
          />
        </Link>
        
        <nav className="flex items-center gap-2 sm:gap-4 lg:ml-8 flex-wrap justify-center w-full lg:w-auto">
          {isLoggedIn ? (
            <>
              <span className="font-serif text-[#5C4A3D] font-bold text-xs sm:text-sm mr-2 py-2">
                Привет, {getGreeting()}!
              </span>
              
              {user.role === 'admin' && (
                <Link to="/admin-verification" className={btnClass}>
                  Панель управления
                </Link>
              )}
              
              {user.role === 'shelter' && (
                <>
                  <Link to="/shelter-profile" className={btnClass}>
                    Кабинет приюта
                  </Link>
                  <Link to="/shelter-requests" className={btnClass}>
                    Мои заявки
                  </Link>
                  <Link to="/create-request" className={btnClass}>
                    Создать заявку
                  </Link>
                </>
              )}
              
              {user.role === 'volunteer' && (
                <>
                  <Link to="/requests" className={btnClass}>
                    Все заявки
                  </Link>
                  <Link to="/profile" className={btnClass}>
                    Личный кабинет
                  </Link>
                </>
              )}
              
              <button 
                onClick={logout} 
                className={logoutBtnClass}
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login-volunteer" className={btnClass}>
                Я волонтер
              </Link>
              <Link to="/register-volunteer" className={btnClass}>
                Хочу стать волонтером
              </Link>
              <Link to="/login-shelter" className={btnClass}>
                Я приют
              </Link>
              <Link to="/register-shelter" className={btnClass}>
                Регистрация приюта
              </Link>
              <Link to="/login-admin" className={btnClass}>
                Админ
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 text-center mt-8 lg:mt-[-80px] pb-12">
        <h1 className="font-serif text-[#5C4A3D] text-[24px] sm:text-[32px] md:text-[36px] lg:text-[42px] leading-[1.2] mb-8 sm:mb-12 max-w-3xl">
          Больше не надо мониторить 40 чатов.<br className="hidden sm:block" />
          Все реальные нужды приютов — здесь.<br className="hidden sm:block" />
          Выбери и помоги!
        </h1>
        
        <Link to={getCtaLink()} className="bg-[#758A6A] hover:bg-[#5f7454] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform border-[4px] md:border-[6px] border-[#8BA080] text-white font-serif text-[18px] sm:text-[22px] lg:text-[26px] px-8 sm:px-10 lg:px-14 py-3 sm:py-4 rounded-[40px] lg:rounded-[50px] leading-tight shadow-md hover:shadow-lg inline-block">
          {getCtaText()}
        </Link>
      </main>
    </>
  );
}

export default Home;
