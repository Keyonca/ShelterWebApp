import React from 'react';
import { useAuth } from '../contexts/AuthContext';


export const ProfileIcon = ({ role = 'volunteer', className = "w-8 h-8 sm:w-10 sm:h-10" }) => {
  const src = role === 'shelter' ? '/shelter_profile.png' : '/volunteer_profile.png';
  return (
    <img
      src={src}
      alt="Профиль"
      className={`${className} object-contain`}
    />
  );
};

export const LogoutIcon = ({ className = "w-6 h-6 sm:w-7 sm:h-7" }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 4H6C4.89543 4 4 4.89543 4 6V26C4 27.1046 4.89543 28 6 28H12" stroke="#5C4A3D" strokeWidth="3" strokeLinecap="round" />
    <path d="M20 10L26 16L20 22" stroke="#5C4A3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 16H26" stroke="#5C4A3D" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const GroupIcon = ({ className = "w-8 h-8 sm:w-10 sm:h-10" }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="14" cy="14" r="5.5" stroke="#5C4A3D" strokeWidth="3" />
    <path d="M4 31C4 26.5817 8.47715 23 14 23C19.5228 23 24 26.5817 24 31" stroke="#5C4A3D" strokeWidth="3" strokeLinecap="round" />
    <circle cx="26" cy="14" r="5.5" stroke="#5C4A3D" strokeWidth="3" />
    <path d="M16 31C16 26.5817 20.4772 23 26 23C31.5228 23 36 26.5817 36 31" stroke="#5C4A3D" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
