import { faCalendar, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import styles from "../styles/AddPlanPopup.module.css";
import PlanTypeItem from "./PlanTypeItem";
import AddPlanCalendar from "./AddPlanCalendar";
import axios from "axios";

const AddPlanPopup = ({
  selectedDate,
  closePopup,
  planTypeList,
  loadPlanList,
}) => {
  const [planTypeListOn, setPlanTypeListOn] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planType, setPlanType] = useState(planTypeList[0]);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);

  const settingPlanTypeListOn = () => {
    setPlanTypeListOn((planTypeListOn) => !planTypeListOn);
  };

  const changePlanType = (target) => {
    setPlanType(target);
    setPlanTypeListOn(false);
  };

  const changePlanName = (e) => {
    setPlanName(e.target.value);
  };

  const settingStartDate = (target) => {
    setStartDate(target);
  };

  const settingEndDate = (target) => {
    setEndDate(target);
  };

  const settingShowStartCalendar = () => {
    setShowEndCalendar(false);
    setShowStartCalendar((showStartCalendar) => !showStartCalendar);
  };

  const settingShowEndCalendar = () => {
    setShowStartCalendar(false);
    setShowEndCalendar((showEndCalendar) => !showEndCalendar);
  };

  const submitPlan = () => {
    // 서버로 입력 내용 전송 (startDate,endDate, planType, planName)
    // planName => 이거는 반드시 입력해야 하므로 이거 예외처리 부분 필수

    if (planName === "") {
      alert("일정 이름은 필수로 입력해야 합니다.");
      return;
    }

    const start = `${startDate.year}-${(startDate.month + 1)
      .toString()
      .padStart(2, "0")}-${startDate.date.toString().padStart(2, "0")}`;

    const end = `${endDate.year}-${(endDate.month + 1)
      .toString()
      .padStart(2, "0")}-${endDate.date.toString().padStart(2, "0")}`;

    const data = {
      planName,
      planType: planType.planType,
      start,
      end,
      color: planType.color,
      success: 0,
    };

    axios
      .post("http://13.125.51.122:8080/plan/month/add", data)
      .then((res) => {
        console.log(res);
        loadPlanList();
      })
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("token");
      });

    closePopup();
  };

  return (
    <div className={styles.add_plan_popup}>
      <p className={styles.title}>일정 이름</p>
      <div className={styles.input_container}>
        <input type="text" value={planName} onChange={changePlanName} />
        <div className={styles.select_button} onClick={settingPlanTypeListOn}>
          <div
            className={styles.colorbox}
            style={{ background: `${planType.color}` }}
          ></div>
          <FontAwesomeIcon icon={faChevronDown} className={styles.icon} />
        </div>
        {planTypeListOn && (
          <div className={styles.plan_type_list}>
            {planTypeList.map((item) => (
              <PlanTypeItem
                key={item.planType + item.color}
                item={item}
                changePlanType={() => changePlanType(item)}
              />
            ))}
          </div>
        )}
      </div>
      <div className={styles.date_select_container}>
        <div
          className={styles.date_container}
          onClick={settingShowStartCalendar}
        >
          <p className={styles.date_title}>시작</p>
          <div className={styles.date}>
            <span>{`${startDate.year}년 ${startDate.month + 1}월 ${
              startDate.date
            }일`}</span>
            <FontAwesomeIcon
              icon={faCalendar}
              className={styles.calendar_icon}
            />
          </div>
        </div>
        {showStartCalendar && (
          <div className={styles.start_calendar_container}>
            <AddPlanCalendar
              selectedDate={startDate}
              settingSelectedDate={settingStartDate}
              closePopup={settingShowStartCalendar}
            />
          </div>
        )}
        <div className={styles.date_container} onClick={settingShowEndCalendar}>
          <p className={styles.date_title}>종료</p>
          <div className={styles.date}>
            <span>{`${endDate.year}년 ${endDate.month + 1}월 ${
              endDate.date
            }일`}</span>
            <FontAwesomeIcon
              icon={faCalendar}
              className={styles.calendar_icon}
            />
          </div>
        </div>
        {showEndCalendar && (
          <div className={styles.end_calendar_container}>
            <AddPlanCalendar
              selectedDate={endDate}
              settingSelectedDate={settingEndDate}
              closePopup={settingShowEndCalendar}
            />
          </div>
        )}
      </div>
      <button className={styles.submit_button} onClick={submitPlan}>
        Done
      </button>
    </div>
  );
};

export default AddPlanPopup;
