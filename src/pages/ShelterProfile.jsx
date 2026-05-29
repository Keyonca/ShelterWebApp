import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SuccessModal from '../components/SuccessModal';
import ImageLightbox from '../components/ImageLightbox';
import { ProfileIcon, LogoutIcon } from '../components/Icons';

function ShelterProfile() {
  const { user, isLoggedIn, updateUser, logout, takeRequest } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const docInputRef = useRef(null);

  const [profilePhoto, setProfilePhoto] = useState(
    user?.avatar 
      ? `data:${user.avatarContentType};base64,${user.avatar}`
      : '/shelter_photo.png'
  );
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
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
      if (user.avatar) {
        setProfilePhoto(`data:${user.avatarContentType};base64,${user.avatar}`);
      } else {
        setProfilePhoto('/shelter_photo.png');
      }
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
    } else {
      takeRequest();
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
        setSelectedPhotoFile(file);
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
    
    if (validImageFiles.length === 0) {
      alert("Пожалуйста, загружайте только изображения (JPEG, PNG).");
      return;
    }

    const singleFile = validImageFiles[0];
    const previewUrl = URL.createObjectURL(singleFile);

    uploadedDocs.forEach(d => d.preview && URL.revokeObjectURL(d.preview));

    setUploadedDocs([{
      file: singleFile,
      preview: previewUrl,
      id: Math.random().toString(36).substring(7),
      name: singleFile.name
    }]);
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (selectedPhotoFile) {
      const token = localStorage.getItem('token');
      const bodyFormData = new FormData();
      bodyFormData.append('avatar', selectedPhotoFile);
      try {
        const res = await fetch('/api/auth/profile/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: bodyFormData
        });
        if (!res.ok) {
          const err = await res.json();
          alert(err.message || err.Message || 'Не удалось сохранить фото профиля');
          return;
        }
      } catch (err) {
        console.error("Ошибка при сохранении фото:", err);
        alert("Ошибка связи с сервером при сохранении фото");
        return;
      }
      setSelectedPhotoFile(null);
    }

    await updateUser({
      name: formData.name,
      legalAddress: formData.legalAddress,
      physicalAddress: formData.physicalAddress,
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

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (uploadedDocs.length === 0) return;

    const token = localStorage.getItem('token');
    const bodyFormData = new FormData();
    bodyFormData.append('document', uploadedDocs[0].file);

    try {
      const res = await fetch('/api/auth/profile/document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: bodyFormData
      });

      if (res.ok) {
        setShowDocSuccess(true);
        uploadedDocs.forEach(doc => {
          if (doc.preview) URL.revokeObjectURL(doc.preview);
        });
        setUploadedDocs([]);
        
        updateUser({ isVerified: false, hasDocument: true });
      } else {
        const err = await res.json();
        alert(err.message || err.Message || "Не удалось отправить документ на верификацию");
      }
    } catch (err) {
      console.error("Ошибка при отправке документа:", err);
      alert("Произошла ошибка связи с сервером при отправке документа");
    }
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
          <p className="font-serif text-[#5C4A3D] text-[18px] sm:text-[20px] text-center mb-8 font-bold">
            Статус:{' '}
            {user.isVerified ? (
              <span className="text-[#758A6A]">Верифицирован</span>
            ) : user.hasDocument ? (
              <span className="text-[#D1B89B]">на модерации</span>
            ) : (
              <span className="text-red-500">документы не загружены</span>
            )}
          </p>

          {user.isVerified ? (
            <div className="bg-[#E6E1D8] border-[4px] border-[#758A6A] rounded-2xl p-8 sm:p-10 w-full mb-8 shadow-[4px_4px_10px_rgba(0,0,0,0.1)] flex flex-col items-center text-center max-w-[600px]">
              <div className="w-16 h-16 bg-[#758A6A]/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-[#758A6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-[#5C4A3D] text-[20px] sm:text-[24px] font-bold mb-3">Доступ подтвержден</h3>
              <p className="font-serif text-[#5C4A3D] text-[16px] sm:text-[18px] leading-relaxed">
                Документы успешно проверены модератором. Вы можете без ограничений публиковать новые нужды приюта и редактировать активные заявки.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-[#E6E1D8] border-[4px] border-[#8E8981] rounded-2xl p-6 sm:p-10 w-full mb-8 shadow-[4px_4px_10px_rgba(0,0,0,0.1)]">
                <h2 className="font-serif text-[#5C4A3D] text-[20px] sm:text-[24px] font-bold mb-2 text-center">
                  Загрузка документов
                </h2>
                <p className="text-[#8E8981] text-sm sm:text-base font-medium mb-6 font-serif text-center">
                  Добавьте сюда свой документ (1 фотография: скан-копия или фото регистрационного документа)
                </p>

                <div
                  className={`relative bg-white border-2 border-dashed ${dragActive ? 'border-[#758A6A] bg-[#f0f4ee]' : 'border-[#b5b1a8]'} rounded-xl p-8 flex flex-col items-center justify-center min-h-[250px] transition-colors`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={docInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {uploadedDocs.length === 0 ? (
                    <div className="flex flex-col items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-[#b5b1a8] mb-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                      </svg>
                      <p className="text-[#8E8981] font-medium text-[16px] sm:text-[18px] text-center">
                        Перетащите изображение сюда или <button type="button" onClick={() => docInputRef.current.click()} className="text-[#5C4A3D] hover:text-[#758A6A] font-bold underline pointer-events-auto transition-colors">выберите файл</button>
                      </p>
                    </div>
                  ) : (
                    <div className="w-full flex justify-center">
                      <div className="relative group rounded-lg overflow-hidden border-2 border-[#8E8981] aspect-square w-[200px] h-[200px] bg-[#E6E1D8]">
                        <img
                          src={uploadedDocs[0].preview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            aria-label="Удалить файл"
                            onClick={() => removeDoc(uploadedDocs[0].id)}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
                            title="Удалить"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
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
            </>
          )}
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
