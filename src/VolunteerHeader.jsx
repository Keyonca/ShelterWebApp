import React from 'react';

// Логотип (Изображение)
const Logo = () => (
    <div 
        className="flex items-center justify-center w-[100px] h-[100px] md:w-[120px] md:h-[120px] shrink-0 hover:scale-105 transition-transform duration-300"
    >
        <img src="/logo.png" alt="Логотип приюта" className="w-full h-full object-contain drop-shadow-sm" />
    </div>
);

const NavButton = ({ children, onClick }) => (
    <button onClick={onClick} className="bg-[#D0B89D] text-[#5C4A3D] px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-[#C4A98A] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm">
        {children}
    </button>
);

const ProfileButton = ({ onClick }) => (
    <button 
        onClick={onClick} 
        className="bg-[#D0B89D] text-[#5C4A3D] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-[#C4A98A] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
        title="Профиль"
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-8 md:h-8 opacity-80">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
        </svg>
    </button>
);

export default function VolunteerHeader({ currentPage, onGoToFeed, onGoToReport, onGoToProfile, onLogout }) {
    return (
        <header className="flex flex-row justify-between items-start w-full px-4 md:px-8 pt-6 md:pt-8 pb-4 gap-4 max-w-[1600px] mx-auto">
            <div className="flex-shrink-0 cursor-pointer" onClick={onGoToFeed}>
                <Logo />
            </div>
            <nav className="flex gap-2 md:gap-4 flex-wrap justify-end flex-1 pt-1 md:pt-3 items-center">
                {currentPage !== 'volunteer-feed' && onGoToFeed && (
                    <NavButton onClick={onGoToFeed}>Лента заявок</NavButton>
                )}
                {currentPage !== 'volunteer-report' && onGoToReport && (
                    <NavButton onClick={onGoToReport}>Загрузка фотоотчёта</NavButton>
                )}
                {currentPage !== 'volunteer-profile' && onGoToProfile && (
                    <ProfileButton onClick={onGoToProfile} />
                )}
                {currentPage === 'volunteer-profile' && onLogout && (
                    <button onClick={onLogout} className="bg-red-400/80 text-white px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-red-500 hover:-translate-y-0.5">
                        Выйти
                    </button>
                )}
            </nav>
        </header>
    );
}
