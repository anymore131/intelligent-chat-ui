// utils/time.ts
// 格式化时间
export const formatTime = (time: string): string | null => {
  try {
    if (!time) {
      return null;
    }
    const inputDate = new Date(time);
    const now = new Date();
    // 获取日期组件
    const inputYear = inputDate.getFullYear();
    const inputMonth = inputDate.getMonth() + 1;
    const inputDay = inputDate.getDate();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth() + 1;
    const nowDay = now.getDate();
    // 时间补零函数
    const pad = (n: number) => n.toString().padStart(2, '0');

    // 格式化时间部分
    const timeStr = `${pad(inputDate.getHours())}:${pad(
      inputDate.getMinutes()
    )}:${pad(inputDate.getSeconds())}`;
    // 判断逻辑
    if (
      inputYear === nowYear &&
      inputMonth === nowMonth &&
      inputDay === nowDay
    ) {
      return timeStr;
    }
    if (
      inputYear === nowYear &&
      inputMonth === nowMonth &&
      inputDay === nowDay - 1
    ) {
      return '昨天';
    }
    if (
      inputYear === nowYear &&
      inputMonth === nowMonth &&
      inputDay === nowDay - 2
    ) {
      return '前天';
    }
    if (
      inputYear === nowYear &&
      inputMonth === nowMonth &&
      inputDay === nowDay - 3
    ) {
      return '3天前';
    }
    if (inputYear === nowYear) {
      return `${inputMonth}月${pad(inputDay)}日`;
    }
    return `${inputYear}年`;
  } catch {
    return '--:--:--';
  }
};

export const formatTotalTime = (time: string): string | null => {
  try {
    if (!time) {
      return null;
    }
    const inputDate = new Date(time);
    // 时间补零函数
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${pad(inputDate.getFullYear())}.${pad(
      inputDate.getMonth()
    )}.${pad(inputDate.getDay())} ${pad(inputDate.getHours())}:${pad(
      inputDate.getMinutes()
    )}:${pad(inputDate.getSeconds())}`;
    return `${timeStr}`;
  } catch {
    return '--.--.-- --:--:--';
  }
};

// 当前时间
export const currentTime = (): string => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};
