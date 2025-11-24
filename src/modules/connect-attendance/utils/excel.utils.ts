/**
 * Utility functions for Excel sheet generation
 */
import * as ExcelJS from 'exceljs';

// Constants
export const EXCEL_STYLES = {
  COLORS: {
    ORANGE_HEADER: 'FFE4A853',
    WHITE_BACKGROUND: 'FFFFFFFF',
  },
  COLUMN_WIDTHS: {
    LEADER: 25,
    MONTH: 12,
  },
};

/**
 * Converts month key (YYYY-MM) to short month name (JAN, FEB, etc.)
 */
export const formatMonthName = (monthKey: string): string => {
  const date = new Date(monthKey + '-01');
  return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
};

/**
 * Extracts and formats month names from report
 */
export const extractMonthNames = (
  monthlyAttendance: Array<{ month: string }>,
): string[] => {
  return monthlyAttendance.map((m) => formatMonthName(m.month));
};

/**
 * Builds group data map from monthly attendance
 */
export const buildGroupDataMap = (
  monthlyAttendance: Array<{
    groups: Array<{
      group_id: string;
      name: string;
      attendance_count: number;
    }>;
  }>,
  monthsCount: number,
): Map<string, { name: string; monthlyAttendance: number[] }> => {
  const groupData = new Map<
    string,
    { name: string; monthlyAttendance: number[] }
  >();

  monthlyAttendance.forEach((monthData, monthIndex) => {
    monthData.groups.forEach((group) => {
      if (!groupData.has(group.group_id)) {
        groupData.set(group.group_id, {
          name: group.name,
          monthlyAttendance: new Array(monthsCount).fill(0),
        });
      }

      const groupRecord = groupData.get(group.group_id);
      groupRecord.monthlyAttendance[monthIndex] = group.attendance_count;
    });
  });

  return groupData;
};

/**
 * Sorts groups alphabetically by name
 */
export const sortGroupsByName = (
  groupData: Map<string, { name: string; monthlyAttendance: number[] }>,
): Array<{ name: string; monthlyAttendance: number[] }> => {
  return Array.from(groupData.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
};

/**
 * Formats attendance count for display (show '-' if 0)
 */
export const formatAttendanceValue = (count: number): number | string => {
  return count > 0 ? count : '-';
};

/**
 * Creates and styles the title cell
 */
export const createTitleCell = (
  sheet: ExcelJS.Worksheet,
  columnCount: number,
): void => {
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'ABSENCE REPORT';
  titleCell.font = { bold: true, size: 16 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: EXCEL_STYLES.COLORS.ORANGE_HEADER },
  };
  sheet.mergeCells(1, 1, 1, columnCount);
};

/**
 * Creates and styles the header row
 */
export const createHeaderRow = (
  sheet: ExcelJS.Worksheet,
  months: string[],
): void => {
  const headerRow = sheet.getRow(2);
  headerRow.values = ['Connect Leader', ...months];
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: EXCEL_STYLES.COLORS.ORANGE_HEADER },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
};

/**
 * Adds group data rows to the sheet
 */
export const addGroupDataRows = (
  sheet: ExcelJS.Worksheet,
  sortedGroups: Array<{ name: string; monthlyAttendance: number[] }>,
  startRow: number,
): number => {
  let currentRow = startRow;

  sortedGroups.forEach((group) => {
    const row = sheet.getRow(currentRow);
    const values = [
      group.name,
      ...group.monthlyAttendance.map(formatAttendanceValue),
    ];
    row.values = values;
    row.alignment = { horizontal: 'center', vertical: 'middle' };
    currentRow++;
  });

  return currentRow;
};

/**
 * Adds summary rows (total groups, attendance, percentage)
 */
export const addSummaryRows = (
  sheet: ExcelJS.Worksheet,
  report: any,
  months: string[],
  startRow: number,
): number => {
  let currentRow = startRow;

  // Total Connect Groups
  const totalGroupsRow = sheet.getRow(currentRow);
  totalGroupsRow.values = [
    'Total Connect Groups',
    ...new Array(months.length).fill(report.totalGroups),
  ];
  totalGroupsRow.font = { bold: true };
  totalGroupsRow.alignment = { horizontal: 'center', vertical: 'middle' };
  currentRow++;

  // Connect Groups Attendance
  const groupsAttendanceRow = sheet.getRow(currentRow);
  groupsAttendanceRow.values = [
    'Connect Groups Attendance',
    ...report.monthlyAttendance.map((m) => m.groupsWithAttendance),
  ];
  groupsAttendanceRow.font = { bold: true };
  groupsAttendanceRow.alignment = {
    horizontal: 'center',
    vertical: 'middle',
  };
  currentRow++;

  // Attendance Percentage
  const percentageRow = sheet.getRow(currentRow);
  percentageRow.values = [
    'Attendance Percentage',
    ...report.monthlyAttendance.map((m) => `${m.attendancePercentage}%`),
  ];
  percentageRow.font = { bold: true };
  percentageRow.alignment = { horizontal: 'center', vertical: 'middle' };

  return currentRow;
};

/**
 * Sets column widths for the sheet
 */
export const setColumnWidths = (
  sheet: ExcelJS.Worksheet,
  monthsCount: number,
): void => {
  sheet.getColumn(1).width = EXCEL_STYLES.COLUMN_WIDTHS.LEADER;
  for (let i = 2; i <= monthsCount + 1; i++) {
    sheet.getColumn(i).width = EXCEL_STYLES.COLUMN_WIDTHS.MONTH;
  }
};

/**
 * Adds borders to all cells in the sheet
 */
export const addBordersToAllCells = (
  sheet: ExcelJS.Worksheet,
  rowCount: number,
  columnCount: number,
): void => {
  for (let row = 1; row <= rowCount; row++) {
    for (let col = 1; col <= columnCount; col++) {
      const cell = sheet.getCell(row, col);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
  }
};

/**
 * Highlights summary rows with white background
 */
export const highlightSummaryRows = (
  sheet: ExcelJS.Worksheet,
  summaryStartRow: number,
  summaryEndRow: number,
  columnCount: number,
): void => {
  for (let row = summaryStartRow; row <= summaryEndRow; row++) {
    for (let col = 1; col <= columnCount; col++) {
      const cell = sheet.getCell(row, col);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: EXCEL_STYLES.COLORS.WHITE_BACKGROUND },
      };
    }
  }
};
