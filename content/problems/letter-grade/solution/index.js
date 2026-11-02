export function letterGrade(score) {
  if (score >= 90) {
    return "A";
  } else if (score >= 80) {
    return "B";
  } else if (score >= 70) {
    return "C";
  } else if (score >= 60) {
    return "D";
  } else {
    return "F";
  }
}

export function isPassing(score) {
  return score >= 60;
}

export function gradeMessage(name, score) {
  return `${name}: ${letterGrade(score)} (${isPassing(score) ? "pass" : "fail"})`;
}

console.log(gradeMessage("Ada", 91));
