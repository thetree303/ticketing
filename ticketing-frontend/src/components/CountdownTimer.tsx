import { useEffect, useState } from "react";

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-1 flex-col items-center rounded-xl bg-slate-50 py-2 ring-1 ring-slate-200 transition-all hover:bg-white hover:shadow-md">
    <span className="text-2xl font-extrabold text-slate-900">
      {value.toString().padStart(2, "0")}
    </span>
    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
      {label}
    </span>
  </div>
);

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft)
    return (
      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-green-600">
        <span className="font-bold">Sự kiện đang mở bán vé!</span>
      </div>
    );

  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      <TimeUnit value={timeLeft.days} label="Ngày" />
      <TimeUnit value={timeLeft.hours} label="Giờ" />
      <TimeUnit value={timeLeft.minutes} label="Phút" />
      <TimeUnit value={timeLeft.seconds} label="Giây" />
    </div>
  );
};

export default CountdownTimer;
