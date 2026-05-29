import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SuccessModal from '../components/SuccessModal';
import WarningModal from '../components/WarningModal';
import ImageLightbox from '../components/ImageLightbox';
import { ProfileIcon, LogoutIcon } from '../components/Icons';

function ReportVerification() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState([]);
  const [photoUrls, setPhotoUrls] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [adminComment, setAdminComment] = useState('');
  const [showAcceptSuccess, setShowAcceptSuccess] = useState(false);
  const [showRejectSuccess, setShowRejectSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(''); // Stores the selected HelpReport.Id
  const [selectedImage, setSelectedImage] = useState(null);

  const selectedRequest = reports.find(r => r.id.toString() === selectedRequestId);
  const selectedPhotoUrl = selectedRequest ? photoUrls[selectedRequest.id] : null;

  const profileLink = user?.role === 'shelter' ? '/shelter-profile' : '/profile';

  useEffect(() => {
    fetchPendingReports();
  }, []);

  const fetchPendingReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/helpreports/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
        
        // Fetch photos securely for all pending reports
        data.forEach(r => {
          fetchPhoto(r.id);
        });
      } else {
        setWarningMessage("Не удалось загрузить отчёты на проверку");
        setShowWarning(true);
      }
    } catch (err) {
      setWarningMessage("Ошибка при подключении к серверу");
      setShowWarning(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhoto = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/helpreports/${reportId}/photo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPhotoUrls(prev => ({ ...prev, [reportId]: url }));
      }
    } catch (err) {
      console.error("Failed to load photo for report", reportId, err);
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(photoUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoUrls]);

  const handleAccept = async () => {
    if (!selectedRequestId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/helpreports/${selectedRequestId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved: true })
      });

      if (response.ok) {
        setShowAcceptSuccess(true);
      } else {
        const data = await response.json();
        setWarningMessage(data.message || "Не удалось одобрить отчет");
        setShowWarning(true);
      }
    } catch (err) {
      setWarningMessage("Ошибка подключения к серверу");
      setShowWarning(true);
    }
  };

  const handleReject = async () => {
    if (!selectedRequestId) return;
    if (!adminComment.trim()) {
      setWarningMessage("Пожалуйста, укажите причину отклонения в поле комментария");
      setShowWarning(true);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/helpreports/${selectedRequestId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved: false, rejectionReason: adminComment })
      });

      if (response.ok) {
        setShowRejectSuccess(true);
      } else {
        const data = await response.json();
        setWarningMessage(data.message || "Не удалось отклонить отчет");
        setShowWarning(true);
      }
    } catch (err) {
      setWarningMessage("Ошибка подключения к серверу");
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
        
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
          <Link to="/shelter-requests" className="bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu backface-hidden will-change-transform text-[#5C4A3D] font-serif font-bold px-4 py-2 sm:px-8 sm:py-3 rounded-[30px] shadow-sm text-sm sm:text-[20px] leading-tight text-center flex items-center justify-center h-[50px] sm:h-[60px]">
            Мои заявки
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

      <main className="flex-1 flex flex-col items-center px-4 sm:px-8 pb-16 w-full max-w-[900px] mx-auto mt-4 sm:mt-0">
        <h1 className="font-serif text-[#5C4A3D] text-[28px] sm:text-[36px] md:text-[42px] leading-[1.2] mb-10 text-center font-bold">
          Проверка отчёта
        </h1>

        {loading ? (
          <div className="text-center text-[#5C4A3D] font-serif text-2xl font-bold mt-10">
            Загрузка отчётов на проверку...
          </div>
        ) : (
          <>
            {/* Selection Section */}
            <div className="w-full mb-10">
              <label htmlFor="request-select" className="block font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold mb-2 ml-1">
                Выберите заявку для проверки:
              </label>
              <select 
                id="request-select"
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="w-full bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-lg h-[50px] sm:h-[60px] px-6 font-serif text-[#5C4A3D] text-[18px] sm:text-[20px] font-bold shadow-[4px_4px_10px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-[#758A6A] appearance-none cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%235C4A3D\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.5em' }}
              >
                <option value="">-- Выберите отчет волонтера --</option>
                {reports.map(req => (
                  <option key={req.id} value={req.id}>
                    {req.requestTitle} (Волонтер: {req.volunteerName})
                  </option>
                ))}
              </select>
            </div>

            {/* Photo Section */}
            <div 
              className={`w-full bg-[#E6E1D8] border-[4px] border-[#8E8981] rounded-lg mb-8 aspect-video flex items-center justify-center overflow-hidden shadow-inner group relative transition-all ${selectedRequest ? 'cursor-zoom-in' : 'opacity-50'}`}
              onClick={() => selectedRequest && setSelectedImage(selectedPhotoUrl)}
            >
              {selectedRequest ? (
                <>
                  <img 
                    src={selectedPhotoUrl || 'https://placehold.co/1200x800/E6E1D8/5C4A3D?text=Загрузка+фото...'} 
                    alt="Отчёт" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </div>
                </>
              ) : (
                <div className="text-center p-8">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 mx-auto text-[#8E8981] mb-4 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6.75a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v12.75a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <p className="font-serif text-[#5C4A3D] text-[20px] sm:text-[24px] font-bold">Сначала выберите заявку</p>
                </div>
              )}
            </div>

            {selectedRequest && selectedRequest.comment && (
              <div className="w-full bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-lg p-6 mb-8 text-[#5C4A3D] font-serif">
                <p className="font-bold text-[18px] sm:text-[20px] mb-1">Комментарий волонтера:</p>
                <p className="text-[16px] sm:text-[18px] italic">"{selectedRequest.comment}"</p>
              </div>
            )}

            {/* Comment Section */}
            <div className="w-full mb-10">
              <textarea 
                placeholder="Комментарий для волонтёра (необязательно, если принимаете, обязательно при отклонении)"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                className="w-full bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-lg p-6 font-serif text-[#5C4A3D] text-[18px] sm:text-[20px] font-bold min-h-[120px] shadow-[4px_4px_10px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-[#758A6A] resize-none"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 w-full max-w-[500px]">
              <button 
                onClick={handleAccept}
                disabled={!selectedRequestId}
                className={`text-white text-[18px] sm:text-[22px] font-serif py-4 rounded-full shadow-md font-bold transition-all ${selectedRequestId ? 'bg-[#758A6A] hover:bg-[#5f7454] hover:scale-105' : 'bg-[#8E8981] opacity-50 cursor-not-allowed'}`}
              >
                Всё верно, закрыть помощь
              </button>
              <button 
                onClick={handleReject}
                disabled={!selectedRequestId}
                className={`text-white text-[18px] sm:text-[22px] font-serif py-4 rounded-full shadow-md font-bold transition-all ${selectedRequestId ? 'bg-red-500 hover:bg-red-600 hover:scale-105' : 'bg-[#8E8981] opacity-50 cursor-not-allowed'}`}
              >
                Отклонить, нужны правки
              </button>
            </div>
          </>
        )}
      </main>

      {/* Success Modals */}
      <SuccessModal 
        isOpen={showAcceptSuccess}
        title="Заявка закрыта!"
        message="Отчёт принят, заявка успешно переведена в статус «Выполнена»."
        onClose={() => navigate('/shelter-requests')}
      />

      <SuccessModal 
        isOpen={showRejectSuccess}
        title="Отправлено на доработку"
        message="Волонтёр получит уведомление о необходимости правок."
        onClose={() => navigate('/shelter-requests')}
      />

      <WarningModal isOpen={showWarning} message={warningMessage} onClose={() => setShowWarning(false)} />

      <ImageLightbox src={selectedImage} onClose={() => setSelectedImage(null)} alt="Фотоотчёт крупным планом" />
    </>
  );
}

export default ReportVerification;
