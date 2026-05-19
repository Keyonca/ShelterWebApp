import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfileIcon, LogoutIcon } from '../components/Icons';

function ShelterRequests() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const profileLink = user?.role === 'shelter' ? '/shelter-profile' : '/profile';

  // Загрузка заявок приюта
  const loadRequests = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/needrequests');
      const data = await res.json();
      // Отображаем все заявки текущего приюта
      const shelterReqs = data.filter(r => r.shelterName === user.name);
      setRequests(shelterReqs);
    } catch (err) {
      console.error("Ошибка загрузки заявок приюта:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  // Закрытие заявки вручную
  const handleCloseRequest = async (requestId) => {
    if (!window.confirm("Вы уверены, что хотите закрыть эту заявку?")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/needrequests/${requestId}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        loadRequests(); // Обновляем список
      } else {
        alert("Не удалось закрыть заявку");
      }
    } catch (err) {
      alert("Ошибка подключения к серверу");
    }
  };

  // Красивый маппинг статусов
  const getStatusText = (status) => {
    switch (status) {
      case 'Open': return 'Открыта';
      case 'InProgress': return 'В работе';
      case 'OnVerification': return 'На проверке';
      case 'Closed': return 'Выполнена';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'text-[#758A6A]'; // Зеленый
      case 'InProgress': return 'text-[#D1B89B]'; // Песочный
      case 'OnVerification': return 'text-amber-600'; // Янтарный
      case 'Closed': return 'text-[#8E8981]'; // Серый
      default: return 'text-[#5C4A3D]';
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
        
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
          <Link to="/verify-report" className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] font-serif font-bold px-4 py-2 sm:px-8 sm:py-3 rounded-[30px] shadow-sm text-sm sm:text-[20px] leading-tight text-center flex items-center justify-center h-[50px] sm:h-[60px]">
            Проверка<br />фотоотчёта
          </Link>
          <Link to="/create-request" className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] font-serif font-bold px-4 py-2 sm:px-6 sm:py-2 rounded-[30px] shadow-sm text-sm sm:text-base leading-tight text-center flex items-center justify-center h-[50px] sm:h-[60px]">
            Создание/<br />редактирование заявки
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
        <h1 className="font-serif text-[#5C4A3D] text-[28px] sm:text-[36px] md:text-[42px] leading-[1.2] mb-10 sm:mb-12 text-center font-bold">
          Мои заявки
        </h1>
        
        {isLoading ? (
          <div className="text-[#5C4A3D] font-serif text-[20px] font-bold mt-12 animate-pulse">
            Загрузка заявок...
          </div>
        ) : requests.length === 0 ? (
          <div className="text-[#8E8981] font-serif text-[18px] sm:text-[22px] font-bold text-center mt-12 italic">
            Вы ещё не создали ни одной заявки о помощи.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 w-full max-w-[1000px]">
            {requests.map((request) => (
              <div key={request.id} className="flex flex-col gap-3 group">
                <div className="bg-[#E6E1D8] border-[4px] border-[#8E8981] rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-[4px_4px_10px_rgba(0,0,0,0.1)] transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold space-y-2">
                    <h3 className="underline decoration-[#D1B89B] decoration-2 mb-2 text-[20px] sm:text-[24px]">
                      {request.title}
                    </h3>
                    <p className="text-[16px] sm:text-[18px]">
                      Категория: <span className="text-[#8E8981]">{request.categoryName}</span>
                    </p>
                    <p className="text-[16px] sm:text-[18px]">
                      Необходимое кол-во: <span className="text-[#758A6A]">{request.quantity}</span>
                    </p>
                    <p className="text-[16px] sm:text-[18px]">
                      Статус: <span className={getStatusColor(request.status)}>{getStatusText(request.status)}</span>
                    </p>
                    <p className="text-[16px] sm:text-[18px]">
                      Кто взял: <span className="text-[#8E8981]">{request.volunteerName || '—'}</span>
                    </p>
                  </div>
                </div>
                
                {request.status === 'OnVerification' && (
                  <Link 
                    to="/verify-report"
                    className="bg-[#758A6A] hover:bg-[#5f7454] hover:scale-[1.02] transition-all duration-300 transform-gpu backface-hidden will-change-transform text-white text-[18px] sm:text-[20px] font-serif py-2 rounded-full shadow-md text-center font-bold"
                  >
                    Проверить отчёт
                  </Link>
                )}

                {request.status !== 'Closed' && (
                  <button 
                    onClick={() => handleCloseRequest(request.id)}
                    className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-[1.02] transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] text-[18px] sm:text-[20px] font-serif py-2 rounded-full shadow-md text-center font-bold"
                  >
                    Закрыть заявку
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default ShelterRequests;
