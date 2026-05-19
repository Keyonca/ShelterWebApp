import React, { useState } from 'react';

// --- 1. Моковые данные (Core Logic & Data Handling) ---
const MOCK_NEEDS = [
    {
        id: 1,
        title: 'Сухой корм "Dog Chow" (15 кг)',
        category: 'Корм',
        shelter: 'Приют "Верный друг"',
        status: 'Открыта', // Заявка видна всем
        createdAt: '2026-04-24',
    },
    {
        id: 2,
        title: 'Вакцины Нобивак (5 доз)',
        category: 'Медикаменты',
        shelter: 'Приют "Кошкин дом"',
        status: 'В работе', // Взят волонтером
        createdAt: '2026-04-23',
    },
    {
        id: 3,
        title: 'Оплата такси до ветклиники',
        category: 'Транспорт',
        shelter: 'Центр помощи животным',
        status: 'На проверке', // Загружен отчет
        createdAt: '2026-04-22',
    },
    {
        id: 4,
        title: 'Выгул трех собак',
        category: 'Руки/Выгул',
        shelter: 'Приют "Хвостики"',
        status: 'Закрыта', // Админ подтвердил
        createdAt: '2026-04-20',
    }
];

// --- 2. Мелкие подкомпоненты (Component Approach) ---

// Логотип (Изображение)
const Logo = () => (
    <a 
        href="/" 
        className="flex items-center justify-center w-[100px] h-[100px] md:w-[120px] md:h-[120px] shrink-0 hover:scale-105 transition-transform duration-300 cursor-pointer"
        title="На главную"
    >
        {/* Изображение будет грузиться из папки public/logo.png */}
        <img src="/logo.png" alt="Логотип приюта" className="w-full h-full object-contain drop-shadow-sm" />
    </a>
);

// Кнопка навигации шапки
const NavButton = ({ children, onClick }) => (
    <button onClick={onClick} className="bg-[#D0B89D] text-[#5C4A3D] px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-[#C4A98A] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm">
        {children}
    </button>
);

// Шапка сайта
const Header = ({ 
    onGoToVolunteerRegistration, 
    onGoToShelterRegistration,
    onGoToVolunteerLogin,
    onGoToShelterLogin,
    onGoToAdminLogin
}) => (
    <header className="flex flex-row justify-between items-start w-full px-4 md:px-8 pt-6 md:pt-8 pb-4 gap-4 max-w-[1600px] mx-auto">
        <div className="flex-shrink-0">
            <Logo />
        </div>
        <nav className="flex gap-2 md:gap-4 flex-wrap justify-end flex-1 pt-1 md:pt-3">
            <NavButton onClick={onGoToVolunteerLogin}>Я волонтер</NavButton>
            <NavButton onClick={onGoToVolunteerRegistration}>Хочу стать волонтером</NavButton>
            <NavButton onClick={onGoToShelterLogin}>Я приют</NavButton>
            <NavButton onClick={onGoToShelterRegistration}>Регистрация приюта</NavButton>
            <NavButton onClick={onGoToAdminLogin}>Админ</NavButton>
        </nav>
    </header>
);

// Карточка заявки с визуализацией статуса
const NeedCard = ({ need }) => {
    // Цветовое кодирование статусов для "прозрачности"
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Открыта': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'В работе': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'На проверке': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Закрыта': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-white/80 p-6 rounded-2xl shadow-sm border border-[#E8D9CB] hover:shadow-md transition-shadow flex flex-col h-full font-sans">
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-[#788C69] uppercase tracking-wide">{need.category}</span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${getStatusStyle(need.status)}`}>
                    {need.status}
                </span>
            </div>
            <h3 className="text-xl font-bold text-[#4A3B30] mb-2 leading-tight">{need.title}</h3>
            <p className="text-[#8B7C6E] text-sm mb-4 flex-grow">{need.shelter}</p>

            <div className="flex gap-2 mt-auto pt-4 border-t border-[#E8D9CB]/50">
                <button className="flex-1 bg-[#EBE0D3] text-[#5C4A3D] py-2 rounded-xl text-sm font-bold hover:bg-[#D0B89D] transition-colors">
                    Подробнее
                </button>
                {need.status === 'Открыта' && (
                    <button className="flex-1 bg-[#788C69] text-white py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#687C5A] transition-colors">
                        Я помогу
                    </button>
                )}
            </div>
        </div>
    );
};

// --- 3. Главный компонент (MainPage) ---
export default function MainPage({ 
    onGoToVolunteerRegistration, 
    onGoToShelterRegistration,
    onGoToVolunteerLogin,
    onGoToShelterLogin,
    onGoToAdminLogin
}) {
    const [showNeeds, setShowNeeds] = useState(false);

    return (
        <div className="min-h-screen font-serif flex flex-col bg-gradient-to-br from-[#FAEEE1] via-[#F4DFC8] to-[#EBD3BA] overflow-x-hidden text-[#5C4A3D]">

            <Header 
                onGoToVolunteerRegistration={onGoToVolunteerRegistration} 
                onGoToShelterRegistration={onGoToShelterRegistration} 
                onGoToVolunteerLogin={onGoToVolunteerLogin}
                onGoToShelterLogin={onGoToShelterLogin}
                onGoToAdminLogin={onGoToAdminLogin}
            />

            <main className="flex flex-col items-center justify-center text-center px-4 flex-1 w-full my-8 md:my-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-medium leading-[1.2] md:leading-[1.15] mb-10 max-w-4xl drop-shadow-sm">
                    Больше не надо мониторить 40 чатов.<br className="hidden sm:block" />
                    Все реальные нужды приютов — здесь.<br className="hidden sm:block" />
                    Выбери и помоги!
                </h1>

                <button
                    onClick={() => setShowNeeds(!showNeeds)}
                    className="bg-[#788C69] text-white text-xl md:text-[26px] px-10 py-4 md:px-14 md:py-5 rounded-[40px] font-medium leading-tight
                     shadow-[0_4px_12px_rgba(120,140,105,0.4)] transition-all duration-300
                     hover:bg-[#687C5A] hover:shadow-[0_6px_16px_rgba(104,124,90,0.5)] hover:-translate-y-1
                     active:translate-y-0 active:shadow-md flex flex-col items-center"
                >
                    <span>Перейти</span>
                    <span>к заявкам</span>
                </button>

                {/* Интерактивный блок: Появление реестра заявок по клику */}
                <div
                    className={`transition-all duration-700 ease-in-out overflow-hidden w-full max-w-5xl 
            ${showNeeds ? 'max-h-[2000px] opacity-100 mt-16' : 'max-h-0 opacity-0 mt-0'}`}
                >
                    <div className="text-left bg-white/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-lg border border-white/40">
                        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#4A3B30] font-sans">
                            Реестр актуальных нужд
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {MOCK_NEEDS.map(need => (
                                <NeedCard key={need.id} need={need} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full text-center py-6 md:py-8 font-medium opacity-80 text-base md:text-lg">
                © 2026 ЛПК
            </footer>
        </div>
    );
}
