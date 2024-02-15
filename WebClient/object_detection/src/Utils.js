// sort by score
export const sortByScore = (a, b) => {
    return b.label_score - a.label_score;
};

export const concatenateLabels = (list) => {
    let concatenatedString = "";
    list.forEach((item, index) => {
      concatenatedString += `${item.label_name} (${item.label_score})`;
        if (index !== list.length - 1) {
        concatenatedString += ", ";
      }
    });
      return concatenatedString;
  };