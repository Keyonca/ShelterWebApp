import React, { useState } from 'react';

// --- Подкомпоненты ---

// 1. Логотип (Изображение)
const Logo = ({ onGoHome }) => (
    <div 
        onClick={onGoHome} 
        className="flex items-center justify-center w-[100px] h-[100px] md:w-[120px] md:h-[120px] shrink-0 hover:scale-105 transition-transform duration-300 cursor-pointer"
        title="На главную"
    >
        <img src="/logo.png" alt="Логотип приюта" className="w-full h-full object-contain drop-shadow-sm" />
    </div>
);

// 2. Универсальное поле ввода (Input Field)
const InputField = ({ label, type, name, value, onChange }) => (
    <div className="flex flex-col mb-4">
        <label className="text-2xl font-bold mb-2 text-[#5E4C3C] tracking-wide">
            {label}
        </label>
        <input 
            type={type} 
            name={name}
            value={value}
            onChange={onChange}
            required
            className="w-full h-12 md:h-14 bg-[#E0D5C9] border-[3px] border-[#A39686] rounded-md shadow-[0_6px_8px_rgba(0,0,0,0.15)] focus:outline-none focus:border-[#788C69] focus:ring-2 focus:ring-[#788C69]/30 transition-all text-xl px-4 text-[#5E4C3C]"
        />
    </div>
);

// --- Главный компонент (Переиспользуемая страница входа) ---
export default function LoginPage({ title, loginLabel, loginType, loginName, accountType, onGoHome, onLoginSuccess }) {
    const [formData, setFormData] = useState({
        [loginName]: '',
        password: ''
    });
    
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Моковая логика входа
        setIsSubmitted(true);
        
        setTimeout(() => {
            setIsSubmitted(false);
            
            // Если это вход волонтёра с тестовыми данными
            if (accountType === 'volunteer' && formData[loginName] === 'test@volunteer.com' && formData.password === 'password') {
                const mockUser = {
                    name: 'Тестовый Волонтёр',
                    phone: '+7 (999) 123-45-67',
                    email: 'test@volunteer.com',
                    savedTails: 12
                };
                onLoginSuccess(mockUser);
            } else if (onLoginSuccess) {
                 // Если другой аккаунт (пока просто мок)
                 onLoginSuccess({ email: formData[loginName] });
            } else {
                 onGoHome(); 
            }
        }, 2000);
    };

    return (
        <div className="min-h-screen font-serif flex flex-col bg-gradient-to-br from-[#FAEEE1] via-[#F4DFC8] to-[#EBD3BA] text-[#5C4A3D] overflow-x-hidden">
            
            <header className="w-full px-4 md:px-8 pt-6 md:pt-8 pb-4 max-w-[1600px] mx-auto flex items-center">
                <div className="flex-shrink-0">
                    <Logo onGoHome={onGoHome} />
                </div>
            </header>

            {/* Контент центрирован по вертикали и горизонтали, с небольшим смещением вверх для визуального баланса */}
            <main className="flex flex-col items-center justify-center flex-1 w-full px-4 pb-12 -mt-16 md:-mt-24">
                <h1 className="text-3xl sm:text-4xl md:text-[44px] font-bold text-center leading-tight mb-8 max-w-[600px] drop-shadow-sm text-[#5C4A3D]">
                    {title}
                </h1>

                <form 
                    onSubmit={handleSubmit}
                    className="w-full max-w-[500px] flex flex-col gap-2"
                >
                    <InputField label={loginLabel} type={loginType} name={loginName} value={formData[loginName] || ''} onChange={handleChange} />
                    <InputField label="Пароль:" type="password" name="password" value={formData.password} onChange={handleChange} />

                    <div className="flex justify-center mt-6">
                        <button 
                            type="submit"
                            className="bg-[#788C69] text-white text-2xl px-16 py-4 rounded-[40px] font-medium tracking-wide shadow-[0_4px_10px_rgba(120,140,105,0.4)] transition-all duration-300 hover:bg-[#687C5A] hover:shadow-[0_6px_14px_rgba(104,124,90,0.5)] hover:-translate-y-1 active:translate-y-0 active:shadow-md"
                        >
                            Войти
                        </button>
                    </div>

                    <div className={`transition-all duration-500 overflow-hidden ${isSubmitted ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                        <div className="p-4 bg-emerald-100 border-2 border-emerald-300 text-emerald-800 rounded-xl text-center font-bold text-lg shadow-sm">
                            Успешный вход! Перенаправление...
                        </div>
                    </div>
                </form>
            </main>

            <footer className="w-full text-center py-6 md:py-8 font-medium opacity-80 text-base md:text-lg mt-auto">
                © 2026 ЛПК
            </footer>
        </div>
    );
}
