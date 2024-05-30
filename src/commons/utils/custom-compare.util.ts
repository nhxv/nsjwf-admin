/**
 * Return the `compareFn` used in `Array.sort()`. This exists to capture variables (`sortCriteria` in this case).
 */
export const customCompare = (sortCriteria: number) => {
  return (rowA: any, rowB: any) => {
    let i = sortCriteria;
    if (sortCriteria === 0) {
      return -1;
    } else if (sortCriteria < 0) {
      i = -sortCriteria;
    }

    // TODO: Detect type and use localeCompare() accordingly.
    let cmpValue = 0;
    if (rowA[i] === rowB[i]) {
      cmpValue = 0;
    } else if (rowA[i] < rowB[i]) {
      cmpValue = -1;
    } else {
      cmpValue = 1;
    }

    if (sortCriteria > 0) {
      // Descending
      return -cmpValue;
    } else {
      // Ascending
      return cmpValue;
    }
  };
}