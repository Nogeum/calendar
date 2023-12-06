import React from "react";
import styles from "../styles/DayCalendar.module.css";
import { hourList, minuteList } from "../util/time";
import axios from "axios";

// 일일 일정 그리기
// 1. 리스트를 받아온다.
// 2. selectedDate에 맞는 일정만을 모은다. (selectedDate useEffect)
// 3. 그 일정 내에서 시간 별로 정렬한다. (월별과 동일한 기준)
// 4. 그린다 (월별과 동일, 차이점은 [월별] => 1일마다 돌리기 / [일일] => 10분 마다 돌리기)

// 시작 => 그 다음 칸 부터 그리면 된다 (00분 시작 = 첫 칸 부터 / 50분 시작 = 6번 칸 부터 (칸은 1~6번))
// 끝 => 00분 끝 => 6번칸까지 색칠 / 10분 끝 => 1번 칸 색칠 (딱 자기 칸 까지만)

// [00 ~ 23], [00 ~ 50] => 두가지로 돌면서 그리기, 일정도 그 안에서 돌면서 비교
// ex) 06:40 ~ 07:20 일정이라면 => hour 체크, start가 6이니까 통과, 그 뒤에 minute 체크하는데 40부터니 5번 칸 부터 색칠
// end 보다 작을 때 까지만 색칠 (00분 끝인 경우에만 특수 처리)

const DayCalendar = ({
  showIndication,
  dayPlanList,
  selectedDate,
  loadDayPlanList,
}) => {
  const deleteDayPlan = (planId) => {
    const conf = window.confirm("일정을 삭제하시겠습니까?");

    if (!conf) return;

    axios
      .post("http://13.125.51.122:8080/plan/day/delete", { planId })
      .then((res) => {
        console.log(res.data);
        alert("삭제되었습니다.");
        loadDayPlanList();
      })
      .catch((err) => {
        console.error(err);
        alert("문제가 발생했습니다. 다시 시도해주세요");
        localStorage.removeItem("token");
      });
  };
  return (
    <div className={styles.calendar}>
      <div className={styles.main}>
        {hourList.map((h) => (
          <div key={h} className={styles.hour}>
            {showIndication && (
              <div
                className={styles.indication_box}
                style={{ width: "calc(100% / 7)" }}
              >
                {h}
              </div>
            )}
            {minuteList.map((m) => (
              <div
                key={m}
                className={styles.minute}
                style={showIndication ? { width: "calc(100% / 7)" } : {}}
              >
                {selectedDate &&
                  dayPlanList.map((plan) => {
                    const now = new Date(
                      `${selectedDate.year}-${(selectedDate.month + 1)
                        .toString()
                        .padStart(2, "0")}-${selectedDate.date
                        .toString()
                        .padStart(2, "0")}T${h}:${m}:00`
                    ).getTime();

                    const start = new Date(plan.start).getTime();
                    const end = new Date(plan.end).getTime();

                    if (now >= start && now < end)
                      return (
                        <div
                          key={plan.planId}
                          className={styles.plan}
                          style={{
                            background: plan.color,
                            top: `${plan.cnt * 1.32}rem`,
                          }}
                          onClick={() => deleteDayPlan(plan.planId)}
                        >
                          <span>{now === start && plan.planName}</span>
                        </div>
                      );
                  })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayCalendar;