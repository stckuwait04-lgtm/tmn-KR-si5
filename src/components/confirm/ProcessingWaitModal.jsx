import { useEffect, useState } from "react";
import { LuShieldCheck, LuSmartphone } from "react-icons/lu";

const ProcessingWaitModal = ({ t, dir }) => {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      dir={dir}
      role="dialog"
      aria-modal
    >
      <div className="w-full max-w-md rounded-2xl bg-white px-5 py-6 shadow-xl">
        <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-4 border-[#146394]/20 border-t-[#146394]" />
        <h2 className="text-center text-xl font-extrabold text-[#146394]">
          {t("confirm.processingTitle")}
        </h2>
        <p className="mt-2 text-center text-xs font-semibold leading-5 text-gray-400">
          {t("confirm.processingBody")}
        </p>

        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#146394] text-lg font-extrabold text-[#146394]">
            {seconds}
          </div>
          <div className="text-start">
            <p className="text-sm font-extrabold text-[#146394]">
              {t("confirm.waitingBank")}
            </p>
            <p className="text-xs font-semibold text-[#146394]">
              {t("confirm.waitingDecision")}
            </p>
          </div>
        </div>

        <div className="my-4 h-px bg-gray-200" />

        <div className="space-y-2">
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 px-3 py-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5A623] text-xs font-extrabold text-white">
              1
            </span>
            <div>
              <p className="text-sm font-extrabold text-[#146394]">
                {t("confirm.step1Title")}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-gray-400">
                {t("confirm.step1Body")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 px-3 py-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5A623] text-xs font-extrabold text-white">
              2
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-[#146394]">
                {t("confirm.step2Title")}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-gray-400">
                {t("confirm.step2Body")}
              </p>
            </div>
            <LuSmartphone className="mt-0.5 h-5 w-5 shrink-0 text-[#F5A623]" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[#C5DCF0] bg-[#E8F3FB] py-2.5">
          <LuShieldCheck className="h-4 w-4 text-green-600" />
          <span className="text-xs font-bold text-[#146394]">
            {t("confirm.secureBank")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingWaitModal;
