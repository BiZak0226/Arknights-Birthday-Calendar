const csvUrl = "birthdays.csv"; // CSV 파일 경로
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentDate = today.getDate();
const imageBasePath = "image/icon/"; // 이미지 경로

let todayBirthdays = [];
let totalMonthBirthdays = 0;

// CSV 데이터 파싱 및 캘린더 생성
const fetchAndParseCSV = async () => {
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    const rows = csvText.trim().split("\n").slice(1); // 첫 번째 행(헤더) 제외
    const birthdaysByMonth = {};

    todayBirthdays = [];
    totalMonthBirthdays = 0;

    rows.forEach(row => {
        const [codename, fileName, birthday] = row.split(",").map(item => item.trim());
        const [month, day] = birthday.replace("일", "").split("월").map(s => parseInt(s.trim(), 10));

        if (!birthdaysByMonth[month]) birthdaysByMonth[month] = {};
        if (!birthdaysByMonth[month][day]) birthdaysByMonth[month][day] = [];

        birthdaysByMonth[month][day].push({ codename, fileName });

        if (month === currentMonth + 1 && day === currentDate) {
            todayBirthdays.push({ codename, fileName });
        }

        if (month === currentMonth + 1) {
            totalMonthBirthdays++;
        }
    });

    return birthdaysByMonth;
};

// 오늘 생일 표시
const displayTodayBirthdays = () => {
    const birthdayDisplay = document.getElementById("today-birthday");
    birthdayDisplay.innerHTML = ""; // 기존 데이터 초기화

    if (todayBirthdays.length > 0) {
        todayBirthdays.forEach(({ codename, fileName }) => {
            const img = document.createElement("img");
            img.src = `${imageBasePath}${fileName}_icon.png`;
            img.alt = codename;
            img.style.width = "50px";
            img.style.height = "50px";
            img.style.marginRight = "5px";
            birthdayDisplay.appendChild(img);
        });
    } else {
        birthdayDisplay.textContent = "오늘 생일인 캐릭터가 없습니다.";
    }
};

// 이번 달 생일 수 표시
const displayTotalMonthBirthdays = () => {
    const monthBirthdayDisplay = document.getElementById("month-birthday-count");
    monthBirthdayDisplay.textContent = `이번 달 총 생일 데이터: ${totalMonthBirthdays}개`;
};

// 캘린더 생성
const createCalendar = async (year, month) => {
    const birthdays = await fetchAndParseCSV();
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = ""; // 날짜 셀만 초기화

    const monthBirthdays = birthdays[month + 1] || {};
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    createDayHeaders(calendar);
    createEmptyCells(calendar, firstDay);
    createDateCells(calendar, year, month, monthBirthdays, daysInMonth);

    updateCalendarHeader(year, month);
    displayTodayBirthdays();
    displayTotalMonthBirthdays();
};

// 날짜 셀 생성 및 이미지 추가
const createDateCells = (calendar, year, month, birthdays, daysInMonth) => {
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.className = "cell";

        const date = new Date(year, month, day);
        if (date.getDay() === 0) cell.classList.add("sunday");
        if (date.getDay() === 6) cell.classList.add("saturday");

        if (isToday(year, month, day)) {
            cell.classList.add("today");
        }

        const birthdayNames = birthdays[day] || [];
        cell.innerHTML = `<span>${day}</span>`;

        const imgDiv = document.createElement("div");
        imgDiv.className = "img-wrapper";

        birthdayNames.forEach(({ codename, fileName }) => {
            const img = document.createElement("img");
            img.src = `${imageBasePath}${fileName}_icon.png`;
            img.alt = codename;
            imgDiv.appendChild(img);
        });

        cell.appendChild(imgDiv);
        calendar.appendChild(cell);
    }
};

// 요일 헤더 생성
const createDayHeaders = (calendar) => {
    const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
    daysOfWeek.forEach(day => {
        const headerCell = document.createElement("div");
        headerCell.className = "cell header";
        headerCell.textContent = day;
        calendar.appendChild(headerCell);
    });
};

// 빈 칸 생성
const createEmptyCells = (calendar, count) => {
    for (let i = 0; i < count; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "cell empty";
        calendar.appendChild(emptyCell);
    }
};

const isToday = (year, month, day) => 
    year === currentYear && month === currentMonth && day === currentDate;

const updateCalendarHeader = (year, month) => {
    document.getElementById("current-month-year").textContent = `${year}년 ${month + 1}월`;
};

// 이전/다음 달 버튼 이벤트 추가
document.addEventListener("DOMContentLoaded", () => {
    let displayYear = currentYear;
    let displayMonth = currentMonth;

    createCalendar(displayYear, displayMonth);

    document.getElementById("prev-month").addEventListener("click", () => {
        displayMonth--;
        if (displayMonth < 0) {
            displayMonth = 11;
            displayYear--;
        }
        createCalendar(displayYear, displayMonth);
    });

    document.getElementById("next-month").addEventListener("click", () => {
        displayMonth++;
        if (displayMonth > 11) {
            displayMonth = 0;
            displayYear++;
        }
        createCalendar(displayYear, displayMonth);
    });
});



document.addEventListener("DOMContentLoaded", () => {
    const calendarContainer = document.getElementById("calendar-container");

    createCalendar(currentYear, currentMonth);

    document.getElementById("save-button").addEventListener("click", () => {
        domtoimage.toBlob(calendarContainer)
            .then((blob) => {
                const item = new ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item])
                    .then(() => alert("달력이 클립보드에 저장되었습니다!"))
                    .catch((error) => console.error("클립보드 저장 오류:", error));
            })
            .catch((error) => console.error("이미지 생성 오류:", error));
    });
});
