const AuditLog = require("../models/AuditLog");

async function writeAuditLog({ userId, action, entityType, entityId, metadata }) {
  try {
    await AuditLog.create({ userId, action, entityType, entityId, metadata });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
}

module.exports = { writeAuditLog };
