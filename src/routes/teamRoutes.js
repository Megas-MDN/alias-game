const { Router } = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const teamController = require("../controllers/teamController");

const router = Router();

router.post("/", authenticateToken, teamController.createTeamController);
router.get("/searchTeam", authenticateToken, teamController.getSpecificTeamController);
router.get("/getAllTeams", authenticateToken, teamController.getAllTeamsController);
router.patch("/updateSpecificTeamField", authenticateToken, teamController.updateSpecificTeamFieldController);
router.delete("/deleteTeam", authenticateToken, teamController.deleteTeamController);

module.exports = router;