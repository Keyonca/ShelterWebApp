import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WarningModal from '../components/WarningModal';
import SuccessModal from '../components/SuccessModal';
import { ProfileIcon, LogoutIcon } from '../components/Icons';

function VolunteerDashboard() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { isLoggedIn, user, logout, takeRequest } = useAuth();
  const navigate = useNavigate();

  const profileLink = user?.role === 'shelter' ? '/shelter-profile' : '/profile';

  // 1. Загрузка категорий с бэкенда
  useEffect(() => {
    fetch('/api/needcategories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  // 2. Загрузка заявок в зависимости от выбранной категории
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let url = '/api/needrequests?status=Open';
      if (selectedCategoryId) {
        url += `&categoryId=${selectedCategoryId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedCategoryId]);

  // 3. Бронирование заявки
  const handleHelpClick = async (request) => {
    if (!isLoggedIn) {
      setShowAuthWarning(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/needrequests/${request.id}/take`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(`Вы забронировали заявку "${request.title}"! Спасибо за помощь!`);
        setShowSuccess(true);
        if (takeRequest) takeRequest(); // Обновляем данные пользователя в контексте
        fetchRequests(); // Обновляем список открытых заявок
      } else {
        alert(data.message || "Не удалось забронировать заявку");
      }
    } catch (err) {
      alert("Не удалось подключиться к серверу");
    }
  };

  return (
    <>
      <header className="relative z-10 px-4 sm:px-8 py-4 sm:py-6 max-w-[1400px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between">
        <Link to="/" className="inline-block cursor-pointer transition-transform duration-300 hover:scale-105 transform-gpu mb-4 sm:mb-0">
          <img
            src="/logo.png"
            alt="Логотип"
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
          />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/report" className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] font-serif font-bold px-4 py-2 sm:px-6 sm:py-2 rounded-[30px] shadow-sm text-sm sm:text-base leading-tight text-center flex items-center justify-center h-[50px] sm:h-[60px]">
            Загрузка<br />фотоотчёта
          </Link>

          <Link to={profileLink} className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform rounded-full shadow-sm flex items-center justify-center w-[50px] h-[50px] sm:w-[60px] sm:h-[60px]">
            <ProfileIcon role={user?.role} />
          </Link>
          <button
            onClick={() => { logout(); navigate('/'); }}
            aria-label="Выйти из аккаунта"
            className="bg-[#D1B89B] hover:bg-[#c4725a] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] hover:text-white rounded-full shadow-sm flex items-center justify-center w-[50px] h-[50px] sm:w-[60px] sm:h-[60px]"
            title="Выход"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 sm:px-8 pb-16 w-full max-w-[1200px] mx-auto mt-4 sm:mt-0">
        <h1 className="font-serif text-[#5C4A3D] text-[28px] sm:text-[36px] md:text-[42px] leading-[1.2] mb-10 sm:mb-8 text-center font-bold">
          Что нужно прямо сейчас
        </h1>

        {/* Переключатель категорий */}
        <div className="flex flex-wrap gap-2 justify-center mb-10 w-full max-w-[900px] px-2">
          <button 
            onClick={() => setSelectedCategoryId(null)}
            className={`px-5 py-2 rounded-full font-serif font-bold text-sm sm:text-base transition-all ${
              selectedCategoryId === null 
                ? 'bg-[#758A6A] text-white shadow-md scale-105' 
                : 'bg-[#E6E1D8] text-[#5C4A3D] hover:bg-[#DCD7CE]'
            }`}
          >
            Все нужды
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-5 py-2 rounded-full font-serif font-bold text-sm sm:text-base transition-all ${
                selectedCategoryId === cat.id 
                  ? 'bg-[#758A6A] text-white shadow-md scale-105' 
                  : 'bg-[#E6E1D8] text-[#5C4A3D] hover:bg-[#DCD7CE]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-[#5C4A3D] font-serif text-[20px] font-bold mt-12 animate-pulse">
            Загрузка заявок...
          </div>
        ) : requests.length === 0 ? (
          <div className="text-[#8E8981] font-serif text-[18px] sm:text-[22px] font-bold text-center mt-12 italic">
            На данный момент нет активных заявок в этой категории.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 w-full max-w-[900px]">
            {requests.map((request) => (
              <div key={request.id} className="flex flex-col gap-3 group">
                <div className="bg-[#E6E1D8] border-[4px] border-[#8E8981] rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-[4px_4px_10px_rgba(0,0,0,0.1)] transition-transform duration-300 group-hover:-translate-y-1">
                  <p className="font-serif text-[#5C4A3D] text-[18px] sm:text-[20px] font-bold mb-1">
                    Приют: {request.shelterName}
                  </p>
                  <p className="font-serif text-[#758A6A] text-[16px] sm:text-[18px] font-bold mb-2">
                    Категория: {request.categoryName}
                  </p>
                  <h3 className="font-serif text-[#5C4A3D] text-[20px] sm:text-[22px] font-bold mb-2 underline decoration-[#D1B89B] decoration-2">
                    {request.title}
                  </h3>
                  <p className="font-sans text-[#5C4A3D] text-sm sm:text-base font-medium mb-3 max-w-[320px] line-clamp-3">
                    {request.description}
                  </p>
                  {request.quantity && (
                    <p className="font-serif text-[#5C4A3D] text-sm sm:text-base font-bold mb-2">
                      Количество: <span className="text-[#758A6A] font-bold">{request.quantity}</span>
                    </p>
                  )}
                  <p className="font-serif text-[#8E8981] text-xs sm:text-sm font-bold">
                    Актуально до: {new Date(request.expiryDate).toLocaleDateString('ru-RU')}
                  </p>
                </div>

                <button
                  onClick={() => handleHelpClick(request)}
                  className="bg-[#758A6A] hover:bg-[#5f7454] hover:scale-[1.02] transition-all duration-300 transform-gpu backface-hidden will-change-transform text-white text-[20px] sm:text-[24px] font-serif py-3 rounded-full shadow-md hover:shadow-lg w-full font-bold"
                >
                  Хочу помочь
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Auth Warning Modal */}
      {showAuthWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-[#FFFDF9] border-[3px] border-[#8BA080] rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-serif text-[#5C4A3D] text-2xl font-bold mb-3 text-center">
              Внимание!
            </h3>
            <p className="text-[#5C4A3D] text-center mb-8 font-medium">
              Для выполнения заявки необходимо войти в аккаунт или зарегистрироваться.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/login-volunteer')}
                className="bg-[#758A6A] hover:bg-[#5f7454] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform text-white font-bold px-8 py-3 rounded-full shadow-sm w-full text-center"
              >
                Войти
              </button>
              <button
                onClick={() => navigate('/register-volunteer')}
                className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] font-bold px-8 py-3 rounded-full shadow-sm w-full text-center"
              >
                Зарегистрироваться
              </button>
              <button
                onClick={() => setShowAuthWarning(false)}
                className="mt-2 text-[#8E8981] hover:text-[#5C4A3D] underline transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={showSuccess}
        title="Успешно!"
        message={successMessage}
        onClose={() => setShowSuccess(false)}
        buttonText="Отлично"
      />
    </>
  );
}

export default VolunteerDashboard;
