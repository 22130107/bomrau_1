"use client";

import { useState, useEffect } from "react";
import { CldImage, cloudinaryUrl } from "@/lib/cloudinary-url";

interface NotificationItem {
  title: string;
  content: string;
  image?: string;
}

interface NewsSectionProps {
  notifications?: NotificationItem[];
}

export function NewsSection({ notifications = [] }: NewsSectionProps) {
  const items = notifications;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        setFade(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex] || items[0];

  const highlightDomain = (text: string) => {
    const domainRegex = /(www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const parts = text.split(domainRegex);
    return parts.map((part, i) => {
      if (domainRegex.test(part)) {
        return <span key={i} className="font-semibold text-[rgb(245,197,66)]">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <section id="thongbao" className="pt-6 md:pt-10 pb-6 md:pb-10 animate-fade-in-up">
      <div className="mx-auto w-full max-w-[1200px] px-[14px]">
        <h2 className="font-bold mb-[16px] md:mb-[32px] border-[rgb(251,191,36)] text-[rgb(251,191,36)] text-[28px] md:text-[36px] leading-[48px] md:leading-[64px] pl-4 md:pl-6 border-l-[4px]">
          Thông Báo
        </h2>
        <div className="flex flex-wrap mt-[32px] md:mt-[64px] gap-[16px] md:gap-[32px]">
          <ul className="flex flex-col gap-[24px] w-full">
            <li className="flex flex-wrap gap-[32px]">
              <article className="w-full">
                <div className="flex flex-col md:flex-row bg-[rgba(15,23,42,0.25)] border border-[rgba(251,191,36,0.15)] rounded-2xl overflow-hidden md:h-[224px]">
                  <figure className="relative overflow-hidden w-full md:w-[320px] md:h-full aspect-[320/224] md:aspect-auto shrink-0 bg-[rgb(17,24,39)]">
                    {currentItem.image ? (
                      <CldImage 
                        src={cloudinaryUrl(currentItem.image)} 
                        fill
                        className={`object-cover transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`} 
                        alt="Thông báo"
                        sizes="(max-width: 768px) 100vw, 320px"
                      />
                    ) : (
                      <div className="flex items-center justify-center size-full text-[rgb(251,191,36)] text-[32px] font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 opacity-30">
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </figure>
                  <div className={`flex flex-col p-6 transition-opacity duration-300 justify-center min-w-0 flex-1 ${fade ? "opacity-100" : "opacity-0"}`}>
                    <h3 className="font-bold text-[rgb(251,191,36)] text-[18px] md:text-[24px] leading-[28px] md:leading-[38.4px] line-clamp-2">
                      {currentItem.title}
                    </h3>
                    <div className="text-[14px] md:text-[16px] mt-2 flex flex-col gap-1 text-[rgba(238,238,238,0.85)] font-sans line-clamp-4 md:line-clamp-3 overflow-hidden">
                      {currentItem.content.split("\n").map((para, i) => (
                        <p key={i}>{highlightDomain(para)}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
