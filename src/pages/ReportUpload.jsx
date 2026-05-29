import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WarningModal from '../components/WarningModal';
import SuccessModal from '../components/SuccessModal';
import { ProfileIcon, LogoutIcon } from '../components/Icons';

function ReportUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { user, logout, takeRequest } = useAuth();
  
  const [searchParams] = useSearchParams();
  const queryRequestId = searchParams.get('requestId');
  const [selectedRequestId, setSelectedRequestId] = useState(queryRequestId || '');

  const inputRef = useRef(null);
  const navigate = useNavigate();

  const profileLink = user?.role === 'shelter' ? '/shelter-profile' : '/profile';

  const activeRequests = user?.activeRequests?.filter(r => r.status === 'InProgress') || [];
  const selectedRequest = activeRequests.find(r => r.id.toString() === selectedRequestId);

  useEffect(() => {
    if (queryRequestId) {
      setSelectedRequestId(queryRequestId);
    }
  }, [queryRequestId]);

  useEffect(() => {
    return () => {
      files.forEach(fileObj => {
        if (fileObj.preview) {
          URL.revokeObjectURL(fileObj.preview);
        }
      });
    };
  }, [files]);

  const handleDrag = function (e) {
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
      setWarningMessage("Пожалуйста, загружайте только изображения (JPEG, PNG).");
      setShowWarning(true);
      return;
    }

    // Since MVP supports 1 photo, we replace the files array with the latest single image
    const singleFile = validImageFiles[0];
    const previewUrl = URL.createObjectURL(singleFile);

    // Revoke previous previews if any
    files.forEach(f => f.preview && URL.revokeObjectURL(f.preview));

    setFiles([{
      file: singleFile,
      preview: previewUrl,
      id: Math.random().toString(36).substring(7)
    }]);
  };

  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = function (e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const removeFile = (idToRemove) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === idToRemove);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== idToRemove);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequestId) {
      setWarningMessage("Пожалуйста, выберите заявку из списка для отправки отчёта.");
      setShowWarning(true);
      return;
    }
    if (files.length === 0) {
      setWarningMessage("Пожалуйста, загрузите фото для подтверждения помощи (чек, фото переданного товара или питомца).");
      setShowWarning(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('needRequestId', selectedRequestId);
      formData.append('comment', comment);
      formData.append('photo', files[0].file);

      const response = await fetch('/api/helpreports/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        takeRequest();
        setShowSuccess(true);
      } else {
        const data = await response.json();
        setWarningMessage(data.message || "Не удалось отправить отчет о помощи");
        setShowWarning(true);
      }
    } catch (err) {
      setWarningMessage("Не удалось подключиться к серверу для отправки отчёта");
      setShowWarning(true);
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
          <Link
            to={user?.role === 'shelter' ? "/shelter-requests" : "/requests"}
            className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] font-serif font-bold px-4 py-2 sm:px-8 sm:py-3 rounded-[30px] shadow-sm text-sm sm:text-[20px] leading-tight text-center flex items-center justify-center h-[50px] sm:h-[60px]"
          >
            {user?.role === 'shelter' ? 'Мои заявки' : 'Лента заявок'}
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

      <main className="flex-1 flex flex-col items-center px-4 sm:px-8 pb-16 w-full max-w-[900px] mx-auto mt-4 sm:mt-0">
        <h1 className="font-serif text-[#5C4A3D] text-[28px] sm:text-[36px] md:text-[42px] leading-[1.2] mb-10 sm:mb-12 text-center font-bold">
          Заполните форму для подтверждения
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
          
          {/* Dropdown Selection */}
          <div className="w-full">
            <label htmlFor="request-select" className="block font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold mb-2 ml-1">
              Выберите заявку для отчёта:
            </label>
            <select 
              id="request-select"
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              className="w-full bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-lg h-[50px] sm:h-[60px] px-6 font-serif text-[#5C4A3D] text-[18px] sm:text-[20px] font-bold shadow-[4px_4px_10px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-[#758A6A] appearance-none cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%235C4A3D\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.5em' }}
            >
              <option value="">-- Выберите заявку --</option>
              {activeRequests.map(req => (
                <option key={req.id} value={req.id}>
                  {req.category} для приюта «{req.shelterName}» ({req.status === 'OnVerification' ? 'Требуются правки' : 'В работе'})
                </option>
              ))}
            </select>
            {selectedRequest && (selectedRequest.rejectionReason || selectedRequest.RejectionReason) && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mt-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-red-700 font-serif font-bold text-[16px] sm:text-[18px]">
                  ⚠️ Предыдущий отчёт был отклонён приютом для доработки:
                </p>
                <p className="text-red-600 font-serif italic mt-1 text-[16px]">
                  "{selectedRequest.rejectionReason || selectedRequest.RejectionReason}"
                </p>
              </div>
            )}
            {activeRequests.length === 0 && (
              <p className="text-red-600 font-serif text-sm sm:text-base font-bold mt-2 ml-1">
                ⚠️ У вас нет активных забронированных заявок. Пожалуйста, выберите заявку в Ленте!
              </p>
            )}
          </div>

          {/* Upload Box */}
          <div className="bg-[#E6E1D8] border-[4px] border-[#8E8981] rounded-2xl p-6 sm:p-10 shadow-[4px_4px_10px_rgba(0,0,0,0.1)] w-full">
            <h2 className="font-serif text-[#5C4A3D] text-[20px] sm:text-[24px] font-bold mb-2">
              Загрузка документов
            </h2>
            <p className="text-[#8E8981] text-sm sm:text-base font-medium mb-6 font-serif">
              Добавьте сюда своё подтверждение (1 фотография: чек или фото переданной помощи)
            </p>

            <div
              className={`relative bg-white border-2 border-dashed ${dragActive ? 'border-[#758A6A] bg-[#f0f4ee]' : 'border-[#b5b1a8]'} rounded-xl p-8 flex flex-col items-center justify-center min-h-[250px] transition-colors`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />

              {files.length === 0 ? (
                <div className="flex flex-col items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-[#b5b1a8] mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                  </svg>
                  <p className="text-[#8E8981] font-medium text-[16px] sm:text-[18px] text-center">
                    Перетащите изображение сюда или <button type="button" onClick={onButtonClick} className="text-[#5C4A3D] hover:text-[#758A6A] font-bold underline pointer-events-auto transition-colors">выберите файл</button>
                  </p>
                </div>
              ) : (
                <div className="w-full flex justify-center">
                  <div className="relative group rounded-lg overflow-hidden border-2 border-[#8E8981] aspect-square w-[200px] h-[200px] bg-[#E6E1D8]">
                    <img
                      src={files[0].preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        aria-label="Удалить файл"
                        onClick={() => removeFile(files[0].id)}
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

          {/* Comment Box */}
          <div className="bg-[#E6E1D8] border-[4px] border-[#8E8981] rounded-2xl shadow-[4px_4px_10px_rgba(0,0,0,0.1)] w-full overflow-hidden">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="[Добавьте комментарий о выполнении заявки]"
              className="w-full h-[150px] sm:h-[180px] bg-transparent resize-none p-6 text-[#5C4A3D] font-serif font-bold text-[18px] sm:text-[22px] placeholder:text-[#5C4A3D]/60 placeholder:text-center focus:outline-none focus:bg-[#dfdad1] transition-colors"
            />
          </div>

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={activeRequests.length === 0}
              className={`text-[20px] sm:text-[24px] font-serif py-3 sm:py-4 px-12 sm:px-20 rounded-full shadow-md w-full max-w-[400px] transition-all duration-300 transform-gpu backface-hidden will-change-transform ${activeRequests.length === 0 ? 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-50' : 'bg-[#758A6A] hover:bg-[#5f7454] hover:scale-105 text-white hover:shadow-lg'}`}
            >
              Отчитаться
            </button>
          </div>
        </form>
      </main>

      <WarningModal isOpen={showWarning} message={warningMessage} onClose={() => setShowWarning(false)} />
      <SuccessModal
        isOpen={showSuccess}
        title="Отчет отправлен!"
        message="Спасибо за вашу помощь! Отчет отправлен на проверку администратору приюта."
        onClose={() => setShowSuccess(false)}
        buttonText="К списку заявок"
        buttonLink="/requests"
      />
    </>
  );
}

export default ReportUpload;
