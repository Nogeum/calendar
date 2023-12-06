import React, { useEffect, useState } from "react";
import Mainpage from "./Mainpage";
import MainTwo from "./MainTwo";
import Header from "../components/Header";
import axios from "axios";
import { hourList, minuteList } from "../util/time";
import { useNavigate } from "react-router-dom";

const MainLayout = (props) => {
  const navigate = useNavigate();
  const date = new Date();
  const [tab, setTab] = useState("one");
  const [addPlanPopupOn, setAddPlanPopupOn] = useState(false);

  const [selectedDate, setSelectedDate] = useState({
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate(),
  });

  const [showDate, setShowDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  const [planList, setPlanList] = useState([]);
  const [showPlanList, setShowPlanList] = useState([]);
  const [dayPlanList, setDayPlanList] = useState([]);
  const [showDayPlanList, setShowDayPlanList] = useState([]);
  const [planTypeList, setPlanTypeList] = useState([]);
  const [selectedTypeList, setSelectedTypeList] = useState([]);

  const loadPlanTypeList = () => {
    axios
      .get("http://13.125.51.122:8080/user-plan/get")
      .then((res) => setPlanTypeList(res.data))
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("token");
        alert("에러가 발생했습니다. 다시 시도해주세요");
      });
  };

  const loadPlanList = () => {
    axios
      .get("http://13.125.51.122:8080/plan/month/get") // 아직 api 없어서 이후 수정 필요
      .then((res) => {
        const data = res.data;
        data.sort(
          (a, b) => a.start.localeCompare(b.start) || b.end.localeCompare(a.end)
        );
        setPlanList(data);
      })
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("token");
        alert("에러가 발생했습니다. 다시 시도해주세요");
      });
  };

  const loadDayPlanList = () => {
    // /plan/day/get
    axios
      .get("http://13.125.51.122:8080/plan/day/get") // 아직 api 없어서 이후 수정 필요
      .then((res) => {
        const data = res.data;
        data.sort(
          (a, b) => a.start.localeCompare(b.start) || b.end.localeCompare(a.end)
        );
        setDayPlanList(data);
      })
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("token");
        alert("에러가 발생했습니다. 다시 시도해주세요");
      });
  };

  // 일정 그릴 때, 순서 정하기 용 함수
  const makeOrder = () => {
    const nowYear = showDate.year.toString();
    const nowMonth = (showDate.month + 1).toString().padStart(2, "0");

    const nowPlanList = planList.filter(
      (plan) =>
        (plan.start.slice(5, 7) === nowMonth ||
          plan.end.slice(5, 7) === nowMonth) &&
        selectedTypeList.filter((t) => t.planType === plan.planType).length > 0
    );

    nowPlanList.forEach((plan) => (plan.cnt = 0));

    for (let i = 1; i < 32; i++) {
      let cnt = 1;
      const nowDate = i.toString().padStart(2, "0");
      const today = `${nowYear}-${nowMonth}-${nowDate}`;
      const todayTime = new Date(today).getTime();

      for (let j = 0; j < nowPlanList.length; j++) {
        const plan = nowPlanList[j];
        const start = new Date(plan.start).getTime();
        const end = new Date(plan.end).getTime();
        if (todayTime >= start && todayTime <= end) {
          nowPlanList[j].cnt = Math.max(nowPlanList[j].cnt, cnt);
          cnt++;
        }
      }
    }
    setShowPlanList(nowPlanList);
  };

  // 일정 그릴 때, 순서 정하기 용 함수
  const makeDayOrder = () => {
    const nowYear = selectedDate.year.toString();
    const nowMonth = (selectedDate.month + 1).toString().padStart(2, "0");
    const nowDate = selectedDate.date.toString().padStart(2, "0");

    const now = `${nowYear}-${nowMonth}-${nowDate}`;

    const nowPlanList = dayPlanList.filter(
      (plan) =>
        plan.start.slice(0, 10) === now &&
        selectedTypeList.filter((t) => t.planType === plan.planType).length > 0
    );

    nowPlanList.forEach((plan) => (plan.cnt = 0));

    for (let i = 0; i < hourList.length; i++) {
      for (let j = 0; j < minuteList.length; j++) {
        let cnt = 0;
        const nowTime = new Date(
          `${nowYear}-${nowMonth}-${nowDate}T${hourList[i]}:${minuteList[j]}:00`
        ).getTime();

        for (let k = 0; k < nowPlanList.length; k++) {
          const plan = nowPlanList[k];
          const start = new Date(plan.start).getTime();
          const end = new Date(plan.end).getTime();
          if (nowTime >= start && nowTime < end) {
            nowPlanList[k].cnt = Math.max(nowPlanList[k].cnt, cnt);
            cnt++;
          }
        }
      }
    }
    setShowDayPlanList(nowPlanList);
  };

  const changeSelectedTypeList = (target) => {
    const flag =
      selectedTypeList.filter((item) => item.planType === target.planType)
        .length > 0
        ? true
        : false;

    if (flag) {
      const tmp = selectedTypeList.filter(
        (item) => item.planType !== target.planType
      );
      setSelectedTypeList(tmp);
    } else {
      setSelectedTypeList((selectedTypeList) => [...selectedTypeList, target]);
    }
  };

  const onTabClick = (tabName) => {
    setTab(tabName);
  };

  const settingSelectedDate = (target) => {
    setSelectedDate(target);
  };

  const settingShowDate = (target) => {
    setShowDate(target);
  };

  // 일정 추가 팝업 여부 설정
  const settingAddPlanPopupOn = () => {
    setAddPlanPopupOn((addPlanPopupOn) => !addPlanPopupOn);
  };

  useEffect(() => {
    const access = localStorage.getItem("token");

    if (!access) {
      alert("로그인 후에 이용해주세요");
      navigate("/");
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

    loadPlanList();
    loadDayPlanList();
    loadPlanTypeList();
  }, []);

  useEffect(() => {
    setSelectedTypeList(planTypeList);
  }, [planTypeList]);

  useEffect(() => {
    if (planList.length === 0) return;
    makeOrder();
    makeDayOrder();
  }, [planList, dayPlanList, showDate, selectedDate, selectedTypeList]);

  return (
    <div>
      <>
        <Header tab={tab} onTabClick={onTabClick} />
        {tab === "one" && (
          <Mainpage
            selectedDate={selectedDate}
            settingSelectedDate={settingSelectedDate}
            showDate={showDate}
            setShowDate={settingShowDate}
            addPlanPopupOn={addPlanPopupOn}
            settingAddPlanPopupOn={settingAddPlanPopupOn}
            showPlanList={showPlanList}
            showDayPlanList={showDayPlanList}
            planTypeList={planTypeList}
            selectedTypeList={selectedTypeList}
            changeSelectedTypeList={changeSelectedTypeList}
            loadPlanList={loadPlanList}
            loadDayPlanList={loadDayPlanList}
          />
        )}
        {tab === "two" && <MainTwo />}
      </>
    </div>
  );
};

export default MainLayout;
