import { getAllCourses } from "./db/courses";

import ExcelJS, { Workbook } from "exceljs";
import { getAllInstructors } from "./db/instructors";
import { getAllTeams } from "./db/teams";
import { getAllStudents } from "./db/students";
import { getAllWeeklyEntries } from "./db/weeklyEntries";
import { getAllTeamWeeklyEntries } from "./db/teamWeeklyEntries";

export const Reports = () => {
  async function handleStudents(): Promise<void> {
    const students = await getAllStudents();

    // Create Excel file with all courses

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    // Define columns
    worksheet.columns = [
      { header: "id", key: "id", width: 20 },
      { header: "full_name", key: "full_name", width: 50 },
      { header: "email", key: "email", width: 50 },
      { header: "cohort", key: "cohort", width: 50 },
      { header: "start_date", key: "start_date", width: 50 },
      { header: "status", key: "status", width: 50 },
      { header: "notes", key: "notes", width: 50 },
      { header: "research_area", key: "research_area", width: 50 },
      { header: "supervisor", key: "supervisor", width: 50 },

      // Add more columns as needed
    ];

    // Add content of instructors into worksheet
    if (students) {
      for (const item of students) {
        worksheet.addRow({
          id: item.id,
          full_name: item.full_name,
          email: item.email,
          cohort: item.cohort,
          start_date: item.start_date,
          status: item.status,
          notes: item.notes,
          research_area: item.research_area,
          supervisor: item.supervisor,
        });
      }
    }

    // Create a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Students.xlsx";
    link.click();
  }

  async function handleWeeklyEntries(): Promise<void> {
    const weeklyEntries = await getAllWeeklyEntries();

    // Create Excel file with all courses

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Weekly entries");

    // Define columns
    worksheet.columns = [
      { header: "id", key: "id", width: 20 },
      { header: "student_id", key: "student_id", width: 50 },
      { header: "week_start_date", key: "week_start_date", width: 50 },
      { header: "goals_set_json", key: "goals_set_json", width: 50 },
      {
        header: "per_goal_status_json",
        key: "per_goal_status_json",
        width: 50,
      },
      { header: "overall_status", key: "overall_status", width: 50 },
      {
        header: "progress_notes",
        key: "progress_notes",
        width: 50,
      },
      {
        header: "next_week_goals_json",
        key: "next_week_goals_json",
        width: 50,
      },
    ];

    // Add content of instructors into worksheet
    if (weeklyEntries) {
      for (const item of weeklyEntries) {
        worksheet.addRow({
          id: item.id,
          team_id: item.team_id,
          week_start_date: item.week_start_date,
          goals_set_json: item.goals_set_json,
          per_goal_status_json: item.per_goal_status_json,
          overall_status: item.overall_status,
          progress_notes: item.progress_notes,
          next_week_goals_json: item.next_week_team_goals_json,
        });
      }
    }

    // Create a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "WeeklyEntries.xlsx";
    link.click();
  }

  async function handleTeamWeeklyEntries(): Promise<void> {
    const weeklyTeamEntries = await getAllTeamWeeklyEntries();

    // Create Excel file with all courses

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Team Weekly entries");

    // Define columns
    worksheet.columns = [
      { header: "id", key: "id", width: 20 },
      { header: "team_id", key: "team_id", width: 50 },
      { header: "week_start_date", key: "week_start_date", width: 50 },
      { header: "team_goals_set_json", key: "team_goals_set_json", width: 50 },
      { header: "team_overall_status", key: "team_overall_status", width: 50 },
      { header: "team_progress_notes", key: "team_progress_notes", width: 50 },
      {
        header: "next_week_team_goals_json",
        key: "next_week_team_goals_json",
        width: 50,
      },
      // Add more columns as needed
    ];

    // Add content of instructors into worksheet
    if (weeklyTeamEntries) {
      for (const item of weeklyTeamEntries) {
        worksheet.addRow({
          id: item.id,
          team_id: item.team_id,
          week_start_date: item.week_start_date,
          team_goals_set_json: item.team_goals_set_json,
          team_overall_status: item.team_overall_status,
          team_progress_notes: item.team_progress_notes,
          next_week_team_goals_json: item.next_week_team_goals_json,
        });
      }
    }

    // Create a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "WeeklyTeamEntries.xlsx";
    link.click();
  }

  async function handleTeams(): Promise<void> {
    const teams = await getAllTeams();

    // Create Excel file with all courses

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Teams");

    // Define columns
    worksheet.columns = [
      { header: "id", key: "id", width: 20 },
      { header: "team_name", key: "team_name", width: 50 },
      { header: "description", key: "description", width: 50 },
      { header: "budget", key: "budget", width: 50 },

      // Add more columns as needed
    ];

    // Add content of instructors into worksheet
    if (teams) {
      for (const item of teams) {
        worksheet.addRow({
          id: item.id,
          team_name: item.team_name,
          description: item.description,
          budget: item.budget,
        });
      }
    }

    // Create a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Teams.xlsx";
    link.click();
  }

  function handleTeamMemberships(): void {
    throw new Error("Function not implemented.");
  }

  async function handleCourses(): Promise<void> {
    const courses = await getAllCourses();

    // Create Excel file with all courses

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Courses");

    // Define columns
    worksheet.columns = [
      { header: "id", key: "id", width: 20 },
      { header: "name", key: "name", width: 50 },
      { header: "description", key: "description", width: 50 },
      { header: "start_date", key: "start_date", width: 20 },

      // Add more columns as needed
    ];

    // Add content of courses into worksheet
    if (courses) {
      for (const item of courses) {
        worksheet.addRow({
          id: item.id,
          name: item.name,
          description: item.description,
          start_date: item.start_date,
        });
      }
    }

    // Create a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Courses.xlsx";
    link.click();
  }

  async function handleInstructors(): Promise<void> {
    const instructors = await getAllInstructors();

    // Create Excel file with all courses

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Instructors");

    // Define columns
    worksheet.columns = [
      { header: "id", key: "id", width: 20 },
      { header: "full_name", key: "full_name", width: 50 },
      { header: "email", key: "email", width: 50 },

      // Add more columns as needed
    ];

    // Add content of instructors into worksheet
    if (instructors) {
      for (const item of instructors) {
        worksheet.addRow({
          id: item.id,
          full_name: item.full_name,
          email: item.email,
        });
      }
    }

    // Create a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Instructors.xlsx";
    link.click();
  }

  return (
    <div className="p-3">
      <h1>Reports</h1>
      <div className="flex flex-col gap-2 border-1 border-gray-200 rounded-xl p-3 m-3 background">
        <div className="flex flex-col gap-3 w-1/4">
          <h2
            className="border-1 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-200 p-2"
            onClick={() => handleStudents()}
          >
            Students
          </h2>
          <h2
            className="border-1 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-200 p-2"
            onClick={() => handleCourses()}
          >
            Courses
          </h2>
          <h2
            className="border-1 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-200 p-2"
            onClick={() => handleInstructors()}
          >
            Instructors
          </h2>
          <h2
            className="border-1 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-200 p-2"
            onClick={() => handleWeeklyEntries()}
          >
            Weekly entries
          </h2>
          <h2
            className="border-1 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-200 p-2"
            onClick={() => handleTeams()}
          >
            Teams
          </h2>
          <h2
            className="border-1 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-200 p-2"
            onClick={() => handleTeamMemberships()}
          >
            Team memberships
          </h2>{" "}
          <h2
            className="border-1 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-200 p-2"
            onClick={() => handleTeamWeeklyEntries()}
          >
            Team weekly entries
          </h2>
        </div>
      </div>
    </div>
  );
};
