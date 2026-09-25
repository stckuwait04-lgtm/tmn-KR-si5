import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuUser,
  LuCar,
  LuFileText,
  LuCreditCard,
  LuEye,
  LuCheck,
} from "react-icons/lu";
import { useTranslation } from "../context/LanguageContext";
import ProgressStepper from "../components/apply/ProgressStepper";
import ApplyFooter from "../components/ApplyFooter";
import FloatingActions from "../components/FloatingActions";
import PolicyPreviewModal from "../components/summary/PolicyPreviewModal";
import { SiApple } from "react-icons/si";

function parseQuery() {
  const raw = new URLSearchParams(window.location.search).get("data");
  try {
    return { raw, parsed: raw ? JSON.parse(raw) : null };
  } catch {
    return { raw, parsed: null };
  }
}

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

const Row = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 py-2">
    <dt className="text-xs font-semibold text-gray-400">{label}</dt>
    <dd className="text-sm font-extrabold text-[#146394]">{value || "—"}</dd>
  </div>
);

const Summary = () => {
  const { t, dir, language } = useTranslation();
  const { raw: data, parsed } = useMemo(parseQuery, []);
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState("card");
  const [showPreview, setShowPreview] = useState(false);

  if (!parsed) {
    return (
      <div className="flex min-h-52 w-full items-center justify-center text-xl text-red-500">
        {t("common.invalidData")}
      </div>
    );
  }

  const company = parsed.companyData || {};
  const companyName = company.nameKey
    ? t(company.nameKey)
    : company.name || "—";
  const isComprehensive =
    parsed.tameenFor === "شامل" || Boolean(company.defaultCoverageKey);
  const insuranceType = isComprehensive
    ? t("activate.tabComprehensive")
    : t("activate.tabThirdParty");

  const price =
    parseFloat(String(company.price ?? "").replace(/[^\d.]/g, "")) || 0;
  const vat = +(price * 0.15).toFixed(2);
  const total = +(price + vat).toFixed(2);

  const goConfirm = () => {
    const payload = data || JSON.stringify(parsed);
    navigate(`/confirm?data=${encodeURIComponent(payload)}`);
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const insuredRows = [
    { label: t("summary.fullName"), value: parsed.carHolderName },
    { label: t("apply.nationalId"), value: parsed.national_id },
    { label: t("summary.birthDate"), value: parsed.birth_date },
    { label: t("summary.mobile"), value: parsed.phone },
    { label: t("summary.startDate"), value: parsed.startedDate },
  ];

  const vehicleRows = [
    { label: t("activate.vehicleMake"), value: parsed.car_model },
    {
      label: t("summary.manufactureYear"),
      value: parsed.carYear || parsed.car_year,
    },
    {
      label: t("activate.estimatedValue"),
      value: parsed.carPrice
        ? `${parsed.carPrice} ${t("common.currencyRiyal")}`
        : "—",
    },
    { label: t("activate.purpose"), value: parsed.purpose_of_use },
    { label: t("activate.repairLocation"), value: parsed.tameenAllType },
    {
      label: t("summary.registrationType"),
      value: parsed.tameenType || t("apply.form"),
    },
  ];

  const serviceRows = [
    { label: t("summary.insuranceCompany"), value: companyName },
    { label: t("summary.insuranceType"), value: insuranceType },
    {
      label: t("summary.insuranceFees"),
      value: `${money(price)} ${t("common.currencySar")}`,
    },
    {
      label: t("summary.vat15"),
      value: `${money(vat)} ${t("common.currencySar")}`,
    },
  ];

  return (
    <div
      className="flex min-h-screen w-full flex-col bg-[#F8F9FB] pb-8"
      dir={dir}
    >
      <div className="mx-auto w-full max-w-xl px-4 pt-4">
        <ProgressStepper t={t} current={4} />

        <div className="mt-4 flex items-center justify-between gap-3 rounded-full bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-bold text-[#146394]">
            {t("summary.offerSelected", { name: companyName })}
          </span>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <LuCheck className="h-4 w-4" />
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] py-3 text-base font-bold text-white"
        >
          <LuEye className="h-5 w-5" />
          {t("summary.previewPolicy")}
        </button>

        <section className="mt-4 mb-4 rounded-2xl bg-[#E8F3FB] p-3">
          <div className="rounded-xl bg-white p-4">
            <h2 className="mb-3 text-base font-extrabold text-[#146394]">
              {t("summary.orderTitle")}
            </h2>
            <dl>
              <Row label={t("summary.company")} value={companyName} />
              <Row label={t("summary.insuranceType")} value={insuranceType} />
              <Row
                label={t("summary.fees")}
                value={`${money(price)} ${t("common.currencySar")}`}
              />
              <Row
                label={t("summary.tax")}
                value={`${money(vat)} ${t("common.currencySar")}`}
              />
            </dl>
            <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-3">
              <span className="text-sm font-extrabold text-[#146394]">
                {t("summary.total")}
              </span>
              <span className="text-base font-extrabold text-[#146394]">
                {money(total)} {t("common.currencySar")}
              </span>
            </div>
          </div>
        </section>
        <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-[#146394]">
            <LuCreditCard className="h-5 w-5" />
            {t("summary.paymentMethod")}
          </h2>
          <button
            type="button"
            onClick={() => setPayMethod("card")}
            className={`mb-3 flex w-full items-center justify-start gap-x-2 rounded-xl border px-4 py-3 ${
              payMethod === "card" ? "border-[#146394]" : "border-gray-200"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                payMethod === "card" ? "border-[#146394]" : "border-gray-300"
              }`}
            >
              {payMethod === "card" ? (
                <span className="h-2.5 w-2.5 rounded-full bg-[#146394]" />
              ) : null}
            </span>
            <div className="text-start flex items-center gap-2">
              <LuCreditCard className="h-5 w-5" />
              <div>
                <p className="text-sm font-extrabold text-[#146394]">
                  {t("summary.creditMada")}
                </p>
                <p className="text-xs font-semibold text-gray-400">
                  {t("summary.mada")}
                </p>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPayMethod("apple")}
            className={`flex w-full items-center justify-start gap-x-2 rounded-xl border px-4 py-3 ${
              payMethod === "apple" ? "border-[#146394]" : "border-gray-200"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                payMethod === "apple" ? "border-[#146394]" : "border-gray-300"
              }`}
            >
              {payMethod === "apple" ? (
                <span className="h-2.5 w-2.5 rounded-full bg-[#146394]" />
              ) : null}
            </span>
            <div className="flex items-center gap-2 text-start">
              <SiApple className="h-5 w-5" />
              <div>
                <p className="text-sm font-extrabold text-[#146394]">
                  Apple Pay
                </p>
                <p className="text-xs font-semibold text-gray-400">
                  {t("summary.applePaySub")}
                </p>
              </div>
            </div>
          </button>
        </section>
        <section className="my-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#146394]">
              {t("summary.total")}
            </span>
            <span className="text-base font-extrabold text-[#146394]">
              {money(total)} {t("common.currencySar")}
            </span>
          </div>
          <button
            type="button"
            onClick={goConfirm}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#146394] py-3 text-base font-bold text-white"
          >
            {t("summary.proceedPay")}
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#146394]">
              <LuCheck className="h-3.5 w-3.5" />
            </span>
          </button>
          <p className="mt-2 text-center text-[11px] font-semibold text-[#7BA3C4]">
            {t("summary.termsPrefix")}{" "}
            <a href="#" className="underline">
              {t("summary.termsService")} {t("summary.termsAnd")}{" "}
              {t("summary.termsPrivacy")}
            </a>
          </p>
        </section>
        <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 text-base font-extrabold text-[#146394]">
            <LuFileText className="h-5 w-5" />
            {t("summary.serviceTitle")}
          </h2>
          <dl>
            {serviceRows.map((row) => (
              <Row key={row.label} label={row.label} value={row.value} />
            ))}
          </dl>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-[#E8F3FB] px-4 py-3">
            <span className="text-sm font-extrabold text-[#146394]">
              {t("summary.grandTotal")}
            </span>
            <span className="text-sm font-extrabold text-[#146394]">
              {money(total)} {t("common.currencySar")}
            </span>
          </div>
        </section>
        <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 text-base font-extrabold text-[#146394]">
            <LuUser className="h-5 w-5" />
            {t("summary.insuredTitle")}
          </h2>
          <dl>
            {insuredRows.map((row) => (
              <Row key={row.label} label={row.label} value={row.value} />
            ))}
          </dl>
        </section>

        <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 text-base font-extrabold text-[#146394]">
            <LuCar className="h-5 w-5" />
            {t("summary.vehicleTitle")}
          </h2>
          <dl>
            {vehicleRows.map((row) => (
              <Row key={row.label} label={row.label} value={row.value} />
            ))}
          </dl>
        </section>
        <section className="my-4 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-center text-base font-extrabold text-[#146394]">
            {t("summary.banksTitle")}
          </h2>
          <p className="mb-4 text-center text-xs font-semibold text-gray-400">
            {t("summary.banksSubtitle")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {BANKS.map((bank) => (
              <div
                key={bank.nameKey}
                className="flex min-h-[88px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-2 py-3"
              >
                {bank.img ? (
                  <img
                    src={bank.img}
                    alt=""
                    className="mb-2 w-20 h-16 object-contain"
                  />
                ) : null}
                <span className="text-center text-xs font-bold text-[#146394]">
                  {t(bank.nameKey)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={handleBack}
          className="mb-6 rounded-xl border border-gray-200 bg-white px-6 py-2 text-sm font-bold text-[#146394]"
        >
          {t("reg.back")}
        </button>
      </div>

      <ApplyFooter />
      <FloatingActions />

      {showPreview ? (
        <PolicyPreviewModal
          t={t}
          dir={dir}
          language={language}
          parsed={parsed}
          company={company}
          companyName={companyName}
          isComprehensive={isComprehensive}
          insuranceType={insuranceType}
          price={price}
          vat={vat}
          total={total}
          onClose={() => setShowPreview(false)}
        />
      ) : null}
    </div>
  );
};

export default Summary;
