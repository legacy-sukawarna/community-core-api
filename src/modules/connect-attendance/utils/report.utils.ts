/**
 * Utility functions for attendance report generation
 */

/**
 * Formats a date to YYYY-MM format for monthly grouping
 */
export const formatToMonthKey = (date: Date): string => {
  return new Date(date).toISOString().slice(0, 7);
};

/**
 * Groups attendance records by month
 * @returns Map<monthKey, Map<group_id, count>>
 */
export const groupAttendanceByMonth = (
  attendanceRecords: Array<{ group_id: string; date: Date }>,
): Map<string, Map<string, number>> => {
  const monthlyData = new Map<string, Map<string, number>>();

  attendanceRecords.forEach((record) => {
    const monthKey = formatToMonthKey(record.date);

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, new Map());
    }

    const monthMap = monthlyData.get(monthKey);
    const currentCount = monthMap.get(record.group_id) || 0;
    monthMap.set(record.group_id, currentCount + 1);
  });

  return monthlyData;
};

/**
 * Formats mentor data for response
 */
export const formatMentorData = (mentor: {
  id: string;
  name: string;
  email: string;
  gender: string | null;
  phone: string | null;
}) => ({
  id: mentor.id,
  name: mentor.name,
  email: mentor.email,
  gender: mentor.gender,
  phone: mentor.phone,
});

/**
 * Calculates attendance percentage
 */
export const calculateAttendancePercentage = (
  attendedCount: number,
  totalCount: number,
): string => {
  if (totalCount === 0) return '0.00';
  return Number((attendedCount / totalCount) * 100).toFixed(2);
};

/**
 * Builds group attendance data for a specific month
 */
export const buildGroupsForMonth = (
  allGroups: Array<{
    id: string;
    name: string;
    mentor: {
      id: string;
      name: string;
      email: string;
      gender: string | null;
      phone: string | null;
    } | null;
  }>,
  monthMap: Map<string, number>,
) => {
  return allGroups.map((group) => ({
    group_id: group.id,
    name: group.name,
    attendance_count: monthMap.get(group.id) ?? 0,
    mentor: group.mentor ? formatMentorData(group.mentor) : null,
  }));
};

/**
 * Calculates the number of groups with attendance
 */
export const countGroupsWithAttendance = (
  groups: Array<{ attendance_count: number }>,
): number => {
  return groups.filter((g) => g.attendance_count > 0).length;
};

/**
 * Gets unique group IDs from attendance records
 */
export const getUniqueGroupIds = (
  attendanceRecords: Array<{ group_id: string }>,
): Set<string> => {
  return new Set(attendanceRecords.map((a) => a.group_id));
};
