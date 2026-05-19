import React, { useState, useRef } from 'react';
import VolunteerHeader from './VolunteerHeader';

export default function VolunteerReportFormPage({ onGoToFeed, onGoToProfile, onLogout }) {
    const [comment, setComment] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            setUploadedFiles(prev => [...prev, ...filesArray]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const filesArray = Array.from(e.dataTransfer.files);
            setUploadedFiles(prev => [...prev, ...filesArray]);
        }
    };

    const removeFile = (indexToRemove) => {
        setUploadedFiles(files => files.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setComment('');
            setUploadedFiles([]);
            if(onGoToFeed) onGoToFeed(); // Возвращаем в ленту после успешной отправки
        }, 2000);
    };

    return (
        <div className="min-h-screen font-serif flex flex-col bg-gradient-to-br from-[#FAEEE1] via-[#F4DFC8] to-[#EBD3BA] overflow-x-hidden text-[#5C4A3D]">
            <VolunteerHeader 
                currentPage="volunteer-report" 
                onGoToFeed={onGoToFeed} 
                onGoToProfile={onGoToProfile} 
                onLogout={onLogout} 
            />

            <main className="flex flex-col items-center flex-1 w-full px-4 md:px-8 max-w-[800px] mx-auto pb-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-center leading-tight mb-8 md:mb-12 mt-4 drop-shadow-sm text-[#5C4A3D]">
                    Заполните форму для подтверждения
                </h1>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 md:gap-8">
                    {/* Drag and drop area */}
                    <div className="bg-[#EAE4DC] border-[3px] border-[#B8AFA3] rounded-md p-6 md:p-8 flex flex-col shadow-[0_4px_6px_rgba(0,0,0,0.05)]">
                        <h2 className="font-bold text-xl md:text-2xl text-[#5E4C3C] mb-2 font-serif">Загрузка документов</h2>
                        <p className="text-sm md:text-base text-[#8B7C6E] mb-6">
                            Добавьте сюда свои документы: чек, фото переданного товара, фото животного
                        </p>
                        
                        <div 
                            className={`border-2 border-dashed ${isDragging ? 'border-[#788C69] bg-white/80' : 'border-[#B8AFA3] bg-white/50'} rounded-lg p-12 md:p-16 flex flex-col items-center justify-center hover:bg-white/70 transition-colors cursor-pointer`}
                            onClick={() => fileInputRef.current.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input 
                                type="file" 
                                multiple 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*,.pdf"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-12 h-12 ${isDragging ? 'text-[#788C69]' : 'text-[#B8AFA3]'} mb-4 transition-colors`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                            </svg>
                            <p className="text-[#8B7C6E] font-medium text-center">
                                Drag your file(s) or <span className="underline decoration-[#8B7C6E]/50 underline-offset-2">browse</span>
                            </p>
                        </div>

                        {/* Список загруженных файлов */}
                        {uploadedFiles.length > 0 && (
                            <div className="mt-4 flex flex-col gap-2">
                                <h3 className="font-bold text-[#5E4C3C] mb-1">Выбранные файлы:</h3>
                                {uploadedFiles.map((file, index) => (
                                    <div key={index} className="flex justify-between items-center bg-white/60 p-2 rounded border border-[#B8AFA3]/50">
                                        <span className="text-sm truncate mr-4" title={file.name}>{file.name}</span>
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                            className="text-red-500 hover:text-red-700 font-bold px-2"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Comment area */}
                    <div className="bg-[#EAE4DC] border-[3px] border-[#B8AFA3] rounded-md shadow-[0_4px_6px_rgba(0,0,0,0.05)] overflow-hidden">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="[Комментарий к выполнению]"
                            className="w-full h-32 md:h-40 p-6 bg-transparent resize-none focus:outline-none focus:bg-white/30 transition-colors text-lg font-serif placeholder-[#A39686] text-[#5E4C3C]"
                        ></textarea>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-[#788C69] text-white py-4 md:py-5 rounded-full font-serif text-xl md:text-2xl shadow-[0_4px_10px_rgba(120,140,105,0.4)] transition-all duration-300 hover:bg-[#687C5A] hover:shadow-[0_6px_14px_rgba(104,124,90,0.5)] hover:-translate-y-1 active:translate-y-0 active:shadow-md"
                    >
                        Отчитаться
                    </button>

                    <div className={`transition-all duration-500 overflow-hidden ${isSubmitted ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                        <div className="p-4 bg-emerald-100 border-2 border-emerald-300 text-emerald-800 rounded-xl text-center font-bold text-lg shadow-sm">
                            Отчёт успешно отправлен! Возвращаем в ленту...
                        </div>
                    </div>
                </form>
            </main>

            <footer className="w-full text-center py-6 md:py-8 font-medium opacity-80 text-base md:text-lg mt-auto">
                © 2026 ЛПК
            </footer>
        </div>
    );
}
