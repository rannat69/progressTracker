// This component is used to import and export dtatabase elements to/from excel files
"use client";

import React, { useState } from "react";

import * as XLSX from "xlsx";
import ExcelJS, { Workbook } from "exceljs";

export async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
  // Open file from local drive.

  const file = e.target.files?.[0];

  if (!file) {
    throw new Error("No file detected.");
  }

  const reader = new FileReader();

  const errors: string[] = [];

  const validateRequest = (item: any): boolean => {
    const validKeys = [
      "title",
      "description",
      "team",
      "date",
      "total_cost",
      "item_title",
      "item_description",
      "item_cost",
      "item_link",
    ];

    // Check for missing required fields
    if (!item.title || !item.item_title) {
      errors.push("Error: Missing required fields for a course");
      return false;
    }

    // Check for invalid properties
    const courseKeys = Object.keys(item);
    for (const key of courseKeys) {
      if (!validKeys.includes(key)) {
        errors.push(`Error: Invalid property "${key}" found in course object.`);
        return false;
      }
    }
    return true;
  };

  reader.onload = async (event) => {
    if (event && event.target) {
      const data = new Uint8Array(event.target.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      // Course import

      let sheetName = workbook.SheetNames[0];
      let sheet = workbook.Sheets[sheetName];
      const sheetDataRequest: any[] = XLSX.utils.sheet_to_json(sheet);

      for (const item of sheetDataRequest) {
        console.log(item);

        // if id is present, update
        if (validateRequest(item)) {
          // if id not present, create
          createCourse(item);
        } else {
          break;
        }
      }

      if (errors.length > 0) {
      } else {
      }

    }
  };
  reader.readAsArrayBuffer(file);
}

const createRequest = async (courseData: Course) => {
  try {
    console.log("create course, ", courseData);

    const response = await fetch("/api/course/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (data.error) {
      setErrorMessage(data.error);
    }

    return data; // Return the newly created course ID or object
  } catch (error) {
    console.error("Error adding course:", error);
    throw error; // Rethrow the error for handling in the caller
  }
};

export async function handleExport(): Promise<void> {
  // Read DB, then export in Excel file

  console.log("handle export");

  // put students in an Excel file in a tab, and courses in another tab
  const workbook = new ExcelJS.Workbook();

  console.log("workbook", workbook);

  createSheetStudent(workbook);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Import.Request.xlsx";
  link.click();

  function createSheetStudent(workbook: Workbook) {
    const worksheet = workbook.addWorksheet("Request");

    // Define columns
    worksheet.columns = [
      { header: "title", key: "title", width: 15 },
      { header: "description", key: "description", width: 30 },
      { header: "team", key: "team", width: 50 },
      { header: "date", key: "date", width: 50 },
      { header: "total_cost", key: "total_cost", width: 50 },
      { header: "item_title", key: "unoff_name", width: 50 },
      { header: "item_description", key: "program", width: 30 },
      { header: "item_cost", key: "email", width: 30 },
      { header: "item_link", key: "date_joined", width: 50 },

      // Add more columns as needed
    ];

    // Add content of courses into worksheet

    const headerRow = worksheet.getRow(1);

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCCCCC" }, // Light gray color
      };
      cell.font = { bold: true };
    });

    // add 100 empty rows to have control fields
    for (let i = 0; i < 100; i++) {
      worksheet.addRow({});
    }

    const rows = worksheet.getRows(
      0,
      worksheet.lastRow?.number ? worksheet.lastRow?.number + 1 : 0
    );

    if (rows) {
      for (const row of rows) {
        if (row.number && row.number > 1) {
          row.getCell("A").dataValidation = {
            type: "textLength",
            operator: "greaterThan",
            formulae: [0], // Ensures that the string length is greater than 0 (i.e., not empty)
            showInputMessage: true,
            promptTitle: "String Input",
            prompt: "This field is mandatory; please enter a value",
            errorStyle: "error",
            errorTitle: "Mandatory Field",
            error: "This field cannot be empty",
            showErrorMessage: true,
          };

          row.getCell("C").dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: ['"IoT, EdTech, AI/ML"'],
            errorStyle: "error",
            errorTitle: "Team",
            error: "The value must be a team",
            showErrorMessage: true,
          };

          row.getCell("D").dataValidation = {
            type: "date",
            operator: "between",
            allowBlank: true,
            showInputMessage: true,
            formulae: [new Date(2020, 0, 1), new Date(2030, 11, 31)], // Dates between January 1, 2020, to December 31, 2030
            promptTitle: "Date",
            prompt: "The value must be a valid date",
            errorStyle: "error",
            errorTitle: "Date",
            error: "The value must be a valid date",
            showErrorMessage: true,
          };

          row.getCell("E").dataValidation = {
            type: "decimal",
            operator: "between",
            allowBlank: true,
            showInputMessage: true,
            formulae: [0, 9999999],
            promptTitle: "Cost",
            prompt: "The value must a number",
            errorStyle: "error",
            errorTitle: "Cost",
            error: "The value must be a number",
            showErrorMessage: true,
          };

          row.getCell("F").dataValidation = {
            type: "textLength",
            operator: "greaterThan",
            formulae: [0], // Ensures that the string length is greater than 0 (i.e., not empty)
            showInputMessage: true,
            promptTitle: "String Input",
            prompt: "This field is mandatory; please enter a value",
            errorStyle: "error",
            errorTitle: "Mandatory Field",
            error: "This field cannot be empty",
            showErrorMessage: true,
          };
        }
      }
    }
  }
}
