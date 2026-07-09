"use client";

import { useState } from "react";

export function ContactButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-10 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
      {open && (
        <div className="flex flex-col items-end gap-3 animate-fade-in pointer-events-auto">
          <div className="flex items-center gap-2 bg-white rounded-full pr-5 pl-3 py-2 shadow-lg pointer-events-none">
            <span className="w-11 h-11 flex items-center justify-center shrink-0" style={{backgroundColor:"#0068FF", borderRadius:"6px"}}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-[22px] h-[22px]">
                <path d="M12.49 10.272v-.45h1.347v6.322h-.77a.576.576 0 0 1-.577-.573v.001a3.27 3.27 0 0 1-1.938.632a3.284 3.284 0 0 1-3.284-3.282a3.284 3.284 0 0 1 3.284-3.282a3.27 3.27 0 0 1 1.937.632zM6.919 7.79v.205c0 .382-.051.694-.3 1.06l-.03.034a8 8 0 0 0-.242.285L2.024 14.8h4.895v.768a.576.576 0 0 1-.577.576H0v-.362c0-.443.11-.641.25-.847L4.858 9.23H.192V7.79zm8.551 8.354a.48.48 0 0 1-.48-.48V7.79h1.441v8.354zM20.693 9.6a3.306 3.306 0 1 1 .002 6.612a3.306 3.306 0 0 1-.002-6.612m-10.14 5.253a1.932 1.932 0 1 0 0-3.863a1.932 1.932 0 0 0 0 3.863m10.14-.003a1.945 1.945 0 1 0 0-3.89a1.945 1.945 0 0 0 0 3.89"/>
              </svg>
            </span>
            <span className="text-[13px] font-semibold text-gray-800 whitespace-nowrap">Chat Zalo</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full pr-5 pl-3 py-2 shadow-lg pointer-events-none">
            <span className="w-11 h-11 bg-[rgb(24,119,242)] rounded-full flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </span>
            <span className="text-[13px] font-semibold text-gray-800 whitespace-nowrap">Messenger</span>
          </div>
        </div>
      )}

      <div className="relative pointer-events-auto">
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-[rgb(251,191,36)] animate-ping opacity-30 pointer-events-none" />
        <div className="absolute -inset-3 w-[104px] h-[104px] rounded-full border-2 border-[rgb(251,191,36)] animate-ping opacity-20 pointer-events-none" style={{ animationDelay: '0.5s' }} />
        <button
          onClick={() => setOpen(!open)}
          className="relative w-20 h-20 bg-[rgb(251,191,36)] rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-110 transition-transform touch-manipulation"
        >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1e1e2f" className="w-9 h-9">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1e1e2f" className="w-9 h-9 animate-[shake_2s_ease-in-out_infinite]">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        )}
      </button>
      </div>
    </div>
  );
}
