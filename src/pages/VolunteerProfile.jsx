import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SuccessModal from '../components/SuccessModal';
import { ProfileIcon, LogoutIcon } from '../components/Icons';

function VolunteerProfile() {
  const { user, isLoggedIn, updateUser, logout } = useAuth();
  const closedRequests = user?.activeRequests?.filter(r => r.status === 'Closed') || [];
  const activeRequests = user?.activeRequests?.filter(r => r.status === 'InProgress' || r.status === 'OnVerification') || [];
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profilePhoto, setProfilePhoto] = useState('/volunteer_photo.png');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    password: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login-volunteer');
    }
  }, [isLoggedIn, navigate]);

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setProfilePhoto(previewUrl);
      }
    }
  };

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (profilePhoto && profilePhoto !== '/volunteer_photo.png') {
        URL.revokeObjectURL(profilePhoto);
      }
    };
  }, [profilePhoto]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      password: formData.password || undefined
    });
    setFormData(prev => ({
      ...prev,
      password: ''
    }));
    setShowSuccess(true);
  };

  if (!user) return null;

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
          <Link to="/requests" className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] font-serif font-bold px-4 py-2 sm:px-8 sm:py-3 rounded-[30px] shadow-sm text-sm sm:text-[20px] leading-tight text-center flex items-center justify-center h-[50px] sm:h-[60px]">
            Лента заявок
          </Link>
          <Link to="/profile" className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform rounded-full shadow-sm flex items-center justify-center w-[50px] h-[50px] sm:w-[60px] sm:h-[60px]">
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

      <main className="flex-1 flex flex-col px-4 sm:px-8 pb-16 w-full max-w-[900px] mx-auto mt-4 sm:mt-0">
        <h1 className="font-serif text-[#5C4A3D] text-[28px] sm:text-[36px] md:text-[42px] leading-[1.2] mb-10 text-center font-bold">
          Личный кабинет
        </h1>

        {/* Top Section: Photo and Info */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12">
          {/* Photo */}
          <div className="w-full md:w-[350px] flex-shrink-0 flex justify-center">
            <div
              className="relative w-[300px] h-[300px] border-[4px] border-[#8E8981] rounded-lg overflow-hidden cursor-pointer group shadow-[4px_4px_10px_rgba(0,0,0,0.1)] transition-transform hover:scale-[1.02]"
              onClick={handlePhotoClick}
            >
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover bg-[#E6E1D8]"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-serif font-bold text-lg px-4 text-center">
                  Нажмите, чтобы<br />изменить фото
                </span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col justify-center text-[#5C4A3D] font-serif">
            <p className="text-[20px] sm:text-[24px] font-bold mb-2">Имя: {user.name || 'Аноним'}</p>
            <p className="text-[20px] sm:text-[24px] font-bold mb-2">Номер телефона: {user.phone || 'Не указан'}</p>
            <p className="text-[20px] sm:text-[24px] font-bold mb-6">email: {user.email}</p>

            <p className="text-[20px] sm:text-[24px] font-bold mb-4">Спасено хвостиков: {user.totalHelped ?? 0}</p>

            <p className="text-[20px] sm:text-[24px] font-bold mb-2">История помощи:</p>
            {closedRequests.length === 0 ? (
              <p className="text-[18px] sm:text-[20px] text-[#8E8981] mb-6 italic pl-6">История добрых дел пуста.</p>
            ) : (
              <ul className="list-disc pl-6 text-[18px] sm:text-[20px] font-bold space-y-1 text-[#8E8981] mb-6">
                {closedRequests.map((item, idx) => (
                  <li key={idx}>
                    {item.date} приют «{item.shelterName}» — {item.category} [Статус "<span className="text-[#758A6A]">Выполнено</span>"]
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Middle Section: Active Requests */}
        <div className="font-serif text-[#5C4A3D] mb-16">
          <p className="text-[20px] sm:text-[24px] font-bold mb-4">Статус заявок:</p>
          {activeRequests.length === 0 ? (
            <p className="text-[18px] sm:text-[20px] text-[#8E8981] mb-8 italic pl-6">У вас пока нет активных заявок.</p>
          ) : (
            <ul className="list-disc pl-6 text-[18px] sm:text-[20px] font-bold space-y-2 mb-8 text-[#8E8981]">
              {activeRequests.map((req, index) => {
                let statusText = "В работе";
                let statusColor = "text-[#D1B89B]"; // жёлтый для В работе
                if (req.status === 'OnVerification') {
                  statusText = "На проверке";
                  statusColor = "text-[#758A6A]"; // зелёный для На проверке
                }
                return (
                  <li key={index}>
                    {req.category} для {req.shelterName} — Статус "<span className={statusColor}>{statusText}</span>"
                  </li>
                );
              })}
            </ul>
          )}

          <p className="text-[20px] sm:text-[24px] font-bold mb-4">Сейчас волонтер помогает:</p>
          {activeRequests.length === 0 ? (
            <p className="text-[18px] sm:text-[20px] text-[#8E8981] mb-8 italic pl-6">Нет активных приютов.</p>
          ) : (
            <ul className="list-disc pl-6 text-[18px] sm:text-[20px] font-bold space-y-2 text-[#8E8981]">
              {/* Distinct active shelters with real contact info */}
              {(() => {
                const uniqueShelters = [];
                activeRequests.forEach(req => {
                  if (!uniqueShelters.find(s => s.name === req.shelterName)) {
                    uniqueShelters.push({
                      name: req.shelterName,
                      phone: req.shelterPhone,
                      address: req.shelterAddress
                    });
                  }
                });
                return uniqueShelters.map((shelter, index) => (
                  <li key={index}>
                    «{shelter.name}» (тел: {shelter.phone || 'Не указан'}, адрес: {shelter.address || 'Не указан'})
                  </li>
                ));
              })()}
            </ul>
          )}
        </div>

        {/* Bottom Section: Settings Form */}
        <div className="flex flex-col items-center w-full max-w-[600px] mx-auto">
          <h2 className="font-serif text-[#5C4A3D] text-[24px] sm:text-[30px] font-bold text-center mb-2">
            Настройки профиля
          </h2>
          <p className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] text-center mb-8">
            Введите новые данные для изменения информации
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="vol-name" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Имя:</label>
              <input
                id="vol-name"
                type="text" name="name" value={formData.name} onChange={handleChange}
                className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-[#758A6A] px-4 text-[#5C4A3D] font-medium text-base w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="vol-phone" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Номер телефона:</label>
              <input
                id="vol-phone"
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-[#758A6A] px-4 text-[#5C4A3D] font-medium text-base w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="vol-email" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Email:</label>
              <input
                id="vol-email"
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-[#758A6A] px-4 text-[#5C4A3D] font-medium text-base w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="vol-password" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Пароль:</label>
              <input
                id="vol-password"
                type="password" name="password" value={formData.password} onChange={handleChange}
                className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-[#758A6A] px-4 text-[#5C4A3D] font-medium text-base w-full"
              />
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="bg-[#758A6A] hover:bg-[#5f7454] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform text-white text-[20px] sm:text-[24px] px-16 py-3 rounded-[40px] shadow-md hover:shadow-lg font-serif w-full sm:w-auto"
              >
                Изменить
              </button>
            </div>
          </form>
        </div>
      </main>

      <SuccessModal
        isOpen={showSuccess}
        title="Успешно!"
        message="Данные профиля успешно обновлены!"
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}

export default VolunteerProfile;
