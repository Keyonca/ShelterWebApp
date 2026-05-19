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
    <div className="flex flex-col">
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

// --- Главный компонент ---

export default function VolunteerRegistrationPage({ onGoHome }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: ''
    });
    
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [mockUsers, setMockUsers] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Моковая логика сохранения в БД
        const newUser = {
            id: Date.now(),
            ...formData,
            role: 'Волонтер',
            status: 'Активен'
        };
        
        setMockUsers(prev => [...prev, newUser]);
        setIsSubmitted(true);
        
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({ name: '', phone: '', email: '', password: '' });
        }, 3000);
    };

    return (
        <div className="min-h-screen font-serif flex flex-col bg-gradient-to-br from-[#FAEEE1] via-[#F4DFC8] to-[#EBD3BA] text-[#5C4A3D] overflow-x-hidden">
            
            <header className="w-full px-4 md:px-8 pt-6 md:pt-8 pb-4 max-w-[1600px] mx-auto">
                <div className="flex-shrink-0">
                    <Logo onGoHome={onGoHome} />
                </div>
            </header>

            <main className="flex flex-col items-center flex-1 w-full px-4 pb-12">
                <h1 className="text-3xl sm:text-4xl md:text-[44px] font-bold text-center leading-tight mb-8 max-w-[800px] drop-shadow-sm text-[#5C4A3D]">
                    Заполните форму регистрации для волонтёра
                </h1>

                <form 
                    onSubmit={handleSubmit}
                    className="w-full max-w-[600px] flex flex-col gap-6"
                >
                    <InputField label="Имя:" type="text" name="name" value={formData.name} onChange={handleChange} />
                    <InputField label="Номер телефона:" type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                    <InputField label="Email:" type="email" name="email" value={formData.email} onChange={handleChange} />
                    <InputField label="Пароль:" type="password" name="password" value={formData.password} onChange={handleChange} />

                    <div className="flex justify-center mt-2">
                        <button 
                            type="submit"
                            className="bg-[#788C69] text-white text-2xl px-12 py-4 rounded-[40px] font-medium tracking-wide shadow-[0_4px_10px_rgba(120,140,105,0.4)] transition-all duration-300 hover:bg-[#687C5A] hover:shadow-[0_6px_14px_rgba(104,124,90,0.5)] hover:-translate-y-1 active:translate-y-0 active:shadow-md"
                        >
                            Создать аккаунт
                        </button>
                    </div>

                    <div className={`transition-all duration-500 overflow-hidden ${isSubmitted ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                        <div className="p-4 bg-emerald-100 border-2 border-emerald-300 text-emerald-800 rounded-xl text-center font-bold text-lg shadow-sm">
                            Аккаунт волонтера успешно создан!
                            <div className="text-sm font-normal mt-1 opacity-80">
                                (Всего пользователей в системе: {mockUsers.length})
                            </div>
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
