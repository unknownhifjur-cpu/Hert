import React from 'react';

const Avatar = ({ src, name, size = 'md', online = false }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base'
  };

  return (
    <div className="relative shrink-0">
      <div
        className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center font-bold text-white`}
        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          name?.charAt(0).toUpperCase()
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
      )}
    </div>
  );
};

export default Avatar;