import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SuccessModal from '../components/SuccessModal';
import WarningModal from '../components/WarningModal';
import { ProfileIcon, LogoutIcon } from '../components/Icons';

function CreateEditRequest() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [showCreateSuccess, setShowCreateSuccess] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createData, setCreateData] = useState({
    categoryId: '',
    title: '',
    quantity: '',
    expiryDate: '',
    description: ''
  });

  const [editData, setEditData] = useState({
    id: '',
    title: '',
    quantity: '',
    expiryDate: '',
    description: ''
  });

  // 1. Загрузка категорий и существующих заявок приюта
  const loadData = async () => {
    try {
      // Категории
      const catRes = await fetch('/api/needcategories');
      const catData = await catRes.json();
      setCategories(catData);

      // Заявки
      const reqRes = await fetch('/api/needrequests');
      const reqData = await reqRes.json();
      // Фильтруем только те, которые принадлежат текущему приюту
      if (user) {
        const shelterReqs = reqData.filter(r => r.shelterName === user.name && r.status !== 'Closed');
        setMyRequests(shelterReqs);
      }
    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login-shelter');
    } else if (user && user.role !== 'shelter') {
      navigate('/profile');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'shelter') {
      loadData();
    }
  }, [user]);

  // Выбор заявки для редактирования
  const handleSelectRequest = (e) => {
    const requestId = parseInt(e.target.value);
    if (!requestId) {
      setEditData({ id: '', title: '', quantity: '', expiryDate: '', description: '' });
      return;
    }
    const selected = myRequests.find(r => r.id === requestId);
    if (selected) {
      setEditData({
        id: selected.id,
        title: selected.title,
        quantity: selected.quantity,
        expiryDate: selected.expiryDate.split('T')[0], // форматируем для input date
        description: selected.description
      });
    }
  };

  // Создание новой заявки
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!createData.categoryId || !createData.title.trim() || !createData.quantity.trim() || !createData.expiryDate || !createData.description.trim()) {
      setWarningMessage("Пожалуйста, заполните все поля формы для создания заявки.");
      setShowWarning(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/needrequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          categoryId: parseInt(createData.categoryId),
          title: createData.title,
          quantity: createData.quantity,
          expiryDate: createData.expiryDate,
          description: createData.description
        })
      });

      const data = await response.json();
      if (response.ok) {
        setShowCreateSuccess(true);
        setCreateData({ categoryId: '', title: '', quantity: '', expiryDate: '', description: '' });
        loadData(); // Перезагружаем список
      } else {
        setWarningMessage(data.message || "Не удалось опубликовать заявку");
        setShowWarning(true);
      }
    } catch (err) {
      setWarningMessage("Ошибка подключения к серверу");
      setShowWarning(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Редактирование существующей заявки
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editData.id || !editData.title.trim() || !editData.quantity.trim() || !editData.expiryDate || !editData.description.trim()) {
      setWarningMessage("Пожалуйста, выберите заявку и заполните все поля для редактирования.");
      setShowWarning(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/needrequests/${editData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editData.title,
          quantity: editData.quantity,
          expiryDate: editData.expiryDate,
          description: editData.description
        })
      });

      const data = await response.json();
      if (response.ok) {
        setShowEditSuccess(true);
        setEditData({ id: '', title: '', quantity: '', expiryDate: '', description: '' });
        loadData(); // Перезагружаем список
      } else {
        setWarningMessage(data.message || "Не удалось изменить заявку");
        setShowWarning(true);
      }
    } catch (err) {
      setWarningMessage("Ошибка подключения к серверу");
      setShowWarning(true);
    } finally {
      setIsSubmitting(false);
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

      <main className="flex-1 flex flex-col items-center px-4 sm:px-8 pb-16 w-full max-w-[800px] mx-auto mt-4 sm:mt-0">
        {user?.role === 'shelter' && user?.isVerified !== true ? (
          user?.hasDocument ? (
            <div className="bg-[#E6E1D8] border-[4px] border-[#D1B89B] rounded-lg p-8 sm:p-10 flex flex-col items-center text-center shadow-[4px_4px_10px_rgba(0,0,0,0.1)] w-full max-w-[600px] mt-12">
              <div className="w-20 h-20 bg-[#D1B89B]/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-[#5C4A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="font-serif text-[#5C4A3D] text-[24px] sm:text-[28px] font-bold mb-4">
                Документы на модерации
              </h2>
              <p className="font-serif text-[#5C4A3D] text-[16px] sm:text-[18px] leading-relaxed mb-6">
                Ваш приют успешно зарегистрирован! Сейчас наши модераторы проверяют загруженные документы. 
                После успешной проверки вы сможете создавать и редактировать заявки на помощь.
              </p>
              <div className="text-[#8E8981] font-serif text-[14px] italic">
                Обычно проверка занимает не более 24 часов. Спасибо за понимание!
              </div>
              <Link to="/shelter-profile" className="mt-8 bg-[#D1B89B] hover:bg-[#bca07e] hover:scale-105 transition-all duration-300 transform-gpu text-[#5C4A3D] font-serif font-bold px-8 py-3 rounded-[30px] shadow-sm text-[18px]">
                Перейти в профиль
              </Link>
            </div>
          ) : (
            <div className="bg-[#E6E1D8] border-[4px] border-red-500/80 rounded-lg p-8 sm:p-10 flex flex-col items-center text-center shadow-[4px_4px_10px_rgba(0,0,0,0.1)] w-full max-w-[600px] mt-12">
              <div className="w-20 h-20 bg-red-100/50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="font-serif text-red-600 text-[24px] sm:text-[28px] font-bold mb-4">
                Документы не загружены
              </h2>
              <p className="font-serif text-[#5C4A3D] text-[16px] sm:text-[18px] leading-relaxed mb-6">
                Для получения доступа к созданию и публикации заявок необходимо предоставить регистрационные документы вашего приюта.
              </p>
              <div className="text-red-500 font-serif text-[14px] italic font-semibold">
                Пожалуйста, перейдите в ваш профиль и загрузите скан-копии документов для верификации.
              </div>
              <Link to="/shelter-profile" className="mt-8 bg-[#758A6A] hover:bg-[#5f7454] hover:scale-105 transition-all duration-300 transform-gpu text-white font-serif font-bold px-8 py-3 rounded-[30px] shadow-sm text-[18px]">
                Загрузить документы
              </Link>
            </div>
          )
        ) : (
          <>
            {/* Create Section */}
            <section className="w-full mb-20">
              <h1 className="font-serif text-[#5C4A3D] text-[28px] sm:text-[36px] md:text-[42px] leading-[1.2] mb-10 text-center font-bold">
                Создание заявки
              </h1>
              
              <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="create-category" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Категория:</label>
                  <select 
                    id="create-category"
                    value={createData.categoryId} 
                    disabled={isSubmitting}
                    onChange={(e) => setCreateData({...createData, categoryId: e.target.value})}
                    className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] px-4 text-[#5C4A3D] font-medium w-full focus:outline-none focus:ring-2 focus:ring-[#758A6A] appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%235C4A3D\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                  >
                    <option value="">-- Выберите категорию нужды --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label htmlFor="create-title" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Заголовок:</label>
                  <input 
                    id="create-title"
                    type="text" value={createData.title} disabled={isSubmitting}
                    onChange={(e) => setCreateData({...createData, title: e.target.value})}
                    placeholder="Например: Срочно нужен сухой корм"
                    className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] px-4 text-[#5C4A3D] font-medium w-full focus:outline-none focus:ring-2 focus:ring-[#758A6A]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="create-quantity" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Количество:</label>
                  <input 
                    id="create-quantity"
                    type="text" value={createData.quantity} disabled={isSubmitting}
                    onChange={(e) => setCreateData({...createData, quantity: e.target.value})}
                    placeholder="Например: 15 кг / 10 упаковок"
                    className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] px-4 text-[#5C4A3D] font-medium w-full focus:outline-none focus:ring-2 focus:ring-[#758A6A]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="create-expiry" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Срок актуальности:</label>
                  <input 
                    id="create-expiry"
                    type="date" value={createData.expiryDate} disabled={isSubmitting}
                    onChange={(e) => setCreateData({...createData, expiryDate: e.target.value})}
                    className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] px-4 text-[#5C4A3D] font-medium w-full focus:outline-none focus:ring-2 focus:ring-[#758A6A]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="create-description" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Описание:</label>
                  <textarea 
                    id="create-description"
                    rows="6" value={createData.description} disabled={isSubmitting}
                    onChange={(e) => setCreateData({...createData, description: e.target.value})}
                    placeholder="Подробно опишите, что требуется..."
                    className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md shadow-[4px_4px_10px_rgba(0,0,0,0.15)] p-4 text-[#5C4A3D] font-medium w-full focus:outline-none focus:ring-2 focus:ring-[#758A6A] resize-none"
                  ></textarea>
                </div>
                
                <div className="flex justify-center mt-6">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-[#758A6A] hover:bg-[#5f7454] hover:scale-105 disabled:bg-gray-400 disabled:scale-100 transition-all text-white text-[20px] sm:text-[24px] px-12 py-3 rounded-[40px] shadow-md font-serif w-full sm:w-auto font-bold"
                  >
                    {isSubmitting ? "Публикация..." : "Опубликовать"}
                  </button>
                </div>
              </form>
            </section>

            {/* Edit Section */}
            <section className="w-full">
              <h2 className="font-serif text-[#5C4A3D] text-[28px] sm:text-[36px] md:text-[42px] leading-[1.2] mb-10 text-center font-bold">
                Редактирование заявки
              </h2>
              
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-select" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Выберите заявку:</label>
                  <select 
                    id="edit-select"
                    value={editData.id} 
                    disabled={isSubmitting}
                    onChange={handleSelectRequest}
                    className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] px-4 text-[#5C4A3D] font-medium w-full focus:outline-none focus:ring-2 focus:ring-[#758A6A] appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%235C4A3D\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                  >
                    <option value="">-- Выберите заявку для редактирования --</option>
                    {myRequests.map(req => (
                      <option key={req.id} value={req.id}>{req.title} ({req.categoryName})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-title" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Заголовок:</label>
                  <input 
                    id="edit-title"
                    type="text" value={editData.title} disabled={isSubmitting || !editData.id}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] px-4 text-[#5C4A3D] font-medium w-full focus:outline-none focus:ring-2 focus:ring-[#758A6A] disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-quantity" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Количество:</label>
                  <input 
                    id="edit-quantity"
                    type="text" value={editData.quantity} disabled={isSubmitting || !editData.id}
                    onChange={(e) => setEditData({...editData, quantity: e.target.value})}
                    className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] px-4 text-[#5C4A3D] font-medium w-full focus:outline-none focus:ring-2 focus:ring-[#758A6A] disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-expiry" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Срок актуальности:</label>
                  <input 
                    id="edit-expiry"
                    type="date" value={editData.expiryDate} disabled={isSubmitting || !editData.id}
                    onChange={(e) => setEditData({...editData, expiryDate: e.target.value})}
                    className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md h-[46px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] px-4 text-[#5C4A3D] font-medium w-full focus:outline-none focus:ring-2 focus:ring-[#758A6A] disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-description" className="font-serif text-[#5C4A3D] text-[18px] sm:text-[22px] font-bold ml-1">Описание:</label>
                  <textarea 
                    id="edit-description"
                    rows="6" value={editData.description} disabled={isSubmitting || !editData.id}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    className="bg-[#E6E1D8] border-[3px] border-[#8E8981] rounded-md shadow-[4px_4px_10px_rgba(0,0,0,0.15)] p-4 text-[#5C4A3D] font-medium w-full focus:outline-none focus:ring-2 focus:ring-[#758A6A] resize-none disabled:opacity-50"
                  ></textarea>
                </div>
                
                <div className="flex justify-center mt-6">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !editData.id}
                    className="bg-[#758A6A] hover:bg-[#5f7454] hover:scale-105 disabled:bg-gray-400 disabled:scale-100 transition-all text-white text-[20px] sm:text-[24px] px-12 py-3 rounded-[40px] shadow-md font-serif w-full sm:w-auto font-bold"
                  >
                    {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
                  </button>
                </div>
              </form>
            </section>
          </>
        )}
      </main>

      {/* Modals */}
      <WarningModal isOpen={showWarning} message={warningMessage} onClose={() => setShowWarning(false)} />
      <SuccessModal 
        isOpen={showCreateSuccess}
        title="Опубликовано!"
        message="Ваша заявка успешно создана и добавлена в общую ленту."
        onClose={() => setShowCreateSuccess(false)}
      />

      <SuccessModal 
        isOpen={showEditSuccess}
        title="Изменено!"
        message="Данные заявки успешно обновлены."
        onClose={() => setShowEditSuccess(false)}
      />
    </>
  );
}

export default CreateEditRequest;
