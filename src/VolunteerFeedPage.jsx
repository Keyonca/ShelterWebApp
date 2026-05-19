import React, { useState } from 'react';
import VolunteerHeader from './VolunteerHeader';

const MOCK_NEEDS = [
    {
        id: 1,
        shelter: 'Приют "Верный друг"',
        category: 'Корм',
        description: 'Нужен сухой корм для крупных собак, 2 мешка по 15 кг.',
        deadline: 'до 30 апреля',
        status: 'Открыта'
    },
    {
        id: 2,
        shelter: 'Приют "Кошкин дом"',
        category: 'Медикаменты',
        description: 'Срочно нужны капли от блох и клещей для 10 кошек.',
        deadline: 'до 28 апреля',
        status: 'Открыта'
    },
    {
        id: 3,
        shelter: 'Центр "Хвостики"',
        category: 'Руки/Выгул',
        description: 'Нужна помощь с выгулом 3 активных собак в эту субботу.',
        deadline: 'до 25 апреля',
        status: 'Открыта'
    },
    {
        id: 4,
        shelter: 'Приют "Надежда"',
        category: 'Транспорт',
        description: 'Нужно отвезти собаку в клинику на осмотр (крупная порода).',
        deadline: 'до 26 апреля',
        status: 'Открыта'
    }
];

const FeedCard = ({ need }) => {
    return (
        <div className="bg-[#EAE4DC] border-[3px] border-[#B8AFA3] rounded-md p-6 flex flex-col justify-between h-full shadow-[0_4px_6px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center gap-2 mb-6 text-[#5E4C3C] font-serif">
                <span className="font-bold text-xl md:text-2xl leading-tight">[{need.shelter}]</span>
                <span className="font-bold text-lg md:text-xl">[{need.category}]</span>
                <span className="text-base md:text-lg">[{need.description}]</span>
                <span className="text-base md:text-lg font-bold">[{need.deadline}]</span>
                <span className="text-base md:text-lg">[{`Статус: "${need.status}"`}]</span>
            </div>
            
            <button className="w-full bg-[#788C69] text-white py-3 md:py-4 rounded-full font-serif text-lg md:text-xl shadow-[0_4px_8px_rgba(120,140,105,0.4)] transition-all duration-300 hover:bg-[#687C5A] hover:shadow-[0_6px_12px_rgba(104,124,90,0.5)] hover:-translate-y-1 active:translate-y-0 active:shadow-md">
                Хочу помочь
            </button>
        </div>
    );
};

export default function VolunteerFeedPage({ onGoToReport, onGoToProfile, onLogout }) {
    return (
        <div className="min-h-screen font-serif flex flex-col bg-gradient-to-br from-[#FAEEE1] via-[#F4DFC8] to-[#EBD3BA] overflow-x-hidden text-[#5C4A3D]">
            <VolunteerHeader 
                currentPage="volunteer-feed" 
                onGoToReport={onGoToReport} 
                onGoToProfile={onGoToProfile} 
                onLogout={onLogout} 
            />

            <main className="flex flex-col items-center flex-1 w-full px-4 md:px-8 max-w-[1200px] mx-auto pb-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-center leading-tight mb-8 md:mb-12 mt-4 drop-shadow-sm text-[#5C4A3D]">
                    Что нужно прямо сейчас
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full max-w-[1000px]">
                    {MOCK_NEEDS.map(need => (
                        <FeedCard key={need.id} need={need} />
                    ))}
                </div>
            </main>

            <footer className="w-full text-center py-6 md:py-8 font-medium opacity-80 text-base md:text-lg mt-auto">
                © 2026 ЛПК
            </footer>
        </div>
    );
}
