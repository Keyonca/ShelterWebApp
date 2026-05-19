import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WarningModal from '../components/WarningModal';
import SuccessModal from '../components/SuccessModal';

function RegisterVolunteer() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
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
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.password.trim()) {
      setWarningMessage("Пожалуйста, заполните все поля формы перед созданием аккаунта.");
      setShowWarning(true);
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setWarningMessage("Пожалуйста, введите корректный номер телефона (не менее 10 цифр).");
      setShowWarning(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Отправляем запрос на регистрацию
      const registerResponse = await fetch('/api/auth/register/volunteer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phone,
          email: formData.email,
          password: formData.password
        })
      });

      const registerData = await registerResponse.json();

      if (registerResponse.ok) {
        // 2. В случае успеха автоматически логиним пользователя на фоне
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          login(loginData.token);
          setShowSuccess(true);
        } else {
          // Если авто-вход сломался, просто просим войти вручную
          setWarningMessage("Регистрация успешна, но не удалось выполнить авто-вход. Пожалуйста, войдите вручную.");
          setShowWarning(true);
        }
      } else {
        setWarningMessage(registerData.Message || "Не удалось завершить регистрацию");
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
      <header className="relative z-10 px-4 sm:px-8 py-4 sm:py-6 max-w-[1400px] w-full mx-auto text-center sm:text-left">
        <Link to="/" className="inline-block cursor-pointer transition-transform duration-300 hover:scale-105 transform-gpu">
          <img 
            src="/logo.png" 
            alt="Логотип" 
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
          />
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:mt-[-40px] pb-12 w-full relative z-0">
        <h1 className="font-serif text-[#5C4A3D] text-[24px] sm:text-[30px] md:text-[38px] leading-[1.2] mb-6 sm:mb-10 text-center max-w-[600px] mx-auto font-bold w-full">
          Заполните форму регистрации для<br className="hidden sm:block" /> волонтёра
        </h1>
        
        <form onSubmit={handleSubmit} className="w-full max-w-[500px] flex flex-col gap-4 sm:gap-5 px-2 sm:px-0">
          <div className="flex flex-col gap-1">
            <label htmlFor="reg-vol-name" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Имя:</label>
            <input 
              id="reg-vol-name"
              type="text" name="name" value={formData.name} onChange={handleChange}
              disabled={isSubmitting}
              className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[40px] sm:h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-[#758A6A] transition-all px-3 sm:px-4 text-[#5C4A3D] font-medium text-sm sm:text-base w-full"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label htmlFor="reg-vol-phone" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Номер телефона:</label>
            <input 
              id="reg-vol-phone"
              type="tel" name="phone" value={formData.phone} onChange={handleChange}
              disabled={isSubmitting}
              className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[40px] sm:h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-[#758A6A] transition-all px-3 sm:px-4 text-[#5C4A3D] font-medium text-sm sm:text-base w-full"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label htmlFor="reg-vol-email" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Email:</label>
            <input 
              id="reg-vol-email"
              type="email" name="email" value={formData.email} onChange={handleChange}
              disabled={isSubmitting}
              className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[40px] sm:h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-[#758A6A] transition-all px-3 sm:px-4 text-[#5C4A3D] font-medium text-sm sm:text-base w-full"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label htmlFor="reg-vol-password" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Пароль:</label>
            <div className="relative">
              <input 
                id="reg-vol-password"
                type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
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
          
          <div className="flex justify-center mt-4 sm:mt-6">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#758A6A] hover:bg-[#5f7454] hover:scale-105 disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed transition-all duration-300 transform-gpu backface-hidden will-change-transform text-white text-[18px] sm:text-[22px] px-8 sm:px-12 py-2 sm:py-3 rounded-[40px] shadow-md hover:shadow-lg font-serif w-full sm:w-auto"
            >
              {isSubmitting ? "Создание..." : "Создать аккаунт"}
            </button>
          </div>
        </form>
      </main>

      <WarningModal isOpen={showWarning} message={warningMessage} onClose={() => setShowWarning(false)} />
      <SuccessModal 
        isOpen={showSuccess} 
        title="Успешно!" 
        message="Регистрация успешно завершена! Добро пожаловать в ЛПК." 
        onClose={() => setShowSuccess(false)}
        buttonText="Перейти к заявкам"
        buttonLink="/requests"
      />
    </>
  );
}

export default RegisterVolunteer;
