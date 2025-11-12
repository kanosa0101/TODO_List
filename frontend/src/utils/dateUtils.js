const arrayToDate = (values) => {
  if (!Array.isArray(values) || values.length < 3) {
    return null;
  }

  const [
    year,
    month,
    day,
    hour = 0,
    minute = 0,
    second = 0,
    nano = 0,
  ] = values;

  return new Date(
    year,
    (month || 1) - 1,
    day || 1,
    hour,
    minute,
    second,
    Math.floor(nano / 1_000_000)
  );
};

export const formatDate = (value) => {
  if (!value) return '';

  let date;
  if (value instanceof Date) {
    date = value;
  } else if (Array.isArray(value)) {
    date = arrayToDate(value);
  } else {
    date = new Date(value);
  }

  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

