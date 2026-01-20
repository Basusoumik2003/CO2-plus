const express = require("express");
const router = express.Router();

const {
    createTicket,
    getAllTickets,
    getTicketById,
    updateTicket,
    deleteTicket
} = require("../controllers/adminTicketController");

// Public / Org / Contact form
router.post("/", createTicket);

// Admin
router.get("/", getAllTickets);
router.get("/:ticket_id", getTicketById);
router.put("/:ticket_id", updateTicket);
router.delete("/:ticket_id", deleteTicket);

module.exports = router;
