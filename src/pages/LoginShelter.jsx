import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WarningModal from '../components/WarningModal';
import SuccessModal from '../components/SuccessModal';

function LoginShelter() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setWarningMessage("Пожалуйста, заполните все поля для входа.");
      setShowWarning(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.role?.toLowerCase() !== 'shelter') {
          setWarningMessage("Этот аккаунт не принадлежит приюту. Пожалуйста, войдите через вход для волонтеров.");
          setShowWarning(true);
          setIsSubmitting(false);
          return;
        }

        login(data.token);
        setShowSuccess(true);
      } else {
        setWarningMessage(data.Message || "Неверный Email или пароль");
        setShowWarning(true);
      }
    } catch (error) {
      setWarningMessage("Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен.");
      setShowWarning(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="relative z-10 px-4 sm:px-8 py-4 sm:py-6 max-w-[1400px] w-full mx-auto text-center sm:text-left flex items-center justify-center sm:justify-start">
        <Link to="/" className="inline-block cursor-pointer transition-transform duration-300 hover:scale-105 transform-gpu absolute left-4 sm:left-8 top-4 sm:top-6">
          <img 
            src="/logo.png" 
            alt="Логотип" 
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
          />
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-12 w-full relative z-0 md:mt-[-80px]">
        <h1 className="font-serif text-[#5C4A3D] text-[24px] sm:text-[30px] md:text-[36px] leading-[1.2] mb-8 sm:mb-12 text-center max-w-[500px] mx-auto font-bold w-full">
          Введите данные для входа в<br />профиль приюта
        </h1>
        
        <form onSubmit={handleSubmit} className="w-full max-w-[500px] flex flex-col gap-4 sm:gap-6 px-2 sm:px-0">
          <div className="flex flex-col gap-1">
            <label htmlFor="login-shelter-email" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Email:</label>
            <input 
              id="login-shelter-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[40px] sm:h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-[#758A6A] transition-all px-3 sm:px-4 text-[#5C4A3D] font-medium text-sm sm:text-base w-full"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label htmlFor="login-shelter-password" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Пароль:</label>
            <div className="relative">
              <input 
                id="login-shelter-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[40px] sm:h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-[#758A6A] transition-all px-3 sm:px-4 pr-10 sm:pr-12 text-[#5C4A3D] font-medium text-sm sm:text-base w-full"
              />
              <button 
                type="button"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 text-[#5C4A3D] hover:text-[#758A6A] transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex justify-center mt-6 sm:mt-8">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#758A6A] hover:bg-[#5f7454] hover:scale-105 disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed transition-all duration-300 transform-gpu backface-hidden will-change-transform text-white text-[18px] sm:text-[22px] px-8 sm:px-16 py-2 sm:py-3 rounded-[40px] shadow-md hover:shadow-lg font-serif w-full sm:w-auto"
            >
              {isSubmitting ? "Вход..." : "Войти"}
            </button>
          </div>
        </form>
      </main>

      <WarningModal isOpen={showWarning} message={warningMessage} onClose={() => setShowWarning(false)} />
      <SuccessModal 
        isOpen={showSuccess} 
        title="Успешно!" 
        message="Вход успешно выполнен! Добро пожаловать." 
        onClose={() => setShowSuccess(false)}
        buttonText="В личный кабинет"
        buttonLink="/shelter-profile"
      />
    </>
  );
}

export default LoginShelter;
