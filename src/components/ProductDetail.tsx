"use client";

import { useState } from "react";
import { CldImage, cloudinaryUrl } from "@/lib/cloudinary-url";

interface ProductDetailProps {
  productId: number;
  name: string;
  image: string;
  images?: string[];
  price: number;
  originalPrice: number;
  discount: number;
  petTim?: string;
  sanTim?: string;
  chuong?: string;
  extraInfo?: string;
  isOutOfStock?: boolean;
}

export function ProductDetail({
  productId,
  name,
  image,
  images,
  price,
  originalPrice,
  discount,
  petTim,
  sanTim,
  chuong,
  extraInfo,
  isOutOfStock = false
}: ProductDetailProps) {
  const allImages = images && images.length > 0 ? images : [image];
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <>
      <div className="w-full max-w-[1200px] mx-auto px-[14px] animate-fade-in-up">
        <div className="md:clip-diagonal md:bg-[rgb(253,230,138)] md:p-[1px] md:h-full">
          <article className="items-start flex flex-col md:flex-row size-full relative bg-[rgb(2,6,23)] rounded-2xl md:rounded-none md:clip-diagonal gap-[16px] md:gap-[24px] pt-4 md:pt-16 pr-4 pb-6 pl-4 border border-[rgb(253,230,138)] md:border-none">
            <h1 className="font-medium text-[rgb(251,191,36)] text-[20px] md:text-[24px] font-[family-name:var(--font-nunito)] w-full md:absolute md:left-4 md:top-4 md:w-auto z-10 mb-2 md:mb-0">
              {name}
            </h1>
            <figure className="relative w-full md:w-[50%] mt-2 md:mt-[12px]">
              <div className="items-center flex font-bold justify-center absolute w-[50px] md:w-[60px] h-[50px] md:h-[60px] top-0 right-0 text-white text-[18px] md:text-[22px] p-1 z-[2] animate-blink-badge font-[family-name:var(--font-nunito)]">
                <span className="block text-[rgb(254,239,199)]">-{discount}</span>
                <span className="block absolute left-0 top-0 right-0 bottom-0 z-[-1] before:absolute before:left-0 before:top-0 before:right-0 before:bottom-0 before:bg-[rgb(220,38,38)] before:content-[''] before:z-[-1] before:rounded-xs after:absolute after:left-0 after:top-0 after:right-0 after:bottom-0 after:bg-[rgb(220,38,38)] after:content-[''] after:rotate-45 after:z-[-1] after:rounded-xs animate-blink-badge"></span>
                <span className="block text-[rgb(254,239,199)] text-[14px]">%</span>
              </div>
              <div className="relative aspect-[16/9]">
                <CldImage src={cloudinaryUrl(allImages[selectedImage])} fill className="object-contain rounded-2xl" alt={name} sizes="(max-width: 768px) 100vw, 50vw" priority />
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                        i === selectedImage ? "border-[rgb(251,191,36)]" : "border-[rgb(75,85,99)] hover:border-[rgb(107,114,128)]"
                      }`}
                    >
                      <CldImage src={cloudinaryUrl(img)} fill className="object-cover" alt={`${name} ${i + 1}`} sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </figure>
            <div className="flex flex-col grow text-center w-full md:w-[calc(50%-24px)] pt-4 pb-4">
              <div className="text-center mt-[12px] pt-3 border-t border-dashed border-t-[rgba(251,191,36,0.4)]">
                <span className="font-bold text-[rgb(251,191,36)] text-[18px] md:text-[20px] pr-2 font-[family-name:var(--font-nunito)]">
                  {price.toLocaleString("vi-VN")}&nbsp;₫
                </span>
                <span className="font-medium line-through text-[rgba(238,238,238,0.6)] text-[13px] md:text-[14px] font-[family-name:var(--font-nunito)]">
                  {originalPrice.toLocaleString("vi-VN")}&nbsp;₫
                </span>
              </div>
              {(petTim !== undefined || sanTim !== undefined || chuong !== undefined || extraInfo !== undefined) && (
                <div className="flex flex-col text-center mt-[24px] bg-[rgba(254,240,138,0.1)] rounded-br-sm rounded-tr-sm gap-[32px] min-h-[94px] pt-7 pr-3 pb-3 pl-3 border-l-2 border-l-[rgb(251,191,36)]">
                  {petTim !== undefined && (
                    <dl className="border-dashed flex flex-col justify-center relative text-left w-full bg-[rgba(254,240,138,0.1)] border-[rgba(254,240,138,0.2)] border p-2 rounded-lg">
                      <dt className="absolute text-left left-0 top-[-24px] text-[rgba(238,238,238,0.6)] text-[13px]">Pet tím</dt>
                      <dd className="flex flex-wrap gap-2 mt-1">
                        {petTim.split(",").map((item, i) => (
                          <span key={i} className="px-3 py-1 bg-[rgba(251,191,36,0.1)] border border-[rgb(251,191,36)] rounded-lg text-[rgb(251,191,36)] text-[14px] font-medium">{item.trim()}</span>
                        ))}
                      </dd>
                    </dl>
                  )}
                  {sanTim !== undefined && (
                    <dl className="border-dashed flex flex-col justify-center relative text-left w-full bg-[rgba(254,240,138,0.1)] border-[rgba(254,240,138,0.2)] border p-2 rounded-lg">
                      <dt className="absolute text-left left-0 top-[-24px] text-[rgba(238,238,238,0.6)] text-[13px]">Sàn tím</dt>
                      <dd className="flex flex-wrap gap-2 mt-1">
                        {sanTim.split(",").map((item, i) => (
                          <span key={i} className="px-3 py-1 bg-[rgba(251,191,36,0.1)] border border-[rgb(251,191,36)] rounded-lg text-[rgb(251,191,36)] text-[14px] font-medium">{item.trim()}</span>
                        ))}
                      </dd>
                    </dl>
                  )}
                  {chuong !== undefined && (
                    <dl className="border-dashed flex flex-col justify-center relative text-left w-full bg-[rgba(254,240,138,0.1)] border-[rgba(254,240,138,0.2)] border p-2 rounded-lg">
                      <dt className="absolute text-left left-0 top-[-24px] text-[rgba(238,238,238,0.6)] text-[13px]">Chưởng</dt>
                      <dd className="flex flex-wrap gap-2 mt-1">
                        {chuong.split(",").map((item, i) => (
                          <span key={i} className="px-3 py-1 bg-[rgba(251,191,36,0.1)] border border-[rgb(251,191,36)] rounded-lg text-[rgb(251,191,36)] text-[14px] font-medium">{item.trim()}</span>
                        ))}
                      </dd>
                    </dl>
                  )}
                  {extraInfo !== undefined && (
                    <dl className="border-dashed flex flex-col justify-center relative text-left w-full bg-[rgba(254,240,138,0.1)] border-[rgba(254,240,138,0.2)] border p-2 rounded-lg">
                      <dt className="absolute text-left left-0 top-[-24px] text-[rgba(238,238,238,0.6)] text-[13px]">Thông tin thêm</dt>
                      <dd className="font-medium text-left text-[rgb(251,191,36)] text-[16px] md:text-[18px]">{extraInfo}</dd>
                    </dl>
                  )}
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
