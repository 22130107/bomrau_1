interface DiscountBadgeProps {
  discount: number;
}

export function DiscountBadge({ discount }: DiscountBadgeProps) {
  return (
    <div className="items-center flex font-bold justify-center absolute w-[36px] md:w-[60px] h-[36px] md:h-[60px] top-0 right-0 text-white text-[12px] md:text-[22px] tracking-[0.1px] md:tracking-[0.22px] leading-[14px] md:leading-[30px] p-0.5 md:p-1 z-[2] animate-blink-badge font-[family-name:var(--font-nunito)]">
      <span className="block text-[rgb(254,239,199)]">-{discount}</span>
      <span className="block absolute left-0 top-0 right-0 bottom-0 z-[-1] before:absolute before:left-0 before:top-0 before:right-0 before:bottom-0 before:bg-[rgb(220,38,38)] before:content-[''] before:z-[-1] before:rounded-xs after:absolute after:left-0 after:top-0 after:right-0 after:bottom-0 after:bg-[rgb(220,38,38)] after:content-[''] after:rotate-45 after:z-[-1] after:rounded-xs animate-blink-badge"></span>
      <span className="block text-[rgb(254,239,199)] text-[9px] md:text-[16px] leading-[10px] md:leading-[22px]">%</span>
    </div>
  );
}
