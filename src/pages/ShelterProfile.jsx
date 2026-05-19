import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SuccessModal from '../components/SuccessModal';
import ImageLightbox from '../components/ImageLightbox';
import { ProfileIcon, LogoutIcon } from '../components/Icons';

function ShelterProfile() {
  const { user, isLoggedIn, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const docInputRef = useRef(null);

  const [profilePhoto, setProfilePhoto] = useState('/shelter_photo.png');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDocSuccess, setShowDocSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    legalAddress: user?.legalAddress || '',
    physicalAddress: user?.physicalAddress || '',
    phone: user?.phone || '',
    email: user?.email || '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        legalAddress: user.legalAddress || '',
        physicalAddress: user.physicalAddress || '',
        phone: user.phone || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    return () => {
      uploadedDocs.forEach(doc => {
        if (doc.preview) URL.revokeObjectURL(doc.preview);
      });
    };
  }, [uploadedDocs]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login-shelter');
    } else if (user?.role !== 'shelter') {
      navigate('/profile');
    }
  }, [isLoggedIn, user, navigate]);

  const handleAvatarClick = () => {
    avatarInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setProfilePhoto(previewUrl);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = (newFiles) => {
    const validImageFiles = Array.from(newFiles).filter(file => file.type.startsWith('image/'));
    const newDocs = validImageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7),
      name: file.name
    }));
    setUploadedDocs(prev => [...prev, ...newDocs]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const removeDoc = (id) => {
    setUploadedDocs(prev => {
      const doc = prev.find(d => d.id === id);
      if (doc && doc.preview) URL.revokeObjectURL(doc.preview);
      return prev.filter(d => d.id !== id);
    });
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    updateUser({
      name: formData.name,
      legalAddress: formData.legalAddress,
      physicalAddress: formData.physicalAddress,
      phone: formData.phone,
      email: formData.email
    });
    setShowSuccess(true);
  };

  const handleDocSubmit = (e) => {
    e.preventDefault();
    if (uploadedDocs.length === 0) return;
    setShowDocSuccess(true);
  };

  if (!user || user.role !== 'shelter') return null;

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
          <Link to="/create-request" className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] font-serif font-bold px-4 py-2 sm:px-6 sm:py-2 rounded-[30px] shadow-sm text-sm sm:text-base leading-tight text-center flex items-center justify-center h-[50px] sm:h-[60px]">
            Создание/<br />редактирование заявки
          </Link>
          <Link to="/verify-report" className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] font-serif font-bold px-4 py-2 sm:px-6 sm:py-2 rounded-[30px] shadow-sm text-sm sm:text-base leading-tight text-center flex items-center justify-center h-[50px] sm:h-[60px]">
            Проверка<br />фотоотчёта
          </Link>
          <Link to="/shelter-requests" className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] font-serif font-bold px-4 py-2 sm:px-8 sm:py-3 rounded-[30px] shadow-sm text-sm sm:text-[20px] leading-tight text-center flex items-center justify-center h-[50px] sm:h-[60px]">
            Мои заявки
          </Link>
          <Link to="/shelter-profile" className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform rounded-full shadow-sm flex items-center justify-center w-[50px] h-[50px] sm:w-[60px] sm:h-[60px]">
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

      <main className="flex-1 flex flex-col px-4 sm:px-8 pb-16 w-full max-w-[1000px] mx-auto mt-4 sm:mt-0">
        <h1 className="font-serif text-[#5C4A3D] text-[28px] sm:text-[36px] md:text-[42px] leading-[1.2] mb-10 text-center font-bold">
          Профиль приюта
        </h1>

        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-16">
          <div className="w-full md:w-[350px] flex-shrink-0 flex justify-center">
            <div
              className="relative w-[300px] h-[300px] border-[4px] border-[#8E8981] rounded-lg overflow-hidden cursor-pointer group shadow-[4px_4px_10px_rgba(0,0,0,0.1)] transition-transform hover:scale-[1.02]"
              onClick={handleAvatarClick}
            >
              <img src={profilePhoto} alt="Shelter Profile" className="w-full h-full object-cover bg-[#E6E1D8]" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-serif font-bold text-lg px-4 text-center">Изменить фото</span>
              </div>
              <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center text-[#5C4A3D] font-serif">
            <h2 className="text-[24px] sm:text-[32px] font-bold mb-4">{user.name || 'Название приюта'}</h2>
            <div className="space-y-2 text-[18px] sm:text-[22px] font-bold">
              <p>Юридический адрес: {user.legalAddress || 'Не указан'}</p>
              <p>Фактический адрес: {user.physicalAddress || 'Не указан'}</p>
              <p>Телефон: {user.phone || 'Не указан'}</p>
              <p>Email: {user.email}</p>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <section className="mb-20 flex flex-col items-center">
          <h2 className="font-serif text-[#5C4A3D] text-[24px] sm:text-[32px] font-bold text-center mb-2">Настройки профиля</h2>
          <p className="font-serif text-[#5C4A3D] text-[18px] sm:text-[20px] text-center mb-8">Введите новые данные для изменения информации</p>

          <form onSubmit={handleFormSubmit} className="w-full max-w-[600px] flex flex-col gap-5">
            {[
              { label: 'Название:', name: 'name', type: 'text' },
              { label: 'Юр. адрес:', name: 'legalAddress', type: 'text' },
              { label: 'Фактический адрес:', name: 'physicalAddress', type: 'text' },
              { label: 'Номер телефона:', name: 'phone', type: 'tel' },
              { label: 'Email:', name: 'email', type: 'email' },
              { label: 'Пароль:', name: 'password', type: 'password' },
            ].map(field => (
              <div key={field.name} className="flex flex-col gap-1">
                <label className="font-serif text-[#5C4A3D] text-[18px] sm:text-[20px] font-bold ml-1">{field.label}</label>
                <input
                  type={field.type} name={field.name} value={formData[field.name]} onChange={handleFormChange}
                  className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] px-4 text-[#5C4A3D] font-medium w-full focus:outline-none focus:ring-2 focus:ring-[#758A6A]"
                />
              </div>
            ))}
            <div className="flex justify-center mt-6">
              <button type="submit" className="bg-[#758A6A] hover:bg-[#5f7454] hover:scale-105 transition-all text-white text-[20px] sm:text-[24px] px-16 py-3 rounded-[40px] shadow-md font-serif w-full sm:w-auto">Изменить</button>
            </div>
          </form>
        </section>

        {/* Verification Section */}
        <section className="flex flex-col items-center">
          <h2 className="font-serif text-[#5C4A3D] text-[24px] sm:text-[32px] font-bold text-center mb-2">Верификация приюта</h2>
          <p className="font-serif text-[#5C4A3D] text-[18px] sm:text-[20px] text-center mb-8">
            Статус: <span className="text-[#D1B89B]">на модерации</span>
          </p>

          <div className="bg-[#E6E1D8] border-[4px] border-[#8E8981] rounded-2xl p-6 sm:p-10 w-full mb-8 shadow-[4px_4px_10px_rgba(0,0,0,0.1)]">
            <h3 className="font-serif text-[#5C4A3D] text-[20px] sm:text-[24px] font-bold mb-6 text-center">Загрузите документы:</h3>
            <div
              className={`relative bg-[#E6E1D8] border-2 border-dashed ${dragActive ? 'border-[#758A6A] bg-[#f0f4ee]' : 'border-[#8E8981]'} rounded-xl p-8 flex flex-col items-center justify-center min-h-[250px] transition-colors cursor-pointer`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => docInputRef.current.click()}
            >
              <input
                ref={docInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadedDocs.length === 0 ? (
                <div className="flex flex-col items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-[#8E8981] mb-4 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                  </svg>
                  <p className="text-[#5C4A3D] font-serif font-bold text-center">
                    Перетащите файлы сюда или нажмите для выбора
                  </p>
                </div>
              ) : (
                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {uploadedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="relative group rounded-lg overflow-hidden border-2 border-[#8E8981] aspect-square bg-white shadow-sm transition-transform hover:scale-[1.02] cursor-zoom-in"
                        onClick={() => setSelectedImage(doc.preview)}
                      >
                        <img
                          src={doc.preview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            aria-label="Удалить документ"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDoc(doc.id);
                            }}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors transform hover:scale-110 shadow-lg cursor-pointer"
                            title="Удалить"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => docInputRef.current.click()}
                      className="rounded-lg border-2 border-dashed border-[#8E8981] aspect-square flex flex-col items-center justify-center text-[#8E8981] hover:text-[#5C4A3D] hover:border-[#5C4A3D] hover:bg-[#dfdad1] transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 mb-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span className="font-bold text-sm">Ещё</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleDocSubmit}
            disabled={uploadedDocs.length === 0}
            className={`text-white text-[20px] sm:text-[24px] px-16 py-3 rounded-[40px] shadow-md font-serif transition-all ${uploadedDocs.length > 0 ? 'bg-[#758A6A] hover:bg-[#5f7454] hover:scale-105' : 'bg-[#8E8981] opacity-50 cursor-not-allowed'}`}
          >
            Отправить
          </button>


          <p className="mt-8 text-red-500 font-bold text-center font-serif text-[16px] sm:text-[20px]">
            Примечание: пока статус не «Верифицирован», создавать заявки нельзя!
          </p>
        </section>
      </main>

      {/* Modals */}
      <SuccessModal
        isOpen={showSuccess}
        title="Успешно!"
        message="Данные профиля успешно обновлены!"
        onClose={() => setShowSuccess(false)}
      />

      <SuccessModal
        isOpen={showDocSuccess}
        title="Отправлено!"
        message="Документы отправлены на проверку. Мы уведомим вас об изменении статуса."
        onClose={() => setShowDocSuccess(false)}
        buttonText="Понятно"
      />
      <ImageLightbox src={selectedImage} onClose={() => setSelectedImage(null)} />
    </>
  );
}

export default ShelterProfile;
