import { useEffect, useState } from "react";

export default function CountdownTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("রেজিস্ট্রেশন শেষ");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft(`${days} দিন ${hours} ঘন্টা ${minutes} মিনিট`);
    };

    // Run once immediately
    updateTime();

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const now = new Date().getTime();
  const end = new Date(deadline).getTime();
  const diffDays = (end - now) / (1000 * 60 * 60 * 24);

  // ❌ Don’t render anything if deadline is more than 7 days away
  if (diffDays > 7) return null;

  const urgent = diffDays < 1;

  return (
    <span
      className={`font-semibold px-3 py-2 rounded-br-md shadow-md ${
        urgent ? "bg-red-700 animate-pulse text-white" : "bg-red-600 text-white"
      }`}
    >
      {timeLeft}
    </span>
  );
}
