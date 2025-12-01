// This component is used to import and export dtatabase elements to/from excel files
"use client";

import React, { useState } from "react";

import * as XLSX from "xlsx";
import ExcelJS, { Workbook } from "exceljs";
import {
  createRequest,
  createRequestItems,
  getRecentRequests,
} from "./db/requests";
import { getTeamIdFromName } from "./db/teams";
import { getSessionId } from "./db/sessions";
import { getUserFromEmail } from "./db/user";

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
      errors.push("Error: Missing title or item title");
    }

    if (item.total_cost <= 0) {
      errors.push("Error: Total cost must be positive");
    }

    if (item.item_cost <= 0) {
      errors.push("Error: Item cost must be positive");
    }

    // Check for invalid properties
    const courseKeys = Object.keys(item);
    for (const key of courseKeys) {
      if (!validKeys.includes(key)) {
        errors.push(`Error: Invalid property "${key}" found in course object.`);
      }
    }

    console.log("errors", errors);

    if (errors && errors.length > 0) {
      return false;
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
        // if id is present, update
        if (validateRequest(item)) {
          // if id not present, create
          const excelRes = await createRequestFromExcel(item);

          if (excelRes) {
            console.log("Request created successfully.");
          } else {
            console.error("Request error.");
            return false;
          }
        } else {
          return false;
        }
      }
    }
  };
  reader.readAsArrayBuffer(file);

  return true;
}

const createRequestFromExcel = async (requestData: any) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");

    const dataSession = await getSessionId(sessionId);
    let role = "";
    let email = "";
    if (!dataSession) {
      return null;
    } else {
      role = dataSession[0].role;
      email = dataSession[0].user_email;
    }

    // create request and item request

    const team = await getTeamIdFromName(requestData.team);

    if (!team) {
      console.error("Team not found");
      return null;
    }

    const dataUser = await getUserFromEmail(email);
    if (
      !dataUser ||
      !dataUser.data ||
      !Array.isArray(dataUser.data) ||
      dataUser.data.length === 0
    ) {
      console.error("Email user not found");
      return null;
    }

    // search for an existing request with same title and description from one minute ago
    const recentRequestRes = await getRecentRequests(
      requestData.title,
      requestData.description
    );

    let requestId;

    if (recentRequestRes && recentRequestRes.length > 0) {
      // if already exists, do not recreate request, add item to existing
      requestId = recentRequestRes[0].id;
    } else {
      // make an insert into table requests in supabase
      const createRequestRes = await createRequest(
        requestData.total_cost,
        new Date().toISOString().split("T")[0],
        team[0].id,
        requestData.title,
        requestData.description,
        role,
        (dataUser.data as any[])[0].id
      );

      if (!createRequestRes) {
        console.error("Error creating request");
        return null;
      } else {
        requestId = (createRequestRes as any[])[0].id;
      }
    }

    const items = [
      {
        title: requestData.item_title,
        description: requestData.item_description,
        cost: requestData.item_cost,
        link: requestData.item_link,
      },
    ];

    if (!requestId) {
      return false;
    } else {
      await createRequestItems(requestId, items);

      return true;
    }
  } catch (error) {
    console.error("Error adding request:", error);
    throw error; // Rethrow the error for handling in the caller
  }
};

export async function handleExport(): Promise<void> {
  // Read DB, then export in Excel file

  // put students in an Excel file in a tab, and courses in another tab
  const workbook = new ExcelJS.Workbook();

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
            prompt:
              "This field is mandatory. If several lines have same title and description, only one request will be created.",
            errorStyle: "error",
            errorTitle: "Mandatory Field",
            error: "This field cannot be empty",
            showErrorMessage: true,
          };

          row.getCell("B").dataValidation = {
            type: "textLength",
            operator: "greaterThan",
            formulae: [0], // Ensures that the string length is greater than 0 (i.e., not empty)
            showInputMessage: true,
            promptTitle: "String Input",
            prompt:
              "This field is mandatory. If several lines have same title and description, only one request will be created.",
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
