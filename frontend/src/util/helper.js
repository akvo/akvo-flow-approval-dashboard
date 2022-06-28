export const removeCookie = (name) => {
  var pathBits = location.pathname.split("/");
  var pathCurrent = " path=";
  document.cookie = name + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT;";

  for (var i = 0; i < pathBits.length; i++) {
    pathCurrent += (pathCurrent.substr(-1) !== "/" ? "/" : "") + pathBits[i];
    document.cookie =
      name + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT;" + pathCurrent + ";";
  }
};

export const numToDuration = (num) => {
  let h = Math.floor(num / 3600);
  let m = Math.floor((num % 3600) / 60);
  let s = Math.round(num % 60);
  h = `${h === 0 ? "" : `${h}h`}`;
  m = m === 0 ? "" : `${h && m < 10 ? `0${m}` : m}min`;
  s = `${s === 0 ? "" : `${s < 10 ? `0${s}` : s}`}${s === 0 ? "" : "s"}`;
  return `${h} ${m} ${s}`;
};

export const toTitleCase = (word) => {
  return `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`;
};
