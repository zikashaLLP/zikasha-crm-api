const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");

const { Op } = require("sequelize");
const Inquiry = require("../models/Inquiry");
const Customer = require("../models/Customer");
const Category = require("../models/Category");
const Agency = require("../models/Agency");

exports.createInquiry = async (req, res) => {
  try {
    const { category_id, customer_id, followup_date, location } = req.body;
    const agency_id = req.user.agencyId;
    const user_id = req.user.userId; // Assuming req.user contains the authenticated user

    const inquiry = await Inquiry.create({
      category_id,
      customer_id,
      user_id,
      followup_date,
      location,
      agency_id,
    });

    res.status(201).json(inquiry);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating inquiry", error: err.message });
  }
};

exports.getInquiries = async (req, res) => {
  try {
    const agency_id = req.user.agencyId;
    const user_id = req.user.userId;
    const {
      category_id,
      customer_id,
      followup_date_start,
      followup_date_end,
      exclude_categories,
      sort_by = "createdAt",
      sort_order = "desc",
      limit,
      page,
    } = req.query;

    const where = { agency_id, user_id };

    if (category_id) where.category_id = category_id;
    if (customer_id) where.customer_id = customer_id;

    // Handle followup_date filters
    if (followup_date_start || followup_date_end) {
      // Filter for date range
      where.followup_date = {};

      if (followup_date_start) {
        where.followup_date[Op.gte] = followup_date_start;
      }

      if (followup_date_end) {
        where.followup_date[Op.lte] = followup_date_end;
      }
    }

    if (exclude_categories) {
      // Exclude specific categories
      where[Op.or] = [
        { category_id: null },
        {
          category_id: {
            [Op.notIn]: exclude_categories.split(",").map(Number),
          },
        },
      ];
    }

    // Build base query options
    const queryOptions = {
      where,
      include: [Customer, Category],
      order: [[sort_by, sort_order]],
    };

    // Only add pagination if both limit and page are provided
    if (limit && page) {
      const parsedLimit = parseInt(limit);
      const parsedPage = parseInt(page);
      const offset = (parsedPage - 1) * parsedLimit;

      queryOptions.limit = parsedLimit;
      queryOptions.offset = offset;

      // Get paginated results with count
      const { rows: inquiries, count: total } = await Inquiry.findAndCountAll(
        queryOptions
      );

      res.json({
        inquiries,
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
        isPaginated: true,
      });
    } else {
      // Get all inquiries without pagination.
      const inquiries = await Inquiry.findAll(queryOptions);

      res.json({
        inquiries,
        total: inquiries.length,
        isPaginated: false,
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching inquiries", error: err.message });
  }
};

exports.getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const agency_id = req.user.agencyId;

    const inquiry = await Inquiry.findOne({
      where: { id, agency_id },
      include: [Customer, Category],
    });

    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    res.json(inquiry);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching inquiry", error: err.message });
  }
};

exports.updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const agency_id = req.user.agencyId;
    const { category_id, customer_id, followup_date, location } = req.body;

    const inquiry = await Inquiry.findOne({ where: { id, agency_id } });
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    await inquiry.update({
      category_id,
      customer_id,
      followup_date,
      location,
    });
    res.json(inquiry);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating inquiry", error: err.message });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const agency_id = req.user.agencyId;

    const inquiry = await Inquiry.findOne({ where: { id, agency_id } });
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    await inquiry.destroy();
    res.json({ message: "Inquiry deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting inquiry", error: err.message });
  }
};

// Traverse and import inquiries from an external source (e.g., CSV, XLS, XLSX files)
exports.importInquiries = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const agency_id = req.user.agencyId;
    const user_id = req.user.userId;

    const file = req.files.file;
    const ext = path.extname(file.name).toLowerCase();

    let data;
    if (ext === ".csv") {
      data = await parseCSVBuffer(file.data);
    } else if ([".xlsx", ".xls"].includes(ext)) {
      data = parseXLSXBuffer(file.data);
    } else {
      return res.status(400).json({ message: "Invalid file type" });
    }

    await processInquiries(data, agency_id, user_id);

    res.json({ message: "Inquiries imported successfully!", data });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error importing inquiries", error: err.message });
  }
};

// Utility function to parse uploaded files (CSV, XLS, XLSX)
function parseCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = require("stream");
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    bufferStream
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim().toLowerCase(),
          mapValues: ({ value }) => value.trim(),
        })
      )
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

function parseXLSXBuffer(buffer) {
  try {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert headers to lowercase for consistency
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    return jsonData.map((row) => {
      const lowercaseRow = {};
      Object.keys(row).forEach((key) => {
        lowercaseRow[key.toLowerCase()] =
          typeof row[key] === "string" ? row[key].trim() : row[key];
      });
      return lowercaseRow;
    });
  } catch (error) {
    throw new Error(`Error parsing XLSX file: ${error.message}`);
  }
}

function isValidDate(dateString) {
  return !isNaN(Date.parse(dateString));
}

function isValidNumber(value) {
  return !isNaN(value) && value !== null && value !== "";
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

async function processInquiries(data, agency_id, user_id) {
  for (const row of data) {
    const { name, phone, location, category, followup_date } = row;

    const agency = await Agency.findByPk(agency_id);

    // Create new customer if name and phone are provided
    if (!isNonEmptyString(name) || !isNonEmptyString(phone)) {
      continue; // Skip rows without valid name or phone
    }

    let customer = await Customer.create({
      name,
      phone,
      agency_id,
    });

    const customer_id = customer.id;
    let category_id = null;

    if (isNonEmptyString(category)) {
      // Find category
      const categoryRecord = await Category.findOne({
        where: { name: category, agency_id },
      });
      if (categoryRecord) {
        category_id = categoryRecord.id;
      } else {
        category_id = null;
      }
    } else {
      // Find default category from agency settings
      const defaultCategoryId = agency?.settings?.category;
      if (defaultCategoryId) {
        const defaultCategory = await Category.findOne({
          where: { id: defaultCategoryId, agency_id },
        });
        if (defaultCategory) {
          category_id = defaultCategory.id;
        } else {
          category_id = null;
        }
      } else {
        category_id = null;
      }
    }

    let parsedFollowupDate = isValidDate(followup_date)
      ? new Date(followup_date)
      : null;
    // set followup_date time to 9 AM if valid date
    if (parsedFollowupDate) {
      parsedFollowupDate.setHours(9, 0, 0, 0);
    } else {
      // Fallback to agency's default followup_date if available
      const defaultFollowupDays = agency?.settings?.followup_date;
      if (
        isNonEmptyString(defaultFollowupDays) &&
        "tomorrow" === defaultFollowupDays.toLowerCase()
      ) {
        parsedFollowupDate = new Date();
        parsedFollowupDate.setDate(parsedFollowupDate.getDate() + 1);
        parsedFollowupDate.setHours(9, 0, 0, 0);
      } else {
        parsedFollowupDate = new Date();
        parsedFollowupDate.setHours(9, 0, 0, 0);
      }
    }

    // parsed location or fallback to agency default location
    let parsedLocation = location;
    if (isNonEmptyString(parsedLocation)) {
      parsedLocation = location;
    } else {
      // Fallback to agency's default location if available
      const defaultLocation = agency?.settings?.location;
      if (isNonEmptyString(defaultLocation)) {
        parsedLocation = defaultLocation;
      } else {
        parsedLocation = "";
      }
    }

    // Create the inquiry
    await Inquiry.create({
      category_id: isValidNumber(category_id) ? category_id : null,
      customer_id,
      user_id,
      followup_date: parsedFollowupDate,
      location: parsedLocation,
      agency_id,
    });
  }
}
