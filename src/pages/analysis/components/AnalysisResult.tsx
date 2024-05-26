import { useMemo, useState } from "react";
import { convertTime } from "../../../commons/utils/time.util";
import csvDownload from "json-to-csv-export";
import { BiDownload } from "react-icons/bi";
import Alert from "../../../components/Alert";

type AnalysisResponse = {
  columns: Array<string>;
  /**
   * entries: {
   *  key1: [val, val, ...],
   *  key2: [val, val, ...],
   *  ...,
   * }
   * The keys will be ignored for this component.
   */
  entries: Object;
};

type AnalysisResultProps = {
  data: AnalysisResponse;
};

/**
 * Return the `compareFn` used in `Array.sort()`. This exists to capture variables (`sortCriteria` in this case).
 */
function createCompareFn(sortCriteria: number) {
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

export default function AnalysisResult({ data }: AnalysisResultProps) {
  /**
   * Structure:
   * Column 0 is reserved for selecting row (to print or whatever).
   * Column 1 onward is where the data actually is.
   * sortColumn being negative implies ascending sort.
   */

  // This is mainly to display the sort icon appropriately.
  const [sortColumn, setSortColumn] = useState(2);

  const [columns, _initialRows] = useMemo(() => {
    const columns = ["Select"].concat(data.columns);
    const rows = [];
    for (const row of Object.values(data.entries)) {
      rows.push([false].concat(row));
    }

    rows.sort(createCompareFn(sortColumn));

    return [columns, rows];
  }, [data]);

  const [rows, setRows] = useState(_initialRows);

  const total = useMemo(() => {
    let sum = 0;
    for (const row of rows) {
      if (row[0]) {
        sum += +row[2]; // Hardcode this number 2.
      }
    }
    return sum.toFixed(2);
  }, [rows]);

  const onColumnSort = (column: string) => {
    const i = columns.indexOf(column);
    if (i === 0) return;

    let sortNow = 0; // The sorting happens during this cycle, so this var is here.
    if (i !== sortColumn && i !== -sortColumn) {
      sortNow = i;
      setSortColumn(i);
    } else {
      sortNow = -sortColumn;
      setSortColumn(-sortColumn);
    }

    // Sort the thing here.
    // NOTE: I tried to sort as the component is rendering, but
    // since the thing needs to be a state (to update select/unselect) and
    // also not a state (cuz sort), idk how to circumvent it.
    // I also tried to make it a non-state and apply a separate state over it that
    // only capture select/unselect, but that doesn't sync well when I try to sort
    // both the data and the select array (cuz they need to retain the order, and also
    // sorting them both isn't great cuz they're state vs not state).
    setRows(rows.toSorted(createCompareFn(sortNow)));
  };
  const onSelectRow = (rowIndex: number) => {
    setRows(
      rows.map((row, index) => {
        if (rowIndex !== index) return row;

        return [!row[0], ...row.slice(1)];
      })
    );
  };
  const onSelectAll = () => {
    setRows(rows.map((row) => [true, ...row.slice(1)]));
  };
  const onDeselectAll = () => {
    setRows(rows.map((row) => [false, ...row.slice(1)]));
  };

  const onExportToCSV = () => {
    let selectedRows = rows.filter((row) => row[0]);

    if (selectedRows.length === 0) {
      selectedRows = rows;
    }

    const toCSVTable = selectedRows.map((entry) => {
      return Object.assign({}, entry.slice(1));
    });

    if (toCSVTable.length === 0) return;

    // TODO: Somehow find a way to name the file with the date range.
    const csvFile = {
      filename: `${convertTime(new Date()).split("-").join("")}_analysis`,
      data: toCSVTable,
      headers: columns.slice(1),
      delimiter: ",",
    };
    csvDownload(csvFile);
  };

  if (rows.length === 0) {
    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-8/12">
        <Alert type="empty" message={"Such empty, much hollow..."}></Alert>
      </div>
    );
  }

  return (
    <>
      <div className="my-4 flex items-center justify-end gap-3">
        <button className="btn btn-accent btn-sm" onClick={onExportToCSV}>
          <span className="mr-2">Download CSV</span>
          <BiDownload className="h-6 w-6"></BiDownload>
        </button>
        <div className="rounded-btn flex bg-warning p-2 text-sm font-semibold text-warning-content">
          {total} boxes
        </div>
      </div>
      <div className="flex justify-center">
        <table className="custom-card w-full table-auto border-separate border-spacing-y-2 p-4">
          <thead>
            <tr>
              {columns.map((col, i) => {
                if (i == 0) {
                  const isAllSelected = rows.filter((row) => row[0]);
                  if (isAllSelected.length !== rows.length) {
                    return (
                      <th>
                        <input
                          className="checkbox checkbox-primary border-2 border-base-300 dark:border-base-content"
                          type="checkbox"
                          checked={false}
                          onChange={onSelectAll}
                        />
                      </th>
                    );
                  }

                  return (
                    <th>
                      <input
                        className="checkbox checkbox-primary border-2 border-base-300 dark:border-base-content"
                        type="checkbox"
                        checked={true}
                        onChange={onDeselectAll}
                      />
                    </th>
                  );
                }

                return (
                  <th
                    className="select-none hover:cursor-pointer"
                    scope="col"
                    onClick={() => onColumnSort(col)}
                  >
                    {col}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              return (
                <tr>
                  {row.map((data: any, j: number) => {
                    // border radius doesn't work on tr for some reasons so have to do it manually at td.
                    if (j == 0) {
                      return (
                        <td
                          className={`flex w-full justify-center rounded-l-lg py-2 ${
                            row[0]
                              ? "bg-success text-primary dark:bg-primary dark:text-white"
                              : "bg-base-200 dark:bg-base-300"
                          }`}
                        >
                          <input
                            className="checkbox checkbox-primary border-2 border-base-300 dark:border-base-content"
                            type="checkbox"
                            checked={row[0]}
                            onChange={() => onSelectRow(i)}
                          />
                        </td>
                      );
                    } else if (j == row.length - 1) {
                      return (
                        <td
                          className={`rounded-r-lg p-2 text-center ${
                            row[0]
                              ? "bg-success text-primary dark:bg-primary dark:text-white"
                              : "bg-base-200 dark:bg-base-300"
                          }`}
                        >
                          {data}
                        </td>
                      );
                    } else {
                      return (
                        <td
                          className={`p-2 text-center ${
                            row[0]
                              ? "bg-success text-primary dark:bg-primary dark:text-secondary"
                              : "bg-base-200 dark:bg-base-300"
                          }`}
                        >
                          {data}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
