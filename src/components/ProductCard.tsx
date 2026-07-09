import Link from "next/link";
import { DiscountBadge } from "./DiscountBadge";
import { CldImage, cloudinaryUrl } from "@/lib/cloudinary-url";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  href: string;
}

export function ProductCard({ id, name, image, price, originalPrice, discount, href }: ProductCardProps) {
  const formatPrice = (p: number) => p.toLocaleString("vi-VN") + " ₫";

  return (
    <li className="list-none w-[calc(50%-8px)] md:w-[calc(33.333%-22px)]">
      <div className="h-full md:clip-diagonal md:bg-[rgb(253,230,138)] md:p-[1px]">
        <article className="flex flex-col size-full relative bg-[rgb(2,6,23)] rounded-2xl md:rounded-none md:clip-diagonal p-2 md:p-4 pb-2.5 md:pb-6 border border-[rgb(253,230,138)] md:border-none">
          <div className="font-medium text-[rgb(251,191,36)] text-[14px] md:text-[24px] leading-tight md:leading-[38.4px] font-[family-name:var(--font-nunito)]">
            {name}
          </div>
          <figure className="relative w-full mt-2 md:mt-3 aspect-[16/9]">
            <DiscountBadge discount={discount} />
            <CldImage src={cloudinaryUrl(image)} fill className="object-contain rounded-2xl" alt={name} sizes="(max-width: 768px) 50vw, 33vw" />
          </figure>
          <div className="flex flex-col grow text-center pt-1 pb-1 md:pt-4 md:pb-4">
            <div className="border-t text-center mt-2 pt-2 md:mt-3 md:pt-3 border-dashed border-t-[rgba(251,191,36,0.4)]">
              <span className="font-bold text-[rgb(251,191,36)] text-[13px] md:text-[20px] pr-1.5 md:pr-2 font-[family-name:var(--font-nunito)]">
                {formatPrice(price)}
              </span>
              <span className="font-medium line-through text-[rgba(238,238,238,0.6)] text-[10px] md:text-[14px] font-[family-name:var(--font-nunito)]">
                {formatPrice(originalPrice)}
              </span>
            </div>
          </div>
          <Link href={href} className="items-center flex font-bold justify-center mx-auto mt-auto max-w-full w-full md:w-[200px] h-8 md:h-10 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] rounded-lg md:rounded-none md:clip-button text-[12px] md:text-[18px] transition-colors text-black">
            XEM CHI TIẾT
          </Link>
        </article>
      </div>
    </li>
  );
}
