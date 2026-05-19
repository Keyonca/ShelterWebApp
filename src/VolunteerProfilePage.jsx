import React, { useState, useRef } from 'react';
import VolunteerHeader from './VolunteerHeader';

export default function VolunteerProfilePage({ onGoToFeed, onGoToReport, onLogout, user }) {
    // Используем переданного юзера или мок по умолчанию, если зашли напрямую
    const profileData = user || {
        name: 'Иван Иванов',
        phone: '+7 (900) 123-45-67',
        email: 'ivan@example.com',
        savedTails: 5
    };

    const [formData, setFormData] = useState({
        name: profileData.name,
        phone: profileData.phone,
        email: profileData.email,
        password: ''
    });
    
    const [currentProfile, setCurrentProfile] = useState(profileData);
    const [isSaved, setIsSaved] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('/volunteer_photo.png');
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setAvatarUrl(imageUrl);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setCurrentProfile({
            ...currentProfile,
            name: formData.name,
            phone: formData.phone,
            email: formData.email
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="min-h-screen font-serif flex flex-col bg-gradient-to-br from-[#FAEEE1] via-[#F4DFC8] to-[#EBD3BA] overflow-x-hidden text-[#5C4A3D]">
            <VolunteerHeader 
                currentPage="volunteer-profile" 
                onGoToFeed={onGoToFeed} 
                onGoToReport={onGoToReport} 
                onLogout={onLogout} 
            />

            <main className="flex flex-col items-center flex-1 w-full px-4 md:px-8 max-w-[1000px] mx-auto pb-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 md:mb-12 mt-4 drop-shadow-sm">
                    Личный кабинет
                </h1>

                {/* Верхняя секция: Аватар и Инфо */}
                <div className="w-full flex flex-col md:flex-row gap-8 mb-12">
                    {/* Аватар с возможностью загрузки */}
                    <div 
                        className="w-64 h-64 md:w-[350px] md:h-[350px] shrink-0 border-[3px] border-[#A39686] mx-auto md:mx-0 flex items-center justify-center bg-white/50 relative overflow-hidden rounded-xl shadow-md group cursor-pointer"
                        onClick={() => fileInputRef.current.click()}
                        title="Нажмите, чтобы изменить фото"
                    >
                        <img 
                            src={avatarUrl} 
                            alt="Аватар волонтера" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            onError={(e) => {
                                // Фолбэк, если volunteer_photo.png ещё не добавлен в public/
                                e.target.onerror = null; 
                                e.target.src = 'https://via.placeholder.com/350x350.png?text=Фото+Волонтера';
                            }}
                        />
                        
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-white font-bold text-lg bg-black/50 px-6 py-3 rounded-full flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                </svg>
                                Изменить фото
                            </span>
                        </div>
                        
                        <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleAvatarChange} 
                            accept="image/*"
                        />
                    </div>

                    <div className="flex flex-col justify-center flex-1 text-lg md:text-xl gap-2">
                        <p><span className="font-bold">Имя:</span> {currentProfile.name}</p>
                        <p><span className="font-bold">Номер телефона:</span> {currentProfile.phone}</p>
                        <p><span className="font-bold">email:</span> {currentProfile.email}</p>
                        <p className="mt-4"><span className="font-bold text-2xl">Спасено хвостиков:</span> {currentProfile.savedTails}</p>
                        
                        <div className="mt-4">
                            <span className="font-bold text-xl">История помощи:</span>
                            <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
                                <li>[20.04.2026] [Приют "Верный друг"] [Корм] [<span className="text-[#788C69] font-bold">Успешно</span>]</li>
                                <li>[15.04.2026] [Приют "Кошкин дом"] [Медикаменты] [<span className="text-[#788C69] font-bold">Успешно</span>]</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Средняя секция: Статусы */}
                <div className="w-full text-lg md:text-xl space-y-8 mb-16">
                    <div>
                        <span className="font-bold block mb-2 text-2xl">Статус заявок:</span>
                        <ul className="list-disc list-inside ml-2 space-y-2">
                            <li>[Выгул собак] — <span className="text-[#D49E53] font-bold">"В работе"</span></li>
                            <li>[Оплата такси] — <span className="text-[#5A7C9A] font-bold">"На проверке"</span></li>
                            <li>[Покупка пеленок] — <span className="text-[#B56A6A] font-bold">"Отклонена"</span></li>
                        </ul>
                    </div>

                    <div>
                        <span className="font-bold block mb-2 text-2xl">Сейчас волонтер помогает:</span>
                        <ul className="list-disc list-inside ml-2">
                            <li>[Приют "Хвостики", +7 (912) 345-67-89, ул. Ленина, 15]</li>
                        </ul>
                    </div>
                </div>

                {/* Нижняя секция: Настройки профиля */}
                <div className="w-full max-w-[600px]">
                    <h2 className="text-3xl font-bold text-center mb-2">Настройки профиля</h2>
                    <p className="text-center text-[#8B7C6E] text-lg mb-8">
                        Введите новые данные для изменения информации
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col">
                            <label className="text-xl font-bold mb-1">Имя:</label>
                            <input 
                                type="text" name="name" value={formData.name} onChange={handleChange}
                                className="w-full h-12 bg-[#E0D5C9] border-[3px] border-[#A39686] rounded-md shadow-sm focus:outline-none focus:border-[#788C69] px-4 text-lg font-sans"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xl font-bold mb-1">Номер телефона:</label>
                            <input 
                                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                className="w-full h-12 bg-[#E0D5C9] border-[3px] border-[#A39686] rounded-md shadow-sm focus:outline-none focus:border-[#788C69] px-4 text-lg font-sans"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xl font-bold mb-1">Email:</label>
                            <input 
                                type="email" name="email" value={formData.email} onChange={handleChange}
                                className="w-full h-12 bg-[#E0D5C9] border-[3px] border-[#A39686] rounded-md shadow-sm focus:outline-none focus:border-[#788C69] px-4 text-lg font-sans"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xl font-bold mb-1">Пароль:</label>
                            <input 
                                type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Оставьте пустым, чтобы не менять"
                                className="w-full h-12 bg-[#E0D5C9] border-[3px] border-[#A39686] rounded-md shadow-sm focus:outline-none focus:border-[#788C69] px-4 text-lg font-sans placeholder-[#A39686]/60"
                            />
                        </div>

                        <div className="flex justify-center mt-6">
                            <button 
                                type="submit"
                                className="bg-[#788C69] text-white py-3 px-16 rounded-full font-serif text-xl shadow-[0_4px_10px_rgba(120,140,105,0.4)] transition-all duration-300 hover:bg-[#687C5A] hover:shadow-[0_6px_14px_rgba(104,124,90,0.5)] hover:-translate-y-1 active:translate-y-0 active:shadow-md"
                            >
                                Изменить
                            </button>
                        </div>
                        
                        {isSaved && (
                            <div className="mt-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-center font-bold">
                                Данные успешно сохранены!
                            </div>
                        )}
                    </form>
                </div>
            </main>

            <footer className="w-full text-center py-6 md:py-8 font-medium opacity-80 text-base mt-auto">
                © 2026 ЛПК
            </footer>
        </div>
    );
}
